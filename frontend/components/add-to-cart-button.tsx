"use client";

import { useCart } from "@/components/cart-context";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string | null;
    promotionType?: "bogo" | "percent_off" | "amount_off" | null;
    promotionValue?: number | null;
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="mt-4 w-full rounded-xl bg-[#556B2F] px-4 py-3 text-white transition hover:bg-[#445624]"
    >
      Add to Cart
    </button>
  );
}