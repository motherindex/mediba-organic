import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function processSession(session) {
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("already processed: " + session.id);
    return "skipped";
  }

  const cart = JSON.parse(session.metadata?.cart ?? "[]");
  if (cart.length === 0) {
    console.log("no cart metadata: " + session.id);
    return "skipped";
  }

  const productIds = cart.map((i) => i.id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (productsError) {
    console.error("failed to fetch products: " + productsError.message);
    return "error";
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const customerEmail = session.customer_details?.email ?? null;
  const customerName = session.customer_details?.name ?? null;
  const shipping = session.collected_information?.shipping_details ?? session.shipping ?? null;
  const shippingName = shipping?.name ?? null;
  const shippingAddress = shipping?.address
    ? [
        shipping.address.line1,
        shipping.address.line2,
        shipping.address.city,
        shipping.address.state,
        shipping.address.postal_code,
        shipping.address.country,
      ].filter(Boolean).join(", ")
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
    console.error("insert failed: " + insertError.message);
    return "error";
  }

  console.log("inserted " + rows.length + " row(s) for " + customerEmail);
  return "inserted";
}

async function backfill() {
  console.log("fetching all paid sessions...\n");
  let inserted = 0, skipped = 0, errors = 0;
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const session of sessions.data) {
      if (session.payment_status !== "paid") { skipped++; continue; }

      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["shipping_cost"],
      });

      const result = await processSession(full);
      if (result === "inserted") inserted++;
      else if (result === "skipped") skipped++;
      else errors++;
    }

    hasMore = sessions.has_more;
    if (hasMore) startingAfter = sessions.data.at(-1).id;
  }

  console.log("\nInserted : " + inserted);
  console.log("Skipped  : " + skipped);
  console.log("Errors   : " + errors);
}

backfill().catch(console.error);