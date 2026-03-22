"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { F } from "@/lib/form-styles";

type ProductOption = { id: string; name: string };

export default function NewPromotionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts]   = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType]           = useState("percent_off");
  const [value, setValue]         = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    supabase.from("products").select("id, name").order("name")
      .then(({ data }) => setProducts((data ?? []) as ProductOption[]));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!productId) { setLoading(false); setErrorMessage("Please select a product."); return; }

    const normalizedValue = type === "bogo" ? 1 : Number(value);
    if (type !== "bogo" && (isNaN(normalizedValue) || normalizedValue <= 0)) {
      setLoading(false);
      setErrorMessage("Please enter a valid promotion value.");
      return;
    }

    const { error } = await supabase.from("promotions").insert({
      product_id: productId,
      type,
      value: normalizedValue,
      start_date: startDate || null,
      end_date: endDate || null,
    });

    setLoading(false);
    if (error) { setErrorMessage(error.message); return; }
    router.push("/admin/promotions");
    router.refresh();
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
          Create Promotion
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 36 }}>
          Attach a promotional offer to a store product.
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
            <button type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving…" : "Save Promotion"}
            </button>
            <button type="button" onClick={() => router.push("/admin/promotions")} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}