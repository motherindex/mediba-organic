import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getEasyPostApiKey, getResendApiKey, getResendFromEmail } from "@/lib/settings";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id, shipment_id, rate_id } = await request.json();
  if (!order_id || !shipment_id || !rate_id) {
    return NextResponse.json({ error: "order_id, shipment_id, and rate_id are required." }, { status: 400 });
  }

  let apiKey: string;
  try { apiKey = getEasyPostApiKey(); } catch {
    return NextResponse.json({ error: "EasyPost API key not configured." }, { status: 503 });
  }

  // Purchase the label
  const purchaseRes = await fetch(`https://api.easypost.com/v2/shipments/${shipment_id}/buy`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rate: { id: rate_id } }),
  });

  const purchased = await purchaseRes.json();

  if (!purchased.postage_label?.label_url) {
    console.error("[easypost/label] Purchase failed:", purchased);
    return NextResponse.json({
      error: "Label purchase failed.",
      detail: purchased.error ?? purchased,
    }, { status: 500 });
  }

  const labelUrl = purchased.postage_label.label_url;
  const trackingNumber = purchased.tracking_code;
  const carrier = purchased.selected_rate?.carrier ?? "USPS";

  // Update order in Supabase
  await supabaseAdmin
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      carrier,
      label_url: labelUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order_id);

  // Fetch order for email
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .single();

  // Send shipped email via Resend
  if (order?.customer_email) {
    let resendKey: string | null = null;
    try { resendKey = getResendApiKey(); } catch {}
    if (resendKey) {
      const fromEmail = getResendFromEmail();
      const customerName = order.customer_name ?? order.customer_email;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: order.customer_email,
          subject: "Your Mediba's Organic Order Has Shipped 📦",
          html: shippedEmailHtml({ customerName, orderId: order_id, trackingNumber, carrier }),
        }),
      });
    }
  }

  return NextResponse.json({ labelUrl, trackingNumber, carrier });
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
