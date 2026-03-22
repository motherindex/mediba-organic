"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ProductImageUpload } from "@/components/product-image-upload";
import { F } from "@/lib/form-styles";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const id = params.id as string;

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [images, setImages]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products").select("*").eq("id", id).single();

      if (error || !data) {
        setErrorMessage("Could not load product.");
        setLoading(false);
        return;
      }

      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setPrice(data.price?.toString() ?? "");
      setImages(data.images?.length > 0 ? data.images : []);
      setLoading(false);
    }

    if (id) loadProduct();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("products")
      .update({ name, description, price: Number(price), images })
      .eq("id", id);

    setSaving(false);

    if (error) { setErrorMessage(error.message); return; }

    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading product…</p>
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

        <p
          style={{
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 6,
          }}
        >
          Admin · Products
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--brown)",
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          Edit Product
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 36 }}>
          Update product details for the Mediba&apos;s Organic store.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "36px 32px",
          }}
        >
          <div style={F.fieldGroup}>
            <label style={F.label}>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={F.input}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={F.textarea}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Price (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={F.input}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Product Images</label>
            <ProductImageUpload value={images} onChange={setImages} />
          </div>

          {errorMessage && (
            <p style={{ fontSize: "0.82rem", color: "#c0392b", marginBottom: 16 }}>
              {errorMessage}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}