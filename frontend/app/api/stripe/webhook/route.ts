// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });
        await handleCheckoutCompleted(fullSession);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Error processing webhook event:", err.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`Session ${session.id} already processed — skipping`);
    return;
  }

  const cart: { id: string; quantity: number }[] = JSON.parse(
    session.metadata?.cart ?? "[]"
  );

  if (cart.length === 0) {
    console.warn(`Session ${session.id} has no cart metadata`);
    return;
  }

  const productIds = cart.map((i) => i.id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (productsError) {
    console.error("Failed to fetch products:", productsError.message);
    throw productsError;
  }

  const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));

  const customerEmail = session.customer_details?.email ?? null;
  const customerName = session.customer_details?.name ?? null;
  const shippingName = session.shipping_details?.name ?? null;
  const shippingAddress = session.shipping_details?.address
    ? [
        session.shipping_details.address.line1,
        session.shipping_details.address.line2,
        session.shipping_details.address.city,
        session.shipping_details.address.state,
        session.shipping_details.address.postal_code,
        session.shipping_details.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const shippingCost = session.shipping_cost?.amount_total
    ? session.shipping_cost.amount_total / 100
    : null;

  const createdAt = new Date(session.created * 1000).toISOString();

  const rows = cart.map((item) => {
    const product = productMap.get(item.id);
    return {
      product_id: item.id,
      quantity: item.quantity,
      price: product ? Number(product.price) : 0,
      customer_email: customerEmail,
      customer_name: customerName,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      shipping_cost: shippingCost,
      status: "paid",
      stripe_session_id: session.id,
      created_at: createdAt,
    };
  });

  const { error: insertError } = await supabase.from("orders").insert(rows);

  if (insertError) {
    console.error("Failed to insert orders:", insertError.message);
    throw insertError;
  }

  console.log(`Created ${rows.length} order row(s) from session ${session.id} for ${customerEmail}`);
}