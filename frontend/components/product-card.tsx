import Link from "next/link";
import { Product } from "@/types/product";
import { AddToCartButton } from "@/components/add-to-cart-button";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.finalPrice ?? product.price;
  const showDiscount = product.hasDiscount && displayPrice < product.price;

  return (
    <div
      className="card-hover"
      style={{
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--white)",
      }}
    >
      {/* Image */}
      <Link href={`/shop/${product.id}`} className="img-zoom" style={{ display: "block" }}>
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/600x600.png?text=Product"
          }
          alt={product.name}
          style={{
            width: "100%",
            height: 280,
            objectFit: "cover",
            display: "block",
          }}
        />
      </Link>

      <div style={{ padding: "20px 20px 24px" }}>
        {/* Promo badge */}
        {product.promotionType === "bogo" && (
          <span
            style={{
              display: "inline-block",
              background: "rgba(74,103,65,0.1)",
              color: "var(--green)",
              border: "1px solid rgba(74,103,65,0.25)",
              borderRadius: 3,
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "3px 10px",
              marginBottom: 10,
              fontFamily: "'Jost', sans-serif",
            }}
          >
            BOGO Active
          </span>
        )}

        {/* Name */}
        <Link href={`/shop/${product.id}`} style={{ textDecoration: "none" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--brown)",
              marginBottom: 8,
              lineHeight: 1.3,
              transition: "color 0.2s",
            }}
          >
            {product.name}
          </h2>
        </Link>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.85rem",
            color: "var(--brown-light)",
            lineHeight: 1.7,
            fontWeight: 300,
            marginBottom: 16,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        {/* Price */}
        <div style={{ marginBottom: 16 }}>
          {showDiscount ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                ${displayPrice.toFixed(2)}
              </p>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.85rem",
                  color: "#aaa",
                  textDecoration: "line-through",
                }}
              >
                ${product.price.toFixed(2)}
              </p>
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--gold)",
              }}
            >
              ${displayPrice.toFixed(2)}
            </p>
          )}
        </div>

        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: displayPrice,
            originalPrice: product.price,
            image: product.images?.[0] ?? null,
            promotionType: product.promotionType ?? null,
            promotionValue: product.promotionValue ?? null,
          }}
        />
      </div>
    </div>
  );
}