import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getEasyPostApiKey, getShipFromAddress } from "@/lib/settings";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id } = await request.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  let apiKey: string;
  try { apiKey = getEasyPostApiKey(); } catch {
    return NextResponse.json({ error: "EasyPost API key not configured." }, { status: 503 });
  }

  const shipFrom = await getShipFromAddress();
  if (!shipFrom.street || !shipFrom.city) {
    return NextResponse.json({ error: "Ship-from address not configured. Go to Settings." }, { status: 503 });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  let shippingAddress: any = null;
  try { shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch {}
  if (!shippingAddress) return NextResponse.json({ error: "No shipping address on order." }, { status: 400 });

  // Create EasyPost shipment (no purchase yet — just get rates)
  const shipmentRes = await fetch("https://api.easypost.com/v2/shipments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipment: {
        from_address: {
          name: shipFrom.name,
          street1: shipFrom.street,
          city: shipFrom.city,
          state: shipFrom.state,
          zip: shipFrom.zip,
          country: "US",
          phone: shipFrom.phone,
        },
        to_address: {
          name: order.shipping_name ?? order.customer_name ?? "Customer",
          street1: shippingAddress.line1 ?? "",
          street2: shippingAddress.line2 ?? "",
          city: shippingAddress.city ?? "",
          state: shippingAddress.state ?? "",
          zip: shippingAddress.postal_code ?? "",
          country: shippingAddress.country ?? "US",
          email: order.customer_email ?? "",
        },
        parcel: {
          length: 10,
          width: 8,
          height: 4,
          weight: 16, // oz — 1 lb default
        },
        carrier_accounts: [],
        options: {
          carrier_insurance: false,
        },
      },
    }),
  });

  const shipment = await shipmentRes.json();

  if (!shipment.id) {
    console.error("[easypost/rates] Shipment creation failed:", shipment);
    return NextResponse.json({ error: "Failed to create shipment.", detail: shipment }, { status: 500 });
  }

  // Filter to USPS rates only, sort by price
  const rates = (shipment.rates ?? [])
    .filter((r: any) => r.carrier === "USPS")
    .sort((a: any, b: any) => Number(a.rate) - Number(b.rate))
    .map((r: any) => ({
      id: r.id,
      service: r.service,
      carrier: r.carrier,
      rate: r.rate,
      currency: r.currency,
      delivery_days: r.delivery_days,
      est_delivery_date: r.est_delivery_date,
    }));

  return NextResponse.json({ shipment_id: shipment.id, rates });
}
