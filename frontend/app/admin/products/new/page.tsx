"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ProductImageUpload } from "@/components/product-image-upload";
import { F } from "@/lib/form-styles";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]             = useState("");
  const [images, setImages]           = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: Number(price),
      images,
    });

    setLoading(false);

    if (error) { setErrorMessage(error.message); return; }

    router.push("/admin/products");
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
          Add Product
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 36 }}>
          Create a new product for the Mediba&apos;s Organic store.
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
              placeholder="e.g. Raw Shea Butter 250g"
              required
              style={F.input}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product — ingredients, benefits, usage..."
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
              placeholder="0.00"
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
              disabled={loading}
              className="btn-primary"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : "Save Product"}
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