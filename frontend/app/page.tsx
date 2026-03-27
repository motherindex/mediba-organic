import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/types/product";
import { Promotion, getProductPricing } from "@/lib/pricing";

export default async function Home() {
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
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-section">
        {/* Decorative circle */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,146,74,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -60,
            left: -80,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,103,65,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1152, margin: "0 auto", position: "relative" }}>
          <p className="section-label fade-up">Mediba&apos;s Organic</p>

          <h1
            className="fade-up fade-up-delay-1"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 6vw, 5rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "var(--brown)",
              maxWidth: 780,
              marginBottom: 20,
            }}
          >
            Natural shea butter made to{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>nourish</em>,
            protect, and restore.
          </h1>

          <p
            className="fade-up fade-up-delay-2"
            style={{
              fontSize: "1rem",
              color: "var(--brown-light)",
              maxWidth: 520,
              lineHeight: 1.75,
              marginBottom: 32,
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
            }}
          >
            Pure organic skincare rooted in simplicity, wellness, and the natural
            benefits of West African shea.
          </p>

          <div
            className="fade-up fade-up-delay-3"
            style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
          >
            <a href="/shop" className="btn-primary">
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#about" className="btn-outline">
              Our Story
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="fade-up fade-up-delay-4 trust-badges"
          >
            {[
              { icon: "🌿", label: "100% Organic" },
              { icon: "✦",  label: "Ethically Sourced" },
              { icon: "🫙", label: "No Preservatives" },
              { icon: "🌍", label: "From West Africa" },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.8rem",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  color: "var(--brown-mid)",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SHEA BUTTER ──────────────────────────────── */}
      <section className="content-section white-section">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="section-label">The Benefits</p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 600,
                color: "var(--brown)",
              }}
            >
              Why Shea Butter?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                title: "Deep Moisture",
                body: "Rich in vitamins A, E, and F, our shea butter provides profound hydration that helps nourish even the driest skin — naturally.",
                icon: "💧",
              },
              {
                title: "Skin Protection",
                body: "Anti-inflammatory properties calm irritation while antioxidants protect against environmental stressors and support the skin barrier.",
                icon: "🛡",
              },
              {
                title: "Natural Restoration",
                body: "Improves elasticity, reduces the appearance of scars, and soothes conditions like eczema — centuries of tradition in every jar.",
                icon: "✨",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="card-hover"
                style={{
                  background: "var(--cream)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "28px 24px",
                }}
              >
                <span style={{ fontSize: "1.8rem", display: "block", marginBottom: 14 }}>
                  {card.icon}
                </span>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "var(--green)",
                    marginBottom: 10,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--brown-light)",
                    lineHeight: 1.75,
                    fontWeight: 300,
                  }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section id="featured-products" className="content-section">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 36,
            }}
          >
            <div>
              <p className="section-label">Our Collection</p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                  fontWeight: 600,
                  color: "var(--brown)",
                }}
              >
                Featured Products
              </h2>
            </div>
            <a
              href="/shop"
              style={{
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--gold)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              View All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
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
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <section
        id="about"
        className="content-section white-section"
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <p className="section-label">Our Story</p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)",
                fontWeight: 600,
                color: "var(--brown)",
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              About Mediba Organic
            </h2>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "var(--brown-light)",
                lineHeight: 1.85,
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              Mediba Organic is focused on providing natural shea butter products that
              support healthy skin through simple, organic care. The brand is rooted in
              wellness, quality, and the natural benefits of shea-based skincare.
            </p>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "var(--brown-light)",
                lineHeight: 1.85,
                fontWeight: 300,
              }}
            >
              Our shea butter is responsibly sourced from local African communities,
              supporting fair trade and sustainable harvesting practices — empowering
              people while protecting the environment.
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {[
              { value: "100%", label: "Pure & Organic" },
              { value: "0",    label: "Chemicals Added" },
              { value: "🌱",   label: "Sustainably Sourced" },
              { value: "GH",   label: "From Ghana, W. Africa" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--cream)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.9rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    color: "var(--brown-light)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────── */}
      <section id="contact" className="content-section">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <p className="section-label">Get in Touch</p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)",
              fontWeight: 600,
              color: "var(--brown)",
              marginBottom: 12,
            }}
          >
            Contact Us
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              color: "var(--brown-light)",
              marginBottom: 32,
              fontWeight: 300,
            }}
          >
            For product inquiries, partnerships, wholesale, or support — we&apos;re here.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: "✉",
                title: "Email",
                body: <a href="mailto:medibaorganic@gmail.com" style={{ color: "var(--brown)", textDecoration: "none", borderBottom: "1px solid var(--gold-muted)" }}>medibaorganic@gmail.com</a>,
                note: "We aim to respond within 1–2 business days.",
              },
              {
                icon: "🤝",
                title: "Wholesale & Custom Orders",
                body: "Bulk orders & private labeling welcome.",
                note: "Custom orders may require advance notice and deposit.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="card-hover"
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "28px 24px",
                }}
              >
                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: 12 }}>
                  {c.icon}
                </span>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "var(--green)",
                    marginBottom: 8,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--brown)",
                    marginBottom: 6,
                  }}
                >
                  {c.body}
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.8rem",
                    color: "var(--brown-light)",
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  {c.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
