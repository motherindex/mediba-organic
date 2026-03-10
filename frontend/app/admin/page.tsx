import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ count: productCount }, { count: promotionCount }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("promotions").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard Home</h1>
            <p className="mt-3 text-[#6B7D52]">
              Store overview for Mediba’s Organic.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/admin/products"
              className="rounded-xl bg-[#556B2F] px-5 py-3 text-center font-medium text-white transition hover:bg-[#445624]"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/promotions"
              className="rounded-xl border border-[#8B6B2C] px-5 py-3 text-center font-medium text-[#8B6B2C] transition hover:bg-[#8B6B2C] hover:text-white"
            >
              Manage Promotions
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
            <p className="text-sm font-medium text-[#6B7D52]">Total Products</p>
            <h2 className="mt-3 text-4xl font-bold text-[#3E2E17]">
              {productCount ?? 0}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
            <p className="text-sm font-medium text-[#6B7D52]">Active Promotions</p>
            <h2 className="mt-3 text-4xl font-bold text-[#3E2E17]">
              {promotionCount ?? 0}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
            <p className="text-sm font-medium text-[#6B7D52]">Recent Orders</p>
            <h2 className="mt-3 text-4xl font-bold text-[#3E2E17]">
              {recentOrders?.length ?? 0}
            </h2>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">Recent Orders</h2>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E7DCC8] text-[#6B7D52]">
                    <th className="pb-3 pr-4 font-medium">Order ID</th>
                    <th className="pb-3 pr-4 font-medium">Customer Email</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-[#F1E7D7] align-top">
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-4 pr-4 break-words">
                        {order.customer_email || "—"}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        {order.status || "pending"}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        ${Number(order.price ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-[#6B7D52]">No recent orders yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}