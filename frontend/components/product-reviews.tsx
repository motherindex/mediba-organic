"use client";

import { useEffect, useState, useCallback } from "react";
import { Review } from "@/types/review";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";

type ProductReviewsProps = {
  productId: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section style={{ marginTop: 64, paddingTop: 48, borderTop: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 6,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            Customer Reviews
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 600,
              color: "var(--brown)",
              lineHeight: 1.2,
            }}
          >
            {reviews.length > 0
              ? `${avgRating.toFixed(1)} out of 5 · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
              : "No reviews yet"}
          </h2>
          {reviews.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <StarRating value={Math.round(avgRating)} size={18} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-outline"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Review form */}
      {showForm && (
        <div
          style={{
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "28px 24px",
            marginBottom: 36,
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--brown)",
              marginBottom: 20,
            }}
          >
            Leave a Review
          </h3>
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowForm(false);
              fetchReviews();
            }}
          />
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.85rem",
            color: "var(--brown-light)",
            fontWeight: 300,
          }}
        >
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "var(--cream)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "var(--brown)",
              marginBottom: 8,
            }}
          >
            Be the first to review this product.
          </p>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.85rem",
              color: "var(--brown-light)",
              fontWeight: 300,
            }}
          >
            Share your experience with other customers.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="card-hover"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--brown)",
                      marginBottom: 6,
                    }}
                  >
                    {review.reviewer_name || "Anonymous"}
                  </p>
                  <StarRating value={review.rating} size={16} />
                </div>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.75rem",
                    color: "var(--brown-light)",
                    fontWeight: 300,
                  }}
                >
                  {formatDate(review.created_at)}
                </p>
              </div>

              {review.body && (
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--brown-light)",
                    lineHeight: 1.75,
                    fontWeight: 300,
                  }}
                >
                  {review.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
