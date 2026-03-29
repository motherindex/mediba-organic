// app/api/shippo/label/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/settings";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Auth check
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  // order_ids is an array — supports bulk
  const orderIds: string[] = Array.isArray(body.order_ids) ? body.order_ids : [];
  const carrier = body.carrier ?? "usps"; // usps | ups | fedex
  const service = body.service ?? "usps_priority"; // carrier service level

  if (orderIds.length === 0) {
    return NextResponse.json({ error: "No orders provided." }, { status: 400 });
  }

  // Pull all settings at once
  const settings = await getSettings([
    "shippo_api_key",
    "shippo_from_name",
    "shippo_from_street",
    "shippo_from_city",
    "shippo_from_state",
    "shippo_from_zip",
    "shippo_from_phone",
    "resend_api_key",
    "resend_from_email",
  ]);

  if (!settings.shippo_api_key) {
    return NextResponse.json({ error: "Shippo API key not configured. Go to Settings to add it." }, { status: 503 });
  }

  if (!settings.shippo_from_street || !settings.shippo_from_city) {
    return NextResponse.json({ error: "Ship-from address not configured. Go to Settings to add it." }, { status: 503 });
  }

  // Fetch all orders
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .in("id", orderIds);

  if (ordersError || !orders?.length) {
    return NextResponse.json({ error: "Orders not found." }, { status: 404 });
  }

  const results: { orderId: string; labelUrl: string | null; trackingNumber: string | null; error?: string }[] = [];

  for (const order of orders) {
    let shippingAddress: any = null;
    try { shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch {}

    if (!shippingAddress) {
      results.push({ orderId: order.id, labelUrl: null, trackingNumber: null, error: "No shipping address on order." });
      continue;
    }

    try {
      // Create Shippo shipment
      const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
        method: "POST",
        headers: {
          Authorization: `ShippoToken ${settings.shippo_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address_from: {
            name: settings.shippo_from_name,
            street1: settings.shippo_from_street,
            city: settings.shippo_from_city,
            state: settings.shippo_from_state,
            zip: settings.shippo_from_zip,
            country: "US",
            phone: settings.shippo_from_phone,
          },
          address_to: {
            name: order.shipping_name ?? order.customer_name ?? "Customer",
            street1: shippingAddress.line1 ?? "",
            street2: shippingAddress.line2 ?? "",
            city: shippingAddress.city ?? "",
            state: shippingAddress.state ?? "",
            zip: shippingAddress.postal_code ?? "",
            country: shippingAddress.country ?? "US",
            email: order.customer_email ?? "",
          },
          parcels: [{
            length: "10",
            width: "8",
            height: "4",
            distance_unit: "in",
            weight: "1",
            mass_unit: "lb",
          }],
          async: false,
        }),
      });

      const shipment = await shipmentRes.json();

      if (!shipment.rates?.length) {
        results.push({ orderId: order.id, labelUrl: null, trackingNumber: null, error: "No rates available for this address." });
        continue;
      }

      // Pick cheapest rate by default
      const rate = shipment.rates.sort((a: any, b: any) => Number(a.amount) - Number(b.amount))[0];

      // Purchase label
      const transactionRes = await fetch("https://api.goshippo.com/transactions/", {
        method: "POST",
        headers: {
          Authorization: `ShippoToken ${settings.shippo_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate: rate.object_id,
          label_file_type: "PDF",
          async: false,
        }),
      });

      const transaction = await transactionRes.json();

      if (transaction.status !== "SUCCESS") {
        results.push({ orderId: order.id, labelUrl: null, trackingNumber: null, error: transaction.messages?.[0]?.text ?? "Label purchase failed." });
        continue;
      }

      const labelUrl = transaction.label_url;
      const trackingNumber = transaction.tracking_number;
      const carrierName = rate.provider;

      // Update order in Supabase
      await supabaseAdmin
        .from("orders")
        .update({
          status: "shipped",
          tracking_number: trackingNumber,
          carrier: carrierName,
          label_url: labelUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Send shipped email
      if (settings.resend_api_key && order.customer_email) {
        const fromEmail = settings.resend_from_email || "orders@resend.dev";
        const customerName = order.customer_name ?? order.customer_email;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.resend_api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: order.customer_email,
            subject: "Your Mediba's Organic Order Has Shipped 📦",
            html: shippedEmailHtml({ customerName, orderId: order.id, trackingNumber, carrier: carrierName }),
          }),
        });
      }

      results.push({ orderId: order.id, labelUrl, trackingNumber });

    } catch (err: any) {
      results.push({ orderId: order.id, labelUrl: null, trackingNumber: null, error: err.message ?? "Unknown error." });
    }
  }

  return NextResponse.json({ results });
}

function shippedEmailHtml({ customerName, orderId, trackingNumber, carrier }: {
  customerName: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FDFAF5;border:1px solid #E8DFD0;border-radius:8px;overflow:hidden;">
      <div style="background:#3B2A1A;padding:28px 32px;">
        <h1 style="color:#C4924A;font-size:22px;margin:0;">Mediba's Organic</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#3B2A1A;font-size:20px;margin:0 0 8px;">Your Order Has Shipped 📦</h2>
        <p style="color:#7A6A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">Hi ${customerName}, your order is on its way!</p>
        <div style="background:#fff;border:1px solid #E8DFD0;border-radius:6px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order ID</p>
          <p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;font-weight:600;">#${orderId.slice(0,8).toUpperCase()}</p>
          ${carrier ? `<p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Carrier</p><p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;">${carrier}</p>` : ""}
          ${trackingNumber ? `<p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Tracking Number</p><p style="margin:0;font-size:14px;color:#C4924A;font-weight:600;">${trackingNumber}</p>` : ""}
        </div>
        <p style="color:#7A6A5A;font-size:13px;line-height:1.7;margin:0;">Thank you for supporting Mediba's Organic. 🌿</p>
      </div>
      <div style="background:#F5EFE6;padding:20px 32px;border-top:1px solid #E8DFD0;text-align:center;">
        <p style="color:#9E8B7A;font-size:12px;margin:0;">Questions? <a href="mailto:medibaorganic@gmail.com" style="color:#C4924A;">medibaorganic@gmail.com</a></p>
      </div>
    </div>
  `;
}