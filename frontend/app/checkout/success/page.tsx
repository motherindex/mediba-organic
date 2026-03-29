// app/checkout/success/page.tsx
"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart-context";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "56px 40px",
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(74,103,65,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 10,
          }}
        >
          Order Confirmed
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--brown)",
            lineHeight: 1.15,
            marginBottom: 16,
          }}
        >
          Thank you for your order!
        </h1>

        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--brown-light)",
            fontWeight: 300,
            lineHeight: 1.75,
            marginBottom: 32,
          }}
        >
          Your payment was successful. You'll receive a confirmation email shortly.
          We'll be in touch once your order has shipped.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "var(--green)",
              textDecoration: "none",
              letterSpacing: "0.06em",
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}