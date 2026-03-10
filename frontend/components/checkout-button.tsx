"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";

export function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result?.error || "Failed to initialize checkout.");
        setLoading(false);
        return;
      }

      console.log("Checkout foundation response:", result);

      setSuccessMessage(
        "Checkout endpoint is working. The cart was validated server-side and is ready to be connected to Stripe."
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong while preparing checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full rounded-xl bg-[#8B6B2C] px-6 py-4 font-medium text-white transition hover:bg-[#715622] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Preparing Checkout..." : "Proceed to Checkout"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="mt-3 text-sm text-[#556B2F]">{successMessage}</p>
      ) : null}
    </div>
  );
}