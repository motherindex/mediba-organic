// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getResendApiKey, getResendFromEmail } from "@/lib/settings";
import {
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from "@/app/api/webhook/route";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch single order
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ order });
}

// PATCH — update order status + send email
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const allowed = ["status", "tracking_number", "carrier", "label_url", "notes"];
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  const { status, tracking_number, carrier } = body;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email based on new status
  let resendKey: string | null = null;
  try { resendKey = getResendApiKey(); } catch {}

  if (resendKey && order.customer_email) {
    const fromEmail = getResendFromEmail();
    const customerName = order.customer_name ?? order.customer_email;
    const orderId = order.id;

    let subject = "";
    let html = "";

    if (status === "shipped") {
      subject = "Your Mediba's Organic Order Has Shipped 📦";
      html = orderShippedEmail({ customerName, orderId, trackingNumber: tracking_number, carrier });
    } else if (status === "delivered") {
      subject = "Your Mediba's Organic Order Has Been Delivered 🎉";
      html = orderDeliveredEmail({ customerName, orderId });
    } else if (status === "cancelled") {
      subject = "Your Mediba's Organic Order Has Been Cancelled";
      html = orderCancelledEmail({ customerName, orderId });
    }

    if (subject && html) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: fromEmail, to: order.customer_email, subject, html }),
      });
    }
  }

  return NextResponse.json({ ok: true, order });
}