import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Promotion, getProductPricing } from "@/lib/pricing";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const [{ data, error }, { data: promotionsData }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("promotions").select("*"),
  ]);

  if (error || !data) {
    notFound();
  }

  const promotions = (promotionsData ?? []) as Promotion[];
  const pricing = getProductPricing({
    productId: data.id,
    basePrice: Number(data.price),
    promotions,
  });

  const product = {
    ...data,
    finalPrice: pricing.finalPrice,
    hasDiscount: pricing.hasDiscount,
    promotionType: pricing.promotion?.type ?? null,
    promotionValue: pricing.promotion?.value ?? null,
  };

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <img
            src={
              product.images?.[0] ||
              "https://via.placeholder.com/800x800.png?text=Product"
            }
            alt={product.name}
            className="aspect-square w-full rounded-3xl border border-[#E7DCC8] bg-[#FFFDF8] object-cover shadow-sm"
          />

          {product.images && product.images.length > 1 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {product.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="h-24 w-full rounded-xl border border-[#E7DCC8] object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
            Mediba’s Organic
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{product.name}</h1>

          <p className="mt-6 text-base leading-8 text-[#6B7D52] sm:text-lg">
            {product.description}
          </p>

          {product.promotionType === "bogo" ? (
            <p className="mt-6 inline-flex w-fit rounded-full bg-[#EAF3DD] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#556B2F]">
              Buy One Get One Active
            </p>
          ) : null}

          <div className="mt-8">
            {product.hasDiscount && product.finalPrice < product.price ? (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-3xl font-bold text-[#8B6B2C]">
                  ${product.finalPrice.toFixed(2)}
                </p>
                <p className="text-base text-[#8E8E8E] line-through sm:text-lg">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-3xl font-bold text-[#8B6B2C]">
                ${Number(product.finalPrice ?? product.price).toFixed(2)}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start">
            <div className="w-full sm:max-w-xs">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.finalPrice ?? product.price,
                  originalPrice: product.price,
                  image: product.images?.[0] ?? null,
                  promotionType: product.promotionType ?? null,
                  promotionValue: product.promotionValue ?? null,
                }}
              />
            </div>

            <a
              href="/shop"
              className="rounded-xl border border-[#556B2F] px-6 py-4 text-center font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white sm:px-8"
            >
              Back to Shop
            </a>

            <a
              href="/cart"
              className="text-center text-sm font-medium text-[#556B2F] hover:text-[#8B6B2C] sm:self-center"
            >
              View Cart
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}