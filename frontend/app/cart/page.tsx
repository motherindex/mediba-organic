"use client";

import { useCart } from "@/components/cart-context";
import { getCartLineTotal } from "@/lib/pricing";
import { CheckoutButton } from "@/components/checkout-button";

export default function CartPage() {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, subtotal } = useCart();

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px 96px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p className="section-label">Your Selection</p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              color: "var(--brown)",
              lineHeight: 1.15,
            }}
          >
            Your Cart
          </h1>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.92rem",
              color: "var(--brown-light)",
              marginTop: 8,
              fontWeight: 300,
            }}
          >
            Review your selected products before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "64px 24px",
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
              Your cart is empty
            </p>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.9rem",
                color: "var(--brown-light)",
                marginBottom: 28,
                fontWeight: 300,
              }}
            >
              Add products from the shop to get started.
            </p>
            <a href="/shop" className="btn-primary">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items list */}
            <div className="cart-items" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item) => {
                const lineTotal = getCartLineTotal({
                  unitPrice: item.price,
                  quantity: item.quantity,
                  promotionType: item.promotionType,
                });

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--white)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "20px 20px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                      {/* Image */}
                      <img
                        src={item.image || "https://via.placeholder.com/300x300.png?text=Product"}
                        alt={item.name}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 6,
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid var(--border)",
                        }}
                      />

                      {/* Info + controls */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "1.15rem",
                            fontWeight: 600,
                            color: "var(--brown)",
                            marginBottom: 4,
                          }}
                        >
                          {item.name}
                        </h2>

                        {item.promotionType === "bogo" && (
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "var(--green)",
                              background: "rgba(74,103,65,0.08)",
                              border: "1px solid rgba(74,103,65,0.2)",
                              borderRadius: 3,
                              padding: "2px 8px",
                              marginBottom: 6,
                              fontFamily: "'Jost', sans-serif",
                            }}
                          >
                            BOGO Applied
                          </span>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <p
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: "var(--gold)",
                            }}
                          >
                            ${item.price.toFixed(2)}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.82rem",
                                color: "#aaa",
                                textDecoration: "line-through",
                              }}
                            >
                              ${item.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Qty controls + line total row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 12,
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                background: "var(--cream)",
                                color: "var(--brown)",
                                fontSize: "1.1rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontWeight: 500,
                                minWidth: 24,
                                textAlign: "center",
                                color: "var(--brown)",
                              }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                background: "var(--cream)",
                                color: "var(--brown)",
                                fontSize: "1.1rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "'Jost', sans-serif",
                              }}
                            >
                              +
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <p
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "1.2rem",
                                fontWeight: 700,
                                color: "var(--brown)",
                              }}
                            >
                              ${lineTotal.toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.78rem",
                                fontWeight: 500,
                                color: "var(--brown-light)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                letterSpacing: "0.04em",
                                transition: "color 0.2s",
                                padding: 0,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div
              className="cart-summary"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "28px 24px",
                position: "sticky",
                top: 88,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--brown)",
                  marginBottom: 20,
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                }}
              >
                <span style={{ color: "var(--brown-light)", fontWeight: 300 }}>Subtotal</span>
                <span style={{ color: "var(--brown)", fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                }}
              >
                <span style={{ color: "var(--brown-light)", fontWeight: 300 }}>Shipping</span>
                <span style={{ color: "var(--brown-light)", fontWeight: 300 }}>Calculated later</span>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--brown)",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <CheckoutButton />

              <a
                href="/shop"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 14,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "var(--green)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                }}
              >
                ← Continue Shopping
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .cart-summary {
          position: static !important;
        }
        @media (min-width: 768px) {
          .cart-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 32px;
            align-items: start;
          }
          .cart-summary {
            position: sticky !important;
          }
        }
      `}</style>
    </main>
  );
}
