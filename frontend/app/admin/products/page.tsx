import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
              Admin Products
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Manage Products</h1>
            <p className="mt-3 text-[#6B7D52]">
              Add, edit, and remove store products.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex rounded-xl bg-[#556B2F] px-5 py-3 text-center font-medium text-white transition hover:bg-[#445624]"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] shadow-sm">
          {products && products.length > 0 ? (
            <table className="min-w-full text-left">
              <thead className="border-b border-[#E7DCC8] text-sm text-[#6B7D52]">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product: any) => (
                  <tr key={product.id} className="border-b border-[#F1E7D7] align-top">
                    <td className="px-6 py-4">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/200x200.png?text=Product"
                        }
                        alt={product.name}
                        className="h-14 w-14 min-w-14 rounded-lg object-cover"
                      />
                    </td>

                    <td className="px-6 py-4 font-medium">{product.name}</td>

                    <td className="px-6 py-4 font-semibold text-[#8B6B2C] whitespace-nowrap">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-[#556B2F] hover:text-[#8B6B2C]"
                        >
                          Edit
                        </Link>

                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center">
              <p className="text-[#6B7D52]">
                No products yet. Add your first product.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}