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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result?.error || "Failed to initialize checkout.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Cart validated. Checkout will be connected to Stripe soon.");
    } catch {
      setErrorMessage("Something went wrong while preparing checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: items.length === 0 ? 0.5 : 1 }}
      >
        {loading ? "Preparing..." : "Proceed to Checkout"}
      </button>

      {errorMessage && (
        <p
          style={{
            marginTop: 10,
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.82rem",
            color: "#c0392b",
          }}
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          style={{
            marginTop: 10,
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.82rem",
            color: "var(--green)",
          }}
        >
          {successMessage}
        </p>
      )}
    </div>
  );
}