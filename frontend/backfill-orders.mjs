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

const SINCE = Math.floor(new Date("2026-04-11T16:09:00Z").getTime() / 1000);

async function backfill() {
  console.log("Fetching completed Stripe sessions since April 11...\n");
  let updated = 0, skipped = 0, errors = 0;
  let hasMore = true, startingAfter;

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: SINCE },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const session of sessions.data) {
      if (session.status !== "complete" || session.payment_status !== "paid") {
        skipped++; continue;
      }

      const orderId = session.metadata?.order_id;
      if (!orderId) {
        console.warn(`⚠️  No order_id on session ${session.id}`);
        skipped++; continue;
      }

      const { data: order } = await supabase
        .from("orders").select("id, status").eq("id", orderId).single();

      if (!order) {
        console.error(`❌ Order ${orderId} not in Supabase`);
        errors++; continue;
      }

      if (order.status === "paid") {
        console.log(`✅ ${orderId} already paid`);
        skipped++; continue;
      }

      const { error } = await supabase.from("orders").update({
        status: "paid",
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        paid_at: new Date(session.created * 1000).toISOString(),
      }).eq("id", orderId);

      if (error) {
        console.error(`❌ Failed ${orderId}:`, error.message);
        errors++;
      } else {
        console.log(`💚 Updated ${orderId} → paid`);
        updated++;
      }
    }

    hasMore = sessions.has_more;
    if (hasMore) startingAfter = sessions.data.at(-1).id;
  }

  console.log(`\nDone — Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}`);
}

backfill().catch(console.error);