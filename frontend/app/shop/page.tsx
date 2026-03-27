import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/product";
import { Promotion, getProductPricing } from "@/lib/pricing";

export default async function ShopPage() {
  const [{ data, error }, { data: promotionsData }] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("promotions").select("*"),
  ]);

  const promotions = (promotionsData ?? []) as Promotion[];

  const products = ((data ?? []) as Product[]).map((product) => {
    const pricing = getProductPricing({
      productId: product.id,
      basePrice: Number(product.price),
      promotions,
    });

    return {
      ...product,
      finalPrice: pricing.finalPrice,
      hasDiscount: pricing.hasDiscount,
      promotionType: pricing.promotion?.type ?? null,
      promotionValue: pricing.promotion?.value ?? null,
    };
  });

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "56px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.78rem",
              color: "var(--brown-light)",
              fontWeight: 400,
            }}
          >
            <a href="/" style={{ color: "var(--brown-light)", textDecoration: "none", transition: "color 0.15s" }}>
              Home
            </a>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span style={{ color: "var(--gold)", fontWeight: 500 }}>Shop</span>
          </div>

          <p className="section-label">Our Collection</p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 600,
              color: "var(--brown)",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            All Products
          </h1>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              color: "var(--brown-light)",
              fontWeight: 300,
              maxWidth: 480,
              lineHeight: 1.75,
            }}
          >
            Natural shea butter products crafted for everyday skin care.
          </p>
        </div>

        {error ? (
          <pre
            style={{
              background: "#fff5f5",
              color: "#c53030",
              padding: 16,
              borderRadius: 6,
              overflow: "auto",
              fontSize: "0.85rem",
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : products.length === 0 ? (
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "56px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "var(--brown)",
                marginBottom: 10,
              }}
            >
              No products available yet
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300 }}>
              Products will appear here once they are added to the store.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}