import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/product";
import { Promotion, getProductPricing } from "@/lib/pricing";

export default async function ShopPage() {
  const [{ data, error }, { data: promotionsData }] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("promotions").select("*"),
  ]);

  const promotions = (promotionsData ?? []) as Promotion[];

  const products = ((data ?? []) as Product[]).map((product) => {
    const pricing = getProductPricing({
      productId: product.id,
      basePrice: Number(product.price),
      promotions,
    });

    return {
      ...product,
      finalPrice: pricing.finalPrice,
      hasDiscount: pricing.hasDiscount,
      promotionType: pricing.promotion?.type ?? null,
      promotionValue: pricing.promotion?.value ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
            Shop
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">All Products</h1>
          <p className="mt-3 max-w-2xl text-[#6B7D52]">
            Explore our collection of natural shea butter products crafted for everyday care.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href="/cart"
              className="rounded-xl bg-[#556B2F] px-5 py-3 text-center font-medium text-white transition hover:bg-[#445624]"
            >
              View Cart
            </a>

            <a
              href="/"
              className="rounded-xl border border-[#8B6B2C] px-5 py-3 text-center font-medium text-[#8B6B2C] transition hover:bg-[#8B6B2C] hover:text-white"
            >
              Back Home
            </a>
          </div>
        </div>

        {error ? (
          <pre className="overflow-x-auto rounded-lg bg-red-50 p-4 text-red-600">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-[#3E2E17]">
              No products available yet
            </h2>
            <p className="mt-3 text-[#6B7D52]">
              Products will appear here once they are added to the store.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}