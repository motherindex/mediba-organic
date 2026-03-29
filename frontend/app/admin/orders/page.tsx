"use client";
// app/admin/orders/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(196,146,74,0.12)",  color: "#C4924A" },
  processing: { bg: "rgba(74,103,65,0.12)",   color: "#4A6741" },
  shipped:    { bg: "rgba(59,90,160,0.12)",   color: "#3B5AA0" },
  delivered:  { bg: "rgba(74,103,65,0.18)",   color: "#2E6B25" },
  cancelled:  { bg: "rgba(180,50,50,0.1)",    color: "#B43232" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<{ orderId: string; labelUrl: string | null; trackingNumber: string | null; error?: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(({ orders }) => {
        setOrders(orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }

  async function handleGenerateLabels() {
    if (selected.size === 0) return;
    setGenerating(true);
    setShowResults(false);

    const res = await fetch("/api/shippo/label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_ids: Array.from(selected) }),
    });

    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      alert(data.error ?? "Failed to generate labels.");
      return;
    }

    setResults(data.results ?? []);
    setShowResults(true);

    // Open all successful label PDFs in new tabs
    for (const result of data.results ?? []) {
      if (result.labelUrl) {
        window.open(result.labelUrl, "_blank");
      }
    }

    // Refresh orders list
    const refreshed = await fetch("/api/orders").then((r) => r.json());
    setOrders(refreshed.orders ?? []);
    setSelected(new Set());
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading orders…</p>
      </main>
    );
  }

  const allSelected = orders.length > 0 && selected.size === orders.length;
  const someSelected = selected.size > 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
              Admin · Orders
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1 }}>
              Orders
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
              {orders.length} total orders
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {someSelected && (
              <button
                onClick={handleGenerateLabels}
                disabled={generating}
                className="btn-primary"
                style={{ opacity: generating ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
              >
                {generating ? (
                  <>
                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Generating {selected.size} label{selected.size > 1 ? "s" : ""}…
                  </>
                ) : (
                  <>📦 Generate {selected.size} Label{selected.size > 1 ? "s" : ""}</>
                )}
              </button>
            )}
            <Link href="/admin" className="btn-outline">← Dashboard</Link>
          </div>
        </div>

        {/* Label results banner */}
        {showResults && results.length > 0 && (
          <div style={{ marginBottom: 20, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--brown)", marginBottom: 12 }}>
              Label Generation Results
            </p>
            {results.map((r) => (
              <div key={r.orderId} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontSize: "0.85rem", fontFamily: "'Jost', sans-serif" }}>
                {r.labelUrl ? (
                  <>
                    <span style={{ color: "var(--green)", fontWeight: 600 }}>✓</span>
                    <span style={{ color: "var(--brown)" }}>#{r.orderId.slice(0, 8).toUpperCase()}</span>
                    <span style={{ color: "var(--brown-light)" }}>Tracking: {r.trackingNumber}</span>
                    <a href={r.labelUrl} target="_blank" rel="noreferrer" style={{ color: "var(--gold)", fontWeight: 500, textDecoration: "none" }}>
                      Print Label →
                    </a>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#c0392b", fontWeight: 600 }}>✗</span>
                    <span style={{ color: "var(--brown)" }}>#{r.orderId.slice(0, 8).toUpperCase()}</span>
                    <span style={{ color: "#c0392b" }}>{r.error}</span>
                  </>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowResults(false)}
              style={{ marginTop: 8, fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--brown-light)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8 }}>
          {orders.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {/* Select all checkbox */}
                    <th style={{ padding: "14px 8px 14px 16px", width: 40 }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--gold)" }}
                      />
                    </th>
                    {["Order", "Customer", "Total", "Status", "Date", "Label", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "14px 16px 14px 0", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brown-light)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => {
                    const status = order.status ?? "pending";
                    const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
                    const isSelected = selected.has(order.id);

                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: "1px solid var(--cream-dark)",
                          verticalAlign: "middle",
                          background: isSelected ? "rgba(196,146,74,0.04)" : "transparent",
                          transition: "background 0.1s",
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: "14px 8px 14px 16px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(order.id)}
                            style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--gold)" }}
                          />
                        </td>

                        <td style={{ padding: "14px 16px 14px 0", fontWeight: 600, color: "var(--brown)", whiteSpace: "nowrap" }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>

                        <td style={{ padding: "14px 16px 14px 0", color: "var(--brown)", maxWidth: 200 }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.customer_email ?? "—"}
                          </span>
                          {order.customer_name && (
                            <span style={{ display: "block", fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300 }}>
                              {order.customer_name}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px 14px 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--gold)", whiteSpace: "nowrap" }}>
                          ${Number(order.price ?? 0).toFixed(2)}
                        </td>

                        <td style={{ padding: "14px 16px 14px 0" }}>
                          <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: colors.bg, color: colors.color, borderRadius: 3, padding: "3px 8px", whiteSpace: "nowrap" }}>
                            {status}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px 14px 0", color: "var(--brown-light)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>

                        {/* Label link if exists */}
                        <td style={{ padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>
                          {order.label_url ? (
                            <a
                              href={order.label_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "var(--gold)", textDecoration: "none" }}
                            >
                              🖨️ Print
                            </a>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "var(--brown-light)", fontWeight: 300 }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px 14px 0", whiteSpace: "nowrap" }}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", fontWeight: 500, color: "var(--green)", textDecoration: "none" }}
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "56px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300 }}>No orders yet.</p>
            </div>
          )}
        </div>

        {someSelected && (
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 12, textAlign: "right" }}>
            {selected.size} order{selected.size > 1 ? "s" : ""} selected — click "Generate Labels" to create shipping labels and notify customers
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}