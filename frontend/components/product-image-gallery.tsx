"use client";

import { useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasMultiple = images.length > 1;

  const prev = () => setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1));

  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Crect width='800' height='800' fill='%23FAF6EE'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C4924A' font-size='24' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

  const displayImages = images.length > 0 ? images : [placeholder];
  const active = displayImages[activeIndex] ?? placeholder;

  return (
    <div>
      {/* Main image */}
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--white)",
          position: "relative",
        }}
      >
        <img
          src={active}
          alt={`${productName} — image ${activeIndex + 1}`}
          style={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            display: "block",
            transition: "opacity 0.2s ease",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholder;
          }}
        />

        {/* Prev / Next arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                color: "var(--brown)",
                backdropFilter: "blur(4px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                color: "var(--brown)",
                backdropFilter: "blur(4px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
            >
              ›
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 6,
            }}
          >
            {displayImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                style={{
                  width: i === activeIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === activeIndex ? "var(--gold)" : "rgba(255,255,255,0.6)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.2s ease, background 0.2s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginTop: 12,
          }}
        >
          {displayImages.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{
                padding: 0,
                border: index === activeIndex
                  ? "2px solid var(--gold)"
                  : "1px solid var(--border)",
                borderRadius: 6,
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                transition: "border-color 0.2s",
                aspectRatio: "1/1",
              }}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: index === activeIndex ? 1 : 0.65,
                  transition: "opacity 0.2s",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholder;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
