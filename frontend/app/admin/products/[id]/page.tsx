"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ProductImageUpload } from "@/components/product-image-upload";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMessage("Could not load product.");
        setLoading(false);
        return;
      }

      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setPrice(data.price?.toString() ?? "");
      setImages(data.images && data.images.length > 0 ? data.images : []);
      setLoading(false);
    }

    if (id) {
      loadProduct();
    }
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        images,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[#6B7D52]">Loading product...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-4 py-14 text-[#3E2E17] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
          Edit Product
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Update Product</h1>
        <p className="mt-3 text-[#6B7D52]">
          Edit product details for the Mediba’s Organic store.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#8B6B2C]"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px] w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#556B2F]"
              placeholder="Enter product description"
              required
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#8B6B2C]"
              placeholder="Enter price"
              required
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Product Images</label>
            <ProductImageUpload value={images} onChange={setImages} />
          </div>

          {errorMessage ? (
            <p className="mt-6 text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#8B6B2C] px-6 py-3 font-medium text-white transition hover:bg-[#715622] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-xl border border-[#556B2F] px-6 py-3 font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}