import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/product";
import { Promotion, getProductPricing } from "@/lib/pricing";

export default async function Home() {
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
    <main className="min-h-screen bg-[#F8F3E9] text-[#3E2E17]">
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
            Mediba’s Organic
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-[#3E2E17] sm:text-5xl lg:text-6xl">
            Natural shea butter made to nourish, protect, and restore your skin.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-[#6B7D52] sm:text-lg">
            Pure organic skincare rooted in simplicity, wellness, and natural care.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href="/shop"
              className="rounded-xl bg-[#8B6B2C] px-6 py-3 text-center font-medium text-white transition hover:bg-[#715622]"
            >
              Shop Now
            </a>

            <a
              href="#about"
              className="rounded-xl border border-[#556B2F] px-6 py-3 text-center font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E7DCC8] bg-[#FFFDF8] px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-[#3E2E17] sm:text-3xl">
            Why Shea Butter
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E7DCC8] bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#556B2F]">Deep Moisture</h3>
              <p className="mt-3 text-[#6B7D52]">
                Helps keep skin soft, smooth, and hydrated naturally.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7DCC8] bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#556B2F]">Skin Protection</h3>
              <p className="mt-3 text-[#6B7D52]">
                Supports the skin barrier and helps protect against dryness.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7DCC8] bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-[#556B2F]">Natural Care</h3>
              <p className="mt-3 text-[#6B7D52]">
                A simple, organic skincare solution made from nature.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-products" className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-[#3E2E17] sm:text-3xl">
            Featured Products
          </h2>
          <p className="mt-3 max-w-2xl text-[#6B7D52]">
            Explore our organic shea butter collection made for natural everyday skincare.
          </p>

          {error ? (
            <pre className="mt-6 overflow-x-auto rounded-lg bg-red-50 p-4 text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="about"
        className="border-y border-[#E7DCC8] bg-[#FFFDF8] px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-[#3E2E17] sm:text-3xl">
            About Mediba Organic
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#6B7D52] sm:text-lg">
            Mediba Organic is focused on providing natural shea butter products that support
            healthy skin through simple, organic care. The brand is rooted in wellness,
            quality, and the natural benefits of shea-based skincare.
          </p>
        </div>
      </section>

      <section id="contact" className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-[#3E2E17] sm:text-3xl">Contact</h2>
          <p className="mt-4 text-[#6B7D52]">
            For product inquiries, partnerships, or support, please contact Mediba Organic.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#556B2F]">Email</h3>
              <p className="mt-2 break-words text-[#6B7D52]">
                comingsoon@mediba-organic.com
              </p>
            </div>

            <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#556B2F]">Brand</h3>
              <p className="mt-2 text-[#6B7D52]">Organic skincare for everyday care.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}