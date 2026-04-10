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

  // Upload tracking
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ succeeded: number; failed: number; results: any[] } | null>(null);

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

  async function handleExportCSV() {
    if (selected.size === 0) return;
    setGenerating(true);
    const res = await fetch("/api/orders/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_ids: Array.from(selected) }),
    });
    setGenerating(false);
    if (!res.ok) { alert("Failed to export orders."); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `easypost-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSelected(new Set());
  }

  async function handleBulkShip() {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResults(null);
    const form = new FormData();
    form.append("file", uploadFile);
    const res = await fetch("/api/orders/bulk-ship", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { alert(data.error ?? "Upload failed."); return; }
    setUploadResults(data);
    setUploadFile(null);
    // Refresh orders list
    const refreshed = await fetch("/api/orders").then((r) => r.json());
    setOrders(refreshed.orders ?? []);
  }

  function downloadTemplate() {
    const csv = "order_id,tracking_number,carrier\npaste-full-order-id-here,,USPS";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracking-upload-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const someSelected = selected.size > 0;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading orders…</p>
      </main>
    );
  }

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
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
              {someSelected && (
                <span style={{ marginLeft: 10, color: "var(--gold)" }}>· {selected.size} selected</span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {someSelected && (
              <button
                onClick={handleExportCSV}
                disabled={generating}
                className="btn-primary"
                style={{ opacity: generating ? 0.7 : 1, fontSize: "0.85rem" }}
              >
                {generating ? "Exporting…" : `⬇ Export ${selected.size} Order${selected.size !== 1 ? "s" : ""} for EasyPost`}
              </button>
            )}
            <button
              onClick={() => { setShowUpload((v) => !v); setUploadResults(null); }}
              className="btn-outline"
              style={{ fontSize: "0.85rem" }}
            >
              📥 Upload Tracking Numbers
            </button>
            <Link href="/admin" className="btn-outline">← Dashboard</Link>
          </div>
        </div>

        {/* Upload section */}
        {showUpload && (
          <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "20px 24px", marginBottom: 20 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--brown)", marginBottom: 8 }}>
              Upload Tracking Numbers
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 16, lineHeight: 1.6 }}>
              Upload a CSV with columns: <code>order_id</code>, <code>tracking_number</code>, <code>carrier</code> (optional, defaults to USPS).
              Orders will be marked as shipped and customers will be notified automatically.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
              <button onClick={downloadTemplate} className="btn-outline" style={{ fontSize: "0.8rem" }}>
                ⬇ Download Template
              </button>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                style={{ fontSize: "0.82rem", color: "var(--brown)" }}
              />
            </div>
            {uploadFile && (
              <p style={{ fontSize: "0.78rem", color: "var(--green)", marginBottom: 12 }}>
                ✓ {uploadFile.name} selected
              </p>
            )}
            <button
              onClick={handleBulkShip}
              disabled={!uploadFile || uploading}
              className="btn-primary"
              style={{ opacity: !uploadFile || uploading ? 0.7 : 1, fontSize: "0.85rem" }}
            >
              {uploading ? "Uploading…" : "Mark as Shipped + Notify Customers"}
            </button>
            {uploadResults && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: uploadResults.failed > 0 ? "#c0392b" : "var(--green)", marginBottom: 8 }}>
                  {uploadResults.succeeded} shipped successfully{uploadResults.failed > 0 ? `, ${uploadResults.failed} failed` : " ✓"}
                </p>
                {uploadResults.results.filter((r: any) => !r.success).map((r: any) => (
                  <p key={r.orderId} style={{ fontSize: "0.78rem", color: "#c0392b", margin: "2px 0" }}>
                    ✗ {r.orderId}: {r.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8 }}>
          {orders.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "14px 0 14px 16px", width: 40 }}>
                      <input
                        type="checkbox"
                        checked={orders.length > 0 && selected.size === orders.length}
                        onChange={toggleAll}
                        style={{ cursor: "pointer", accentColor: "var(--gold)" }}
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
                    const isChecked = selected.has(order.id);

                    return (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid var(--cream-dark)", verticalAlign: "middle", background: isChecked ? "rgba(196,146,74,0.04)" : "transparent" }}
                      >
                        <td style={{ padding: "14px 0 14px 16px" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(order.id)}
                            style={{ cursor: "pointer", accentColor: "var(--gold)" }}
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
      </div>
    </main>
  );
}
