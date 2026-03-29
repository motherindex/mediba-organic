"use client";
// app/admin/orders/[id]/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(196,146,74,0.12)",  color: "#C4924A" },
  processing: { bg: "rgba(74,103,65,0.12)",   color: "#4A6741" },
  shipped:    { bg: "rgba(59,90,160,0.12)",   color: "#3B5AA0" },
  delivered:  { bg: "rgba(74,103,65,0.18)",   color: "#2E6B25" },
  cancelled:  { bg: "rgba(180,50,50,0.1)",    color: "#B43232" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(({ order }) => {
        setOrder(order);
        setStatus(order?.status ?? "pending");
        setTrackingNumber(order?.tracking_number ?? "");
        setCarrier(order?.carrier ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking_number: trackingNumber, carrier }),
    });

    setSaving(false);

    if (res.ok) {
      setSuccess("Order updated and customer notified!");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to update order.");
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

  const statusColors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  let shippingAddress: any = null;
  try { shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch {}

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin/orders" style={{ fontSize: "0.8rem", color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>← All Orders</Link>
          <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 16, marginBottom: 6 }}>
            Admin · Orders
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 3vw, 2.4rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1 }}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: statusColors.bg, color: statusColors.color, borderRadius: 3, padding: "4px 10px" }}>
              {status}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>

          {/* Customer Info */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 16 }}>Customer</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Name</p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)" }}>{order.customer_name ?? "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Email</p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)" }}>{order.customer_email ?? "—"}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Shipping Address</p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)", lineHeight: 1.6 }}>
                  {shippingAddress
                    ? `${shippingAddress.line1 ?? ""}${shippingAddress.line2 ? ", " + shippingAddress.line2 : ""}, ${shippingAddress.city ?? ""}, ${shippingAddress.state ?? ""} ${shippingAddress.postal_code ?? ""}, ${shippingAddress.country ?? ""}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 16 }}>Order Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Total</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)" }}>${Number(order.price ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Shipping Cost</p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)" }}>${Number(order.shipping_cost ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Quantity</p>
                <p style={{ fontSize: "0.92rem", color: "var(--brown)" }}>{order.quantity ?? 1}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Stripe Session</p>
                <p style={{ fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, wordBreak: "break-all" }}>{order.stripe_session_id ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 6 }}>Update Order</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 20 }}>
              Updating status will automatically email the customer.
            </p>

            {/* Status selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 8 }}>Status</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {STATUSES.map((s) => {
                  const c = STATUS_COLORS[s];
                  const isActive = status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
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
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tracking — only show when shipped */}
            {(status === "shipped" || status === "delivered") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 6 }}>Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. USPS, UPS, FedEx"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid var(--border)", fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", background: "var(--cream)", color: "var(--brown)", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 6 }}>Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1Z999AA10123456784"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid var(--border)", fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", background: "var(--cream)", color: "var(--brown)", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            )}

            {success && (
              <div className="banner-success" style={{ marginBottom: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {success}
              </div>
            )}
            {error && <div className="banner-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save & Notify Customer"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}