// app/api/orders/export/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_ids } = await request.json();
  if (!Array.isArray(order_ids) || order_ids.length === 0) {
    return NextResponse.json({ error: "No orders selected." }, { status: 400 });
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .in("id", order_ids);

  if (error || !orders?.length) {
    return NextResponse.json({ error: "Orders not found." }, { status: 404 });
  }

  const headers = [
    "to_name", "to_street1", "to_street2", "to_city", "to_state",
    "to_zip", "to_country", "to_phone", "to_email",
    "carrier", "service",
    "parcel.weight", "parcel.length", "parcel.width", "parcel.height",
    "options.print_custom_1",
  ];

  const rows: string[][] = [headers];

  for (const order of orders) {
    let addr: any = {};
    try { addr = order.shipping_address ? JSON.parse(order.shipping_address) : {}; } catch {}
    rows.push([
      order.shipping_name ?? order.customer_name ?? "",
      addr.line1 ?? "",
      addr.line2 ?? "",
      addr.city ?? "",
      addr.state ?? "",
      addr.postal_code ?? "",
      addr.country ?? "US",
      "",
      order.customer_email ?? "",
      "USPS",
      "GroundAdvantage",
      "16", "10", "8", "4",
      `Order #${order.id.slice(0, 8).toUpperCase()}`,
    ]);
  }

  const csv = rows
    .map((row) =>
      row.map((cell) => {
        const str = String(cell ?? "").replace(/"/g, '""');
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str}"` : str;
      }).join(",")
    ).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="easypost-orders-${Date.now()}.csv"`,
    },
  });
}
