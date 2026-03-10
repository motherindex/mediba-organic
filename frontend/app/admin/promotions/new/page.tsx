"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type ProductOption = {
  id: string;
  name: string;
};

export default function NewPromotionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("percent_off");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from("products").select("id, name").order("name");
      setProducts((data ?? []) as ProductOption[]);
    }

    loadProducts();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!productId) {
      setLoading(false);
      setErrorMessage("Please select a product.");
      return;
    }

    const normalizedValue = type === "bogo" ? 1 : Number(value);

    if (type !== "bogo" && (Number.isNaN(normalizedValue) || normalizedValue <= 0)) {
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

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin/promotions");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
          New Promotion
        </p>
        <h1 className="mt-2 text-4xl font-bold">Create Promotion</h1>
        <p className="mt-3 text-[#6B7D52]">
          Attach a promotional offer to a store product.
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
              disabled={loading}
              className="rounded-xl bg-[#8B6B2C] px-6 py-3 font-medium text-white transition hover:bg-[#715622] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Promotion"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/promotions")}
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