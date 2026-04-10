"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "#c0392b",
            background: "rgba(192,57,43,0.06)",
            border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 4,
            padding: "6px 12px",
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--brown-light)",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 500,
        color: "#c0392b",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        opacity: 0.7,
        whiteSpace: "nowrap",
      }}
    >
      Delete
    </button>
  );
}
