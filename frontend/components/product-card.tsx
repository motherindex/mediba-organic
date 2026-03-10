import Link from "next/link";
import { Product } from "@/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.finalPrice ?? product.price;
  const showDiscount = product.hasDiscount && displayPrice < product.price;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/shop/${product.id}`}>
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/600x600.png?text=Product"
          }
          alt={product.name}
          className="h-64 w-full object-cover"
        />
      </Link>

      <div className="p-5">
        <Link href={`/shop/${product.id}`}>
          <h2 className="text-xl font-semibold text-[#3E2E17] hover:text-[#8B6B2C]">
            {product.name}
          </h2>
        </Link>

        <p className="mt-2 text-sm text-[#6B7D52]">
          {product.description}
        </p>

        {product.promotionType === "bogo" ? (
          <p className="mt-4 inline-flex rounded-full bg-[#EAF3DD] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#556B2F]">
            BOGO Active
          </p>
        ) : null}

        <div className="mt-4">
          {showDiscount ? (
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold text-[#8B6B2C]">
                ${displayPrice.toFixed(2)}
              </p>
              <p className="text-sm text-[#8E8E8E] line-through">
                ${product.price.toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-[#8B6B2C]">
              ${displayPrice.toFixed(2)}
            </p>
          )}
        </div>

        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: displayPrice,
            originalPrice: product.price,
            image: product.images?.[0] ?? null,
            promotionType: product.promotionType ?? null,
            promotionValue: product.promotionValue ?? null,
          }}
        />
      </div>
    </div>
  );
}