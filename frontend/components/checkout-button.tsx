"use client";
// components/checkout-button.tsx

import { useState } from "react";
import { useCart } from "@/components/cart-context";

export function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      {error && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.82rem",
            color: "#c53030",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="btn-primary"
        style={{
          width: "100%",
          opacity: loading || items.length === 0 ? 0.6 : 1,
          cursor: loading || items.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirecting to checkout…" : "Proceed to Checkout"}
      </button>
    </div>
  );
}