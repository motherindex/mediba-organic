import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPromotionsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: promotions }, { data: products }] = await Promise.all([
    supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").order("name"),
  ]);

  const productMap = new Map((products ?? []).map((p: any) => [p.id, p.name]));

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
              Promotions
            </p>
            <h1 className="mt-2 text-4xl font-bold">Manage Promotions</h1>
            <p className="mt-3 text-[#6B7D52]">
              Create, review, and update store discounts and promotional offers.
            </p>
          </div>

          <Link
            href="/admin/promotions/new"
            className="inline-flex rounded-xl bg-[#556B2F] px-5 py-3 font-medium text-white transition hover:bg-[#445624]"
          >
            Create Promotion
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] shadow-sm">
          {promotions && promotions.length > 0 ? (
            <table className="min-w-full text-left">
              <thead className="border-b border-[#E7DCC8] text-sm text-[#6B7D52]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Start</th>
                  <th className="px-6 py-4">End</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {promotions.map((promotion: any) => (
                  <tr key={promotion.id} className="border-b border-[#F1E7D7] align-top">
                    <td className="px-6 py-4 font-medium">
                      {productMap.get(promotion.product_id) ?? "Unknown Product"}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {promotion.type?.replaceAll("_", " ")}
                    </td>

                    <td className="px-6 py-4 font-semibold text-[#8B6B2C]">
                      {promotion.type === "percent_off"
                        ? `${promotion.value}%`
                        : promotion.type === "amount_off"
                        ? `$${Number(promotion.value ?? 0).toFixed(2)}`
                        : "BOGO"}
                    </td>

                    <td className="px-6 py-4">
                      {promotion.start_date
                        ? new Date(promotion.start_date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      {promotion.end_date
                        ? new Date(promotion.end_date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/promotions/${promotion.id}`}
                          className="rounded-lg border border-[#556B2F] px-4 py-2 text-sm font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center">
              <p className="text-[#6B7D52]">
                No promotions yet. Create your first promotion.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}