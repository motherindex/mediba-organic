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

type Rate = {
  id: string;
  service: string;
  carrier: string;
  rate: string;
  currency: string;
  delivery_days: number | null;
  est_delivery_date: string | null;
};

type LabelResult = {
  labelUrl: string;
  trackingNumber: string;
  carrier: string;
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

  // EasyPost label flow
  const [rates, setRates] = useState<Rate[]>([]);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [ratesError, setRatesError] = useState("");
  const [purchasingLabel, setPurchasingLabel] = useState(false);
  const [labelError, setLabelError] = useState("");
  const [labelResult, setLabelResult] = useState<LabelResult | null>(null);

  // Status update
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

  async function handleGetRates() {
    setFetchingRates(true);
    setRatesError("");
    setRates([]);
    setShipmentId(null);
    setSelectedRateId(null);
    setLabelError("");

    const res = await fetch("/api/easypost/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id }),
    });

    const data = await res.json();
    setFetchingRates(false);

    if (!res.ok) {
      setRatesError(data.error ?? "Failed to fetch rates.");
      return;
    }

    setShipmentId(data.shipment_id);
    setRates(data.rates ?? []);

    if (!data.rates?.length) {
      setRatesError("No USPS rates available for this address.");
    }
  }

  async function handlePurchaseLabel() {
    if (!selectedRateId || !shipmentId) return;
    setPurchasingLabel(true);
    setLabelError("");

    const res = await fetch("/api/easypost/label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, shipment_id: shipmentId, rate_id: selectedRateId }),
    });

    const data = await res.json();
    setPurchasingLabel(false);

    if (!res.ok) {
      setLabelError(data.error ?? "Failed to purchase label.");
      return;
    }

    setLabelResult({ labelUrl: data.labelUrl, trackingNumber: data.trackingNumber, carrier: data.carrier });
    setOrder((prev: any) => ({
      ...prev,
      status: "shipped",
      tracking_number: data.trackingNumber,
      carrier: data.carrier,
      label_url: data.labelUrl,
    }));
    setRates([]);
    setShipmentId(null);
    setSelectedRateId(null);
  }

  async function handleStatusChange(newStatus: string) {
    if (newStatus === order?.status) return;
    if (newStatus === "cancelled" && !window.confirm("Are you sure you want to cancel this order? The customer will be notified.")) {
      return;
    }

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
      setStatusSuccess("Status updated.");
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

  let shippingAddress: any = null;
  try { shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch {}

  const formattedAddress = shippingAddress
    ? [
        shippingAddress.line1,
        shippingAddress.line2,
        shippingAddress.city && shippingAddress.state
          ? `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code ?? ""}`
          : shippingAddress.city ?? shippingAddress.postal_code,
        shippingAddress.country !== "US" ? shippingAddress.country : null,
      ].filter(Boolean).join("\n")
    : null;

  const currentStatus = order.status ?? "pending";
  const statusColors = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.pending;
  const isShipped = currentStatus === "shipped" || currentStatus === "delivered";
  const isCancelled = currentStatus === "cancelled";
  const showLabelSection = !isShipped && !isCancelled;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Back + breadcrumb */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin/orders" style={{ fontSize: "0.8rem", color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>
            ← Orders
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

          {/* ── Shipping / Label ──────────────────────────────── */}
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--brown)", marginBottom: 20 }}>
              Shipping
            </h2>

            {/* Already shipped — show existing label info */}
            {(isShipped || order.tracking_number || order.label_url) && (
              <div style={{ marginBottom: showLabelSection ? 24 : 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
                  <Field label="Carrier" value={order.carrier} />
                  <Field label="Tracking Number" value={order.tracking_number} />
                </div>
                {order.label_url && (
                  <a
                    href={order.label_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "var(--gold)", textDecoration: "none", border: "1px solid var(--gold)", borderRadius: 4, padding: "8px 16px" }}
                  >
                    🖨️ Print Label →
                  </a>
                )}
              </div>
            )}

            {/* Label purchase success banner */}
            {labelResult && (
              <div style={{ background: "rgba(74,103,65,0.07)", border: "1px solid rgba(74,103,65,0.2)", borderRadius: 6, padding: "14px 18px", marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.88rem", color: "var(--green)", fontWeight: 600 }}>✓ Label created!</span>
                <span style={{ fontSize: "0.85rem", color: "var(--brown-light)", fontWeight: 300 }}>
                  Tracking: <strong style={{ color: "var(--brown)", fontWeight: 600 }}>{labelResult.trackingNumber}</strong>
                </span>
                <a href={labelResult.labelUrl} target="_blank" rel="noreferrer"
                  style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "var(--gold)", textDecoration: "none" }}>
                  Print Label →
                </a>
              </div>
            )}

            {/* Generate label section — only when not shipped/cancelled */}
            {showLabelSection && (
              <div>
                <div style={{ borderTop: (isShipped || order.tracking_number || order.label_url) ? "1px solid var(--border)" : "none", paddingTop: (isShipped || order.tracking_number || order.label_url) ? 20 : 0 }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 16 }}>
                    Fetch available USPS rates, select one, then purchase the label.
                  </p>

                  {/* Step 1: Get Rates */}
                  {rates.length === 0 && !fetchingRates && (
                    <button
                      type="button"
                      onClick={handleGetRates}
                      className="btn-outline"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      Get USPS Rates
                    </button>
                  )}

                  {fetchingRates && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--brown-light)", fontSize: "0.88rem" }}>
                      <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                      Fetching rates…
                    </div>
                  )}

                  {ratesError && (
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c0392b", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 4, padding: "8px 12px", marginTop: 8 }}>
                      {ratesError}
                    </p>
                  )}

                  {/* Step 2: Rate selection */}
                  {rates.length > 0 && (
                    <div>
                      <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 12 }}>
                        Select a Rate
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                        {rates.map((rate) => {
                          const isSelected = selectedRateId === rate.id;
                          return (
                            <button
                              key={rate.id}
                              type="button"
                              onClick={() => setSelectedRateId(rate.id)}
                              style={{
                                textAlign: "left",
                                padding: "14px 18px",
                                borderRadius: 6,
                                border: isSelected ? "2px solid var(--gold)" : "1px solid var(--border)",
                                background: isSelected ? "rgba(196,146,74,0.05)" : "var(--cream)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 8,
                                transition: "border-color 0.15s, background 0.15s",
                              }}
                            >
                              <div>
                                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--brown)", margin: 0 }}>
                                  {rate.service}
                                </p>
                                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, margin: "2px 0 0" }}>
                                  {rate.carrier}
                                  {rate.delivery_days != null ? ` · ${rate.delivery_days} day${rate.delivery_days !== 1 ? "s" : ""}` : ""}
                                  {rate.est_delivery_date ? ` · Est. ${new Date(rate.est_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                                </p>
                              </div>
                              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--brown)", margin: 0 }}>
                                ${Number(rate.rate).toFixed(2)}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {labelError && (
                        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c0392b", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 4, padding: "8px 12px", marginBottom: 12 }}>
                          {labelError}
                        </p>
                      )}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={handlePurchaseLabel}
                          disabled={!selectedRateId || purchasingLabel}
                          className="btn-primary"
                          style={{ opacity: (!selectedRateId || purchasingLabel) ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: 8 }}
                        >
                          {purchasingLabel ? (
                            <>
                              <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                              Purchasing label…
                            </>
                          ) : (
                            "Purchase Label"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRates([]); setShipmentId(null); setSelectedRateId(null); setRatesError(""); }}
                          style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--brown-light)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                ✓ {statusSuccess}
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
