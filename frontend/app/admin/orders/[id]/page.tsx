"use client";
// app/admin/orders/[id]/page.tsx

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(196,146,74,0.12)",  color: "#C4924A" },
  processing: { bg: "rgba(74,103,65,0.12)",   color: "#4A6741" },
  shipped:    { bg: "rgba(59,90,160,0.12)",   color: "#3B5AA0" },
  delivered:  { bg: "rgba(74,103,65,0.18)",   color: "#2E6B25" },
  cancelled:  { bg: "rgba(180,50,50,0.1)",    color: "#B43232" },
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.92rem", color: "var(--brown)", lineHeight: 1.6 }}>{value ?? "—"}</p>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [carrier, setCarrier] = useState("USPS");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipping, setShipping] = useState(false);
  const [shipSuccess, setShipSuccess] = useState("");
  const [shipError, setShipError] = useState("");

  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(({ order }) => {
        setOrder(order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleMarkShipped() {
    setShipping(true);
    setShipError("");
    setShipSuccess("");

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "shipped", carrier, tracking_number: trackingNumber }),
    });

    setShipping(false);

    if (res.ok) {
      setOrder((prev: any) => ({ ...prev, status: "shipped", carrier, tracking_number: trackingNumber }));
      setShipSuccess("Order marked as shipped. Customer notified via email.");
    } else {
      const data = await res.json();
      setShipError(data.error ?? "Failed to mark as shipped.");
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (newStatus === order?.status) return;
    if (newStatus === "cancelled" && !window.confirm("Cancel this order? This cannot be undone.")) return;

    setStatusSaving(true);
    setStatusError("");
    setStatusSuccess("");

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setStatusSaving(false);

    if (res.ok) {
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
      setStatusSuccess("Saved ✓");
      setTimeout(() => setStatusSuccess(""), 2500);
    } else {
      const data = await res.json();
      setStatusError(data.error ?? "Failed to update status.");
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading order…</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Order not found.</p>
      </main>
    );
  }

  const formattedAddress = order.shipping_address ?? null;

  const currentStatus = order.status ?? "pending";
  const statusColors = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.pending;
  const isShipped = currentStatus === "shipped" || currentStatus === "delivered";
  const isCancelled = currentStatus === "cancelled";

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Back + breadcrumb */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin/orders" style={{ fontSize: "0.8rem", color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to Orders
          </Link>
          <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 16, marginBottom: 6 }}>
            Admin · Orders · #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1 }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: statusColors.bg, color: statusColors.color, borderRadius: 3, padding: "4px 10px" }}>
              {currentStatus}
            </span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
            {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>

          {/* ── Customer ─────────────────────────────────────── */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 20 }}>
              Customer
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <Field label="Name" value={order.customer_name} />
              <Field label="Email" value={order.customer_email} />
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  Shipping Address
                </p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {order.shipping_name && order.shipping_name !== order.customer_name && (
                    <span style={{ display: "block" }}>{order.shipping_name}</span>
                  )}
                  {formattedAddress ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Order Details ──────────────────────────────────── */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 20 }}>
              Order Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Total</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--gold)" }}>
                  ${Number(order.price ?? 0).toFixed(2)}
                </p>
              </div>
              <Field label="Shipping Cost" value={order.shipping_cost != null ? `$${Number(order.shipping_cost).toFixed(2)}` : "—"} />
              <Field label="Quantity" value={order.quantity ?? 1} />
              {order.stripe_session_id && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                    Stripe Session
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, wordBreak: "break-all" }}>
                    {order.stripe_session_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Shipping ──────────────────────────────────────── */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 20 }}>
              Shipping
            </h2>

            {isShipped && (
              <div style={{ marginBottom: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: order.label_url ? 16 : 0 }}>
                  <Field label="Carrier" value={order.carrier} />
                  <Field label="Tracking Number" value={order.tracking_number} />
                </div>
                {order.label_url && (
                  <a
                    href={order.label_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "var(--gold)", textDecoration: "none", border: "1px solid var(--gold)", borderRadius: 4, padding: "8px 16px", marginTop: 8 }}
                  >
                    🖨️ Print Label →
                  </a>
                )}
                <p style={{ fontSize: "0.8rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 12 }}>
                  Customer has been notified via email.
                </p>
              </div>
            )}

            {!isShipped && !isCancelled && (
              <div>
                {shipSuccess && (
                  <div className="banner-success" style={{ marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    {shipSuccess}
                  </div>
                )}
                {shipError && (
                  <div className="banner-error" style={{ marginBottom: 16 }}>{shipError}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 6 }}>
                      Carrier
                    </label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="USPS"
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 4, fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--brown)", background: "var(--white)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 6 }}>
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. 9400111899223397846059"
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 4, fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--brown)", background: "var(--white)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMarkShipped}
                  disabled={shipping || !trackingNumber.trim()}
                  className="btn-primary"
                  style={{ opacity: shipping || !trackingNumber.trim() ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {shipping ? (
                    <>
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Marking…
                    </>
                  ) : (
                    "Mark as Shipped"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── Update Status ─────────────────────────────────── */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 6 }}>
              Update Status
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 20 }}>
              Status change emails are sent to the customer automatically.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {STATUSES.map((s) => {
                const c = STATUS_COLORS[s];
                const isActive = currentStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={statusSaving || isActive}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "6px 14px",
                      borderRadius: 4,
                      border: isActive ? `2px solid ${c.color}` : "2px solid var(--border)",
                      background: isActive ? c.bg : "transparent",
                      color: isActive ? c.color : "var(--brown-light)",
                      cursor: isActive || statusSaving ? "default" : "pointer",
                      opacity: statusSaving && !isActive ? 0.5 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {statusSuccess && (
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--green)", fontWeight: 500 }}>
                {statusSuccess}
              </p>
            )}
            {statusError && (
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c0392b" }}>
                {statusError}
              </p>
            )}
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}