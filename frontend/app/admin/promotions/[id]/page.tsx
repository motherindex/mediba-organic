"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type ProductOption = {
  id: string;
  name: string;
};

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const id = params.id as string;

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("percent_off");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      const [{ data: productsData, error: productsError }, { data: promotion, error: promotionError }] =
        await Promise.all([
          supabase.from("products").select("id, name").order("name"),
          supabase.from("promotions").select("*").eq("id", id).single(),
        ]);

      if (productsError) {
        setErrorMessage(productsError.message);
        setLoading(false);
        return;
      }

      if (promotionError || !promotion) {
        setErrorMessage(promotionError?.message ?? "Promotion not found.");
        setLoading(false);
        return;
      }

      setProducts((productsData ?? []) as ProductOption[]);
      setProductId(promotion.product_id ?? "");
      setType(promotion.type ?? "percent_off");
      setValue(
        promotion.type === "bogo" ? "" : promotion.value != null ? String(promotion.value) : ""
      );
      setStartDate(
        promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : ""
      );
      setEndDate(
        promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : ""
      );

      setLoading(false);
    }

    if (id) {
      loadData();
    }
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    if (!productId) {
      setSaving(false);
      setErrorMessage("Please select a product.");
      return;
    }

    const normalizedValue = type === "bogo" ? 1 : Number(value);

    if (type !== "bogo" && (Number.isNaN(normalizedValue) || normalizedValue <= 0)) {
      setSaving(false);
      setErrorMessage("Please enter a valid promotion value.");
      return;
    }

    const { error } = await supabase
      .from("promotions")
      .update({
        product_id: productId,
        type,
        value: normalizedValue,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/promotions");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this promotion?");
    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");

    const { error } = await supabase.from("promotions").delete().eq("id", id);

    setDeleting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/promotions");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
        <div className="mx-auto max-w-3xl">
          <p className="text-[#6B7D52]">Loading promotion...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
          Edit Promotion
        </p>
        <h1 className="mt-2 text-4xl font-bold">Update Promotion</h1>
        <p className="mt-3 text-[#6B7D52]">
          Edit this promotional offer and save changes to the storefront.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#E7DCC8] bg-[#FFFDF8] p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#8B6B2C]"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Promotion Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#556B2F]"
              required
            >
              <option value="bogo">BOGO</option>
              <option value="percent_off">Percentage Off</option>
              <option value="amount_off">Amount Off</option>
            </select>
          </div>

          {type !== "bogo" ? (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                {type === "percent_off" ? "Percentage Off" : "Amount Off"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#8B6B2C]"
                placeholder={type === "percent_off" ? "Enter percentage" : "Enter amount"}
                required
              />
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#556B2F]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#556B2F]"
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="mt-6 text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#8B6B2C] px-6 py-3 font-medium text-white transition hover:bg-[#715622] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Update Promotion"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/promotions")}
              className="rounded-xl border border-[#556B2F] px-6 py-3 font-medium text-[#556B2F] transition hover:bg-[#556B2F] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-300 px-6 py-3 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleting ? "Deleting..." : "Delete Promotion"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}