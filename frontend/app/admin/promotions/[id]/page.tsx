"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { F } from "@/lib/form-styles";

type ProductOption = { id: string; name: string };

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const id = params.id as string;

  const [products, setProducts]   = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType]           = useState("percent_off");
  const [value, setValue]         = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [{ data: productsData }, { data: promotion, error: promoError }] = await Promise.all([
        supabase.from("products").select("id, name").order("name"),
        supabase.from("promotions").select("*").eq("id", id).single(),
      ]);

      if (promoError || !promotion) {
        setErrorMessage(promoError?.message ?? "Promotion not found.");
        setLoading(false);
        return;
      }

      setProducts((productsData ?? []) as ProductOption[]);
      setProductId(promotion.product_id ?? "");
      setType(promotion.type ?? "percent_off");
      setValue(promotion.type === "bogo" ? "" : promotion.value != null ? String(promotion.value) : "");
      setStartDate(promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : "");
      setEndDate(promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : "");
      setLoading(false);
    }

    if (id) loadData();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    if (!productId) { setSaving(false); setErrorMessage("Please select a product."); return; }

    const normalizedValue = type === "bogo" ? 1 : Number(value);
    if (type !== "bogo" && (isNaN(normalizedValue) || normalizedValue <= 0)) {
      setSaving(false);
      setErrorMessage("Please enter a valid promotion value.");
      return;
    }

    const { error } = await supabase.from("promotions")
      .update({ product_id: productId, type, value: normalizedValue, start_date: startDate || null, end_date: endDate || null })
      .eq("id", id);

    setSaving(false);
    if (error) { setErrorMessage(error.message); return; }
    router.push("/admin/promotions");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this promotion?")) return;
    setDeleting(true);
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    setDeleting(false);
    if (error) { setErrorMessage(error.message); return; }
    router.push("/admin/promotions");
    router.refresh();
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading promotion…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "64px 24px 96px",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Admin · Promotions
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.9rem, 3vw, 2.6rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1, marginBottom: 6 }}>
          Edit Promotion
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 36 }}>
          Update this promotional offer and save changes to the storefront.
        </p>

        <form onSubmit={handleSubmit} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "36px 32px" }}>

          <div style={F.fieldGroup}>
            <label style={F.label}>Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required style={F.select}>
              <option value="">Select a product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Promotion Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} required style={F.select}>
              <option value="bogo">BOGO — Buy One Get One</option>
              <option value="percent_off">Percentage Off</option>
              <option value="amount_off">Amount Off</option>
            </select>
          </div>

          {type !== "bogo" && (
            <div style={F.fieldGroup}>
              <label style={F.label}>{type === "percent_off" ? "Percentage Off (%)" : "Amount Off ($)"}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percent_off" ? "e.g. 20" : "e.g. 5.00"}
                required
                style={F.input}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <label style={F.label}>Start Date</label>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={F.input} />
            </div>
            <div>
              <label style={F.label}>End Date</label>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={F.input} />
            </div>
          </div>

          {errorMessage && <p style={{ fontSize: "0.82rem", color: "#c0392b", marginBottom: 16 }}>{errorMessage}</p>}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Update Promotion"}
            </button>
            <button type="button" onClick={() => router.push("/admin/promotions")} className="btn-outline">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c0392b",
                background: "none",
                border: "1.5px solid rgba(192,57,43,0.35)",
                borderRadius: 4,
                padding: "11px 22px",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}