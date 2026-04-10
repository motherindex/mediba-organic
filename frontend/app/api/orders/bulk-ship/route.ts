// app/api/orders/bulk-ship/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getResendApiKey, getResendFromEmail } from "@/lib/settings";
import { orderShippedEmail } from "@/app/api/webhook/route";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  const text = await file.text();
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length < 2) {
    return NextResponse.json({
      error: "CSV must have a header row and at least one data row."
    }, { status: 400 });
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const orderIdIdx = headers.indexOf("order_id");
  const trackingIdx = headers.indexOf("tracking_number");
  const carrierIdx = headers.indexOf("carrier");

  if (orderIdIdx === -1 || trackingIdx === -1) {
    return NextResponse.json({
      error: "CSV must have columns: order_id, tracking_number (carrier is optional)"
    }, { status: 400 });
  }

  let resendKey: string | null = null;
  try { resendKey = getResendApiKey(); } catch {}
  const fromEmail = getResendFromEmail();

  const results: { orderId: string; success: boolean; error?: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const orderId = cols[orderIdIdx];
    const trackingNumber = cols[trackingIdx];
    const carrier = carrierIdx !== -1 ? (cols[carrierIdx] || "USPS") : "USPS";

    if (!orderId || !trackingNumber) {
      results.push({ orderId: orderId || `row ${i + 1}`, success: false, error: "Missing order_id or tracking_number" });
      continue;
    }

    try {
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "shipped",
          tracking_number: trackingNumber,
          carrier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error || !order) {
        results.push({ orderId, success: false, error: error?.message ?? "Order not found" });
        continue;
      }

      if (resendKey && order.customer_email) {
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
            html: orderShippedEmail({ customerName, orderId, trackingNumber, carrier }),
          }),
        });
      }

      results.push({ orderId, success: true });
    } catch (err: any) {
      results.push({ orderId, success: false, error: err.message });
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  return NextResponse.json({ results, succeeded, failed });
}
