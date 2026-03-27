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
  const [successMessage, setSuccessMessage] = useState("");

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

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({ name: name.trim(), description: description.trim(), price: Number(price), images })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Changes saved successfully! Redirecting…");
    setTimeout(() => {
      router.push("/admin/products");
      router.refresh();
    }, 1200);
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
          Edit Product
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 28 }}>
          Update product details for the Mediba&apos;s Organic store.
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
              style={F.input}
              disabled={saving || !!successMessage}
            />
          </div>

          <div style={F.fieldGroup}>
            <label style={F.label}>
              Description <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={F.textarea}
              disabled={saving || !!successMessage}
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
              style={F.input}
              disabled={saving || !!successMessage}
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
              disabled={saving || !!successMessage}
              className="btn-primary"
              style={{ opacity: saving || successMessage ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
