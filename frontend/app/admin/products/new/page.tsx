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
  const [successMessage, setSuccessMessage] = useState("");

  function validate(): string | null {
    if (!name.trim()) return "Product name is required.";
    if (!description.trim()) return "Description is required.";
    if (!price || isNaN(Number(price))) return "Please enter a valid price.";
    if (Number(price) <= 0) return "Price must be greater than $0.00.";
    return null;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      images,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Product created successfully! Redirecting…");
    setTimeout(() => {
      router.push("/admin/products");
      router.refresh();
    }, 1200);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "48px 20px 80px",
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
            fontSize: "clamp(1.7rem, 3vw, 2.6rem)",
            fontWeight: 600,
            color: "var(--brown)",
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          Add Product
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 28 }}>
          Create a new product for the Mediba&apos;s Organic store.
        </p>

        {successMessage && (
          <div className="banner-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="admin-form-card">

          <div style={F.fieldGroup}>
            <label style={F.label}>
              Product Name <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raw Shea Butter 250g"
              style={F.input}
              disabled={loading || !!successMessage}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>
              Description <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product — ingredients, benefits, usage…"
              style={F.textarea}
              disabled={loading || !!successMessage}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>
              Price (USD) <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              style={F.input}
              disabled={loading || !!successMessage}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>Product Images</label>
            <ProductImageUpload value={images} onChange={setImages} />
          </div>

          {errorMessage && (
            <div className="banner-error">
              {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="btn-primary"
              style={{ opacity: loading || successMessage ? 0.7 : 1 }}
            >
              {loading ? "Saving…" : "Save Product"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
