import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--brown)",
        color: "var(--parchment)",
        fontFamily: "'Jost', sans-serif",
        marginTop: 0,
      }}
    >
      {/* ── Top grid ── */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "60px 24px 52px",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 48,
          }}
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.55rem",
                fontWeight: 600,
                color: "var(--gold-light)",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Mediba&apos;s<br />Organic
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(237,227,204,0.6)",
                lineHeight: 1.75,
                maxWidth: 210,
                fontWeight: 300,
              }}
            >
              Natural shea butter and organic skincare crafted to nourish,
              protect, and restore your skin.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 16,
              }}
            >
              Shop
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { label: "All Products", href: "/shop" },
                { label: "Shea Butter",  href: "/shop" },
                { label: "Cart",         href: "/cart" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(237,227,204,0.65)",
                    textDecoration: "none",
                    fontWeight: 300,
                    transition: "color 0.2s",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 16,
              }}
            >
              Company
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { label: "Home",           href: "/" },
                { label: "About",          href: "/#about" },
                { label: "Contact",        href: "/#contact" },
                { label: "Company Policy", href: "/policy" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(237,227,204,0.65)",
                    textDecoration: "none",
                    fontWeight: 300,
                    transition: "color 0.2s",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 16,
              }}
            >
              Support
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <a
                href="mailto:medibaorganic@gmail.com"
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(237,227,204,0.65)",
                  textDecoration: "none",
                  fontWeight: 300,
                  transition: "color 0.2s",
                }}
              >
                Email Support
              </a>
              <Link
                href="/admin/login"
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(237,227,204,0.65)",
                  textDecoration: "none",
                  fontWeight: 300,
                  transition: "color 0.2s",
                }}
              >
                Admin
              </Link>
            </nav>
            <p
              style={{
                marginTop: 16,
                fontSize: "0.75rem",
                color: "rgba(237,227,204,0.35)",
                lineHeight: 1.65,
                fontWeight: 300,
              }}
            >
              We aim to respond within<br />1–2 business days.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left: copyright + policy */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          <p style={{ fontSize: "0.76rem", color: "rgba(237,227,204,0.35)" }}>
            © {year} Mediba&apos;s Organic. All rights reserved.
          </p>
          <span style={{ color: "rgba(237,227,204,0.15)", fontSize: "0.7rem" }}>|</span>
          <Link
            href="/policy"
            style={{
              fontSize: "0.76rem",
              color: "rgba(237,227,204,0.45)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Company Policy
          </Link>
        </div>

        {/* Right: built by */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.76rem", color: "rgba(237,227,204,0.3)" }}>
            Built by
          </span>
          <a
            href="https://mother-index-site.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.76rem",
              fontWeight: 500,
              color: "rgba(237,227,204,0.5)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Foundry Systems
            {/* Only render Image if /foundry.png exists in public dir */}
            <Image
              src="/foundry.png"
              alt="Mother Index"
              width={16}
              height={16}
              style={{ opacity: 0.5, borderRadius: 2 }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}