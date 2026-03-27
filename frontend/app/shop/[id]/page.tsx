import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Promotion, getProductPricing } from "@/lib/pricing";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const [{ data, error }, { data: promotionsData }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("promotions").select("*"),
  ]);

  if (error || !data) {
    notFound();
  }

  const promotions = (promotionsData ?? []) as Promotion[];
  const pricing = getProductPricing({
    productId: data.id,
    basePrice: Number(data.price),
    promotions,
  });

  const product = {
    ...data,
    finalPrice: pricing.finalPrice,
    hasDiscount: pricing.hasDiscount,
    promotionType: pricing.promotion?.type ?? null,
    promotionValue: pricing.promotion?.value ?? null,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div className="product-detail-grid">
          {/* Images column */}
          <div>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--white)" }}>
              <img
                src={product.images?.[0] || "https://placehold.co/800x800/FAF6EE/C4924A?text=Product"}
                alt={product.name}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      border: index === 0 ? "2px solid var(--gold)" : "1px solid var(--border)",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 10,
              }}
            >
              Mediba&apos;s Organic
            </p>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 600,
                color: "var(--brown)",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              {product.hasDiscount && product.finalPrice < product.price ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--gold)",
                      lineHeight: 1,
                    }}
                  >
                    ${product.finalPrice.toFixed(2)}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "1rem",
                      color: "#aaa",
                      textDecoration: "line-through",
                    }}
                  >
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                    lineHeight: 1,
                  }}
                >
                  ${Number(product.finalPrice ?? product.price).toFixed(2)}
                </p>
              )}
            </div>

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
                  padding: "4px 12px",
                  marginBottom: 20,
                  fontFamily: "'Jost', sans-serif",
                  width: "fit-content",
                }}
              >
                Buy One Get One Active
              </span>
            )}

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "var(--brown-light)",
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: 32,
              }}
            >
              {product.description}
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.finalPrice ?? product.price,
                  originalPrice: product.price,
                  image: product.images?.[0] ?? null,
                  promotionType: product.promotionType ?? null,
                  promotionValue: product.promotionValue ?? null,
                }}
              />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/shop" className="btn-outline" style={{ flex: 1, justifyContent: "center", minWidth: 120 }}>
                  Back to Shop
                </a>
                <a
                  href="/cart"
                  style={{
                    flex: 1,
                    minWidth: 100,
                    textAlign: "center",
                    padding: "11px 16px",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "var(--green)",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  View Cart →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        @media (max-width: 480px) {
          .thumbnail-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 768px) {
          .product-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            align-items: start;
          }
        }
      `}</style>
    </main>
  );
}
