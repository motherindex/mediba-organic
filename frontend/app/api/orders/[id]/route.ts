// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/settings";
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
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ order });
}

// PATCH — update order status + send email
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { status, tracking_number, carrier } = body;

  // Update order in Supabase
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      tracking_number: tracking_number ?? null,
      carrier: carrier ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email based on new status
  const { resend_api_key, resend_from_email } = await getSettings([
    "resend_api_key",
    "resend_from_email",
  ]);

  if (resend_api_key && order.customer_email) {
    const fromEmail = resend_from_email || "orders@resend.dev";
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
          Authorization: `Bearer ${resend_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: fromEmail, to: order.customer_email, subject, html }),
      });
    }
  }

  return NextResponse.json({ ok: true, order });
}