"use client";

type StarRatingProps = {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 20 }: StarRatingProps) {
  const interactive = !!onChange;

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!interactive}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: interactive ? "pointer" : "default",
            fontSize: size,
            lineHeight: 1,
            color: star <= value ? "var(--gold)" : "var(--border)",
            transition: "color 0.15s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
