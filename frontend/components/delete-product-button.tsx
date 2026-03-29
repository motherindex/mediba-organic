"use client";
// components/delete-product-button.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this product? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);

    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error ?? "Failed to delete product.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.8rem",
        fontWeight: 500,
        letterSpacing: "0.06em",
        color: loading ? "#aaa" : "#c0392b",
        background: "none",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        padding: 0,
        transition: "color 0.15s",
      }}
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}