"use client";

import { useState } from "react";
import { StarRating } from "@/components/star-rating";

type ReviewFormProps = {
  productId: string;
  onSuccess: () => void;
};

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          reviewer_name: name.trim() || null,
          rating,
          body: body.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review.");

      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: "20px 24px",
          background: "rgba(74,103,65,0.06)",
          border: "1px solid rgba(74,103,65,0.2)",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
            fontWeight: 600,
            color: "var(--green)",
            marginBottom: 6,
          }}
        >
          Thank you for your review!
        </p>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.85rem",
            color: "var(--brown-light)",
            fontWeight: 300,
          }}
        >
          Your feedback helps other customers.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Star rating */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--brown-light)",
            marginBottom: 10,
          }}
        >
          Your Rating <span style={{ color: "var(--gold)" }}>*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      {/* Name (optional) */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--brown-light)",
            marginBottom: 8,
          }}
        >
          Your Name <span style={{ color: "var(--brown-light)", fontWeight: 300 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah M."
          maxLength={60}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.9rem",
            color: "var(--brown)",
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Review text (optional) */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--brown-light)",
            marginBottom: 8,
          }}
        >
          Your Review <span style={{ color: "var(--brown-light)", fontWeight: 300 }}>(optional)</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others what you think..."
          maxLength={600}
          rows={4}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.9rem",
            color: "var(--brown)",
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.72rem",
            color: "var(--brown-light)",
            fontWeight: 300,
            marginTop: 4,
            textAlign: "right",
          }}
        >
          {body.length}/600
        </p>
      </div>

      {error && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.82rem",
            color: "#c0392b",
            background: "rgba(192,57,43,0.06)",
            border: "1px solid rgba(192,57,43,0.2)",
            borderRadius: 4,
            padding: "8px 12px",
            marginBottom: 16,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary"
        style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
