import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Company Policy | Mediba's Organic",
  description:
    "Learn about Mediba's Organic company policies — product quality, ethical sourcing, returns, pricing, and customer commitments.",
};

const sections = [
  {
    number: "01",
    title: "Product Quality & Standards",
    icon: "🌿",
    body: "We are committed to providing 100% pure, organic, unrefined shea butter sourced ethically and produced under strict quality standards.",
    bullets: [
      "No chemicals, parabens, preservatives, or artificial fragrances",
      "No bleaching or refining",
      "Processed using traditional methods to preserve nutrients",
      "Safe for skin, hair, and cosmetic use",
    ],
    note: "Each batch is carefully inspected to ensure freshness, purity, and consistency before distribution.",
  },
  {
    number: "02",
    title: "Ethical Sourcing & Sustainability",
    icon: "🌍",
    body: "Our shea butter is responsibly sourced from local African communities, supporting fair trade and sustainable harvesting practices.",
    bullets: [
      "Fair compensation for suppliers and women cooperatives",
      "Environmentally responsible sourcing",
      "Zero tolerance for exploitation or harmful labor practices",
    ],
    note: "We believe in empowering communities while protecting the environment.",
  },
  {
    number: "03",
    title: "Packaging & Storage",
    icon: "🫙",
    bullets: [
      "Products are packaged in clean, hygienic, and airtight containers",
      "Packaging materials are chosen to maintain product quality and reduce contamination",
      "Customers are advised to store shea butter in a cool, dry place away from direct sunlight",
    ],
  },
  {
    number: "04",
    title: "Health & Safety Disclaimer",
    icon: "🛡",
    body: "Our organic shea butter is a natural skincare product, not a medical treatment.",
    bullets: [
      "Always perform a patch test before full use",
      "We are not responsible for allergic reactions due to individual sensitivities",
      "Consult a healthcare professional for medical skin conditions",
    ],
  },
  {
    number: "05",
    title: "Orders, Returns & Refunds",
    icon: "📦",
    body: "Due to the nature of organic and personal care products:",
    bullets: [
      "All sales are final once opened or used",
      "Refunds or exchanges are only accepted for damaged or incorrect items reported within 48 hours of delivery",
      "Proof (photos/videos) may be required for claims",
    ],
  },
  {
    number: "06",
    title: "Pricing & Availability",
    icon: "✦",
    bullets: [
      "Prices may vary based on harvest season, supply, and packaging size",
      "Bulk and wholesale pricing is available upon request",
      "Availability is subject to stock levels",
    ],
  },
  {
    number: "07",
    title: "Custom Orders & Wholesale",
    icon: "🤝",
    body: "We welcome bulk orders, private labeling, and wholesale partnerships.",
    bullets: [
      "Bulk orders",
      "Private labeling",
      "Wholesale partnerships",
    ],
    note: "Custom orders may require advance notice and deposit.",
  },
  {
    number: "08",
    title: "Customer Service Commitment",
    icon: "💬",
    body: "We value transparency, honesty, and customer satisfaction. Questions, concerns, or feedback can be directed through our official communication channels, and we aim to respond promptly and professionally.",
  },
];

export default function PolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "72px 24px 80px",
          background: "linear-gradient(160deg, var(--cream) 0%, var(--cream-dark) 70%, var(--parchment) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,146,74,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.78rem",
              color: "var(--brown-light)",
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}
            >
              Home
            </Link>
            <span style={{ color: "var(--border)" }}>/</span>
            <span>Company Policy</span>
          </div>

          <p className="section-label">Transparency First</p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              fontWeight: 600,
              color: "var(--brown)",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Company Policy
          </h1>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "1rem",
              color: "var(--brown-light)",
              fontWeight: 300,
              lineHeight: 1.8,
              maxWidth: 580,
            }}
          >
            At Mediba&apos;s Organic, everything we do is grounded in honesty,
            quality, and respect — for our customers, our suppliers, and the
            natural world. Read below to understand how we operate.
          </p>
        </div>
      </section>

      {/* ── Policy Sections ───────────────────────────────── */}
      <section style={{ padding: "72px 24px 96px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Quick nav */}
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "24px 28px",
              marginBottom: 56,
            }}
          >
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 14,
              }}
            >
              Quick Navigation
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 20px",
              }}
            >
              {sections.map((s) => (
                <a
                  key={s.number}
                  href={`#section-${s.number}`}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "var(--brown-mid)",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Section cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {sections.map((s, i) => (
              <div
                key={s.number}
                id={`section-${s.number}`}
                style={{
                  background: i % 2 === 0 ? "var(--white)" : "var(--cream)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "36px 32px",
                  scrollMarginTop: 88,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    marginBottom: s.body || s.bullets ? 20 : 0,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--parchment)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {s.icon}
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        color: "var(--gold)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {s.number}
                    </span>
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        color: "var(--brown)",
                        lineHeight: 1.2,
                      }}
                    >
                      {s.title}
                    </h2>
                  </div>
                </div>

                {/* Body */}
                {s.body && (
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.92rem",
                      color: "var(--brown-light)",
                      lineHeight: 1.8,
                      fontWeight: 300,
                      marginBottom: s.bullets ? 14 : 0,
                    }}
                  >
                    {s.body}
                  </p>
                )}

                {/* Bullets */}
                {s.bullets && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.9rem",
                          color: "var(--brown-light)",
                          fontWeight: 300,
                          lineHeight: 1.75,
                          paddingLeft: 20,
                          position: "relative",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            color: "var(--gold-muted)",
                            fontWeight: 700,
                          }}
                        >
                          —
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Note */}
                {s.note && (
                  <p
                    style={{
                      marginTop: 16,
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.82rem",
                      color: "var(--green-light)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      lineHeight: 1.7,
                      paddingTop: 14,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    {s.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div
            style={{
              marginTop: 56,
              textAlign: "center",
              padding: "40px 24px",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
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
              Questions about our policy?
            </p>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.9rem",
                color: "var(--brown-light)",
                fontWeight: 300,
                marginBottom: 24,
              }}
            >
              We&apos;re happy to clarify anything. Reach out through our contact section.
            </p>
            <a href="/#contact" className="btn-primary">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}