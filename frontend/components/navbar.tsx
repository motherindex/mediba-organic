"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const { itemCount } = useCart();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const atTop = current < 10;

      setScrolled(current > 20);

      if (atTop) {
        setVisible(true);
      } else if (current > lastScrollY.current) {
        // scrolling down — hide
        setVisible(false);
        setMenuOpen(false);
      } else {
        // scrolling up — show
        setVisible(true);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home",    href: "/" },
    { label: "Shop",    href: "/shop" },
    { label: "About",   href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(250,246,238,0.97)" : "var(--cream)",
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 2px 20px rgba(62,46,23,0.06)" : "none",
          fontFamily: "'Jost', sans-serif",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img
              src="/logo.png"
              alt="Mediba's Organic"
              style={{ height: 48, width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
            className="hidden-mobile"
          >
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--brown)",
                  textDecoration: "none",
                  position: "relative",
                  paddingBottom: 2,
                  transition: "color 0.2s",
                }}
              >
                {l.label}
              </Link>
            ))}

            {/* Cart */}
            <Link
              href="/cart"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--gold)",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "9px 20px",
                borderRadius: 3,
                textDecoration: "none",
                transition: "background 0.2s, transform 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Cart
              {itemCount > 0 && (
                <span
                  style={{
                    background: "var(--brown)",
                    color: "var(--gold-light)",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="show-mobile">
            <Link
              href="/cart"
              style={{
                position: "relative",
                color: "var(--brown)",
                textDecoration: "none",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "var(--gold)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--brown)",
                padding: 4,
              }}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--cream)",
              padding: "8px 24px 28px",
            }}
            className="show-mobile"
          >
            {links.map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 0",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--brown)",
                  textDecoration: "none",
                  borderBottom: i < links.length - 1 ? "1px solid var(--border)" : "none",
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {l.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}

            {/* Cart link in mobile menu */}
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 20,
                background: "var(--gold)",
                color: "#fff",
                padding: "14px 20px",
                borderRadius: 4,
                textDecoration: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                justifyContent: "center",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              View Cart
              {itemCount > 0 && (
                <span
                  style={{
                    background: "var(--brown)",
                    color: "var(--gold-light)",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </>
  );
}