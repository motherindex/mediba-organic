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
      className="btn-primary"
      style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
    >
      Add to Cart
    </button>
  );
}