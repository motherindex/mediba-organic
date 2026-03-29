// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getSettings } from "@/lib/settings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  // Pull keys from Supabase settings
  const {
    stripe_secret_key,
    stripe_webhook_secret,
    resend_api_key,
    resend_from_email,
  } = await getSettings([
    "stripe_secret_key",
    "stripe_webhook_secret",
    "resend_api_key",
    "resend_from_email",
  ]);

  // Fall back to env for local dev testing
  const webhookSecret = stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET!;
  const stripeKey = stripe_secret_key || process.env.STRIPE_SECRET_KEY!;

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email ?? null;
    const customerName = session.customer_details?.name ?? null;
    const shippingAddress = session.shipping_details?.address ?? null;
    const shippingName = session.shipping_details?.name ?? null;
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
    const shippingCost = session.shipping_cost?.amount_total
      ? session.shipping_cost.amount_total / 100
      : 0;

    let cartItems: { id: string; quantity: number }[] = [];
    try {
      cartItems = JSON.parse(session.metadata?.cart ?? "[]");
    } catch {
      cartItems = [];
    }

    // Save order to Supabase
    const orderId = crypto.randomUUID();
    for (const item of cartItems) {
      await supabase.from("orders").insert({
        id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: amountTotal,
        customer_email: customerEmail,
        customer_name: customerName,
        status: "pending",
        stripe_session_id: session.id,
        shipping_name: shippingName,
        shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : null,
        shipping_cost: shippingCost,
      });
    }

    // Send order confirmation email via Resend
    if (resend_api_key && customerEmail) {
      const fromEmail = resend_from_email || "orders@resend.dev";
      await sendEmail({
        apiKey: resend_api_key,
        from: fromEmail,
        to: customerEmail,
        subject: "Your Mediba's Organic Order is Confirmed! 🌿",
        html: orderConfirmedEmail({
          customerName: customerName ?? customerEmail,
          orderId,
          amountTotal,
          shippingCost,
          shippingAddress,
        }),
      });
    }

    console.log(`✅ Order saved for ${customerEmail}`);
  }

  return NextResponse.json({ received: true });
}

// ─── Email sender ────────────────────────────────────────────────────────────

async function sendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
}

// ─── Email templates ─────────────────────────────────────────────────────────

function emailWrapper(content: string) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FDFAF5;border:1px solid #E8DFD0;border-radius:8px;overflow:hidden;">
      <div style="background:#3B2A1A;padding:28px 32px;">
        <h1 style="color:#C4924A;font-size:22px;margin:0;letter-spacing:0.05em;">Mediba's Organic</h1>
        <p style="color:#9E8B7A;font-size:13px;margin:4px 0 0;">Natural Skincare</p>
      </div>
      <div style="padding:32px;">
        ${content}
      </div>
      <div style="background:#F5EFE6;padding:20px 32px;border-top:1px solid #E8DFD0;text-align:center;">
        <p style="color:#9E8B7A;font-size:12px;margin:0;">
          Questions? Email us at <a href="mailto:medibaorganic@gmail.com" style="color:#C4924A;">medibaorganic@gmail.com</a>
        </p>
      </div>
    </div>
  `;
}

export function orderConfirmedEmail({
  customerName,
  orderId,
  amountTotal,
  shippingCost,
  shippingAddress,
}: {
  customerName: string;
  orderId: string;
  amountTotal: number;
  shippingCost: number;
  shippingAddress: any;
}) {
  const address = shippingAddress
    ? `${shippingAddress.line1 ?? ""}${shippingAddress.line2 ? ", " + shippingAddress.line2 : ""}, ${shippingAddress.city ?? ""}, ${shippingAddress.state ?? ""} ${shippingAddress.postal_code ?? ""}`
    : "—";

  return emailWrapper(`
    <h2 style="color:#3B2A1A;font-size:20px;margin:0 0 8px;">Order Confirmed ✓</h2>
    <p style="color:#7A6A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hi ${customerName}, thank you for your order! We're getting it ready.
    </p>
    <div style="background:#fff;border:1px solid #E8DFD0;border-radius:6px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order ID</p>
      <p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;font-weight:600;">${orderId.slice(0, 8).toUpperCase()}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Shipping to</p>
      <p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;">${address}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order Total</p>
      <p style="margin:0;font-size:18px;color:#C4924A;font-weight:700;">$${amountTotal.toFixed(2)}</p>
    </div>
    <p style="color:#7A6A5A;font-size:13px;line-height:1.7;margin:0;">
      We'll send you another email as soon as your order ships. 🌿
    </p>
  `);
}

export function orderShippedEmail({
  customerName,
  orderId,
  trackingNumber,
  carrier,
}: {
  customerName: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  return emailWrapper(`
    <h2 style="color:#3B2A1A;font-size:20px;margin:0 0 8px;">Your Order Has Shipped 📦</h2>
    <p style="color:#7A6A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hi ${customerName}, great news — your order is on its way!
    </p>
    <div style="background:#fff;border:1px solid #E8DFD0;border-radius:6px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order ID</p>
      <p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;font-weight:600;">${orderId.slice(0, 8).toUpperCase()}</p>
      ${carrier ? `<p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Carrier</p><p style="margin:0 0 16px;font-size:14px;color:#3B2A1A;">${carrier}</p>` : ""}
      ${trackingNumber ? `<p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Tracking Number</p><p style="margin:0;font-size:14px;color:#C4924A;font-weight:600;">${trackingNumber}</p>` : ""}
    </div>
    <p style="color:#7A6A5A;font-size:13px;line-height:1.7;margin:0;">
      Thank you for supporting Mediba's Organic. We hope you love your products! 🌿
    </p>
  `);
}

export function orderDeliveredEmail({ customerName, orderId }: { customerName: string; orderId: string }) {
  return emailWrapper(`
    <h2 style="color:#3B2A1A;font-size:20px;margin:0 0 8px;">Your Order Has Been Delivered 🎉</h2>
    <p style="color:#7A6A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hi ${customerName}, your Mediba's Organic order has been delivered. We hope you enjoy it!
    </p>
    <div style="background:#fff;border:1px solid #E8DFD0;border-radius:6px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order ID</p>
      <p style="margin:0;font-size:14px;color:#3B2A1A;font-weight:600;">${orderId.slice(0, 8).toUpperCase()}</p>
    </div>
    <p style="color:#7A6A5A;font-size:13px;line-height:1.7;margin:0;">
      Loved your experience? Share Mediba's Organic with a friend. 🌿
    </p>
  `);
}

export function orderCancelledEmail({ customerName, orderId }: { customerName: string; orderId: string }) {
  return emailWrapper(`
    <h2 style="color:#3B2A1A;font-size:20px;margin:0 0 8px;">Order Cancelled</h2>
    <p style="color:#7A6A5A;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hi ${customerName}, your order has been cancelled. If this was a mistake or you have questions, please contact us.
    </p>
    <div style="background:#fff;border:1px solid #E8DFD0;border-radius:6px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#9E8B7A;">Order ID</p>
      <p style="margin:0;font-size:14px;color:#3B2A1A;font-weight:600;">${orderId.slice(0, 8).toUpperCase()}</p>
    </div>
    <p style="color:#7A6A5A;font-size:13px;line-height:1.7;margin:0;">
      Contact us at <a href="mailto:medibaorganic@gmail.com" style="color:#C4924A;">medibaorganic@gmail.com</a> and we'll sort it out. 🌿
    </p>
  `);
}