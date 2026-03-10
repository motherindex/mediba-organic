"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
          Admin Login
        </p>

        <h1 className="mt-2 text-4xl font-bold">Sign in</h1>

        <p className="mt-3 text-[#6B7D52]">
          Secure access for the Mediba’s Organic store manager.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 rounded-3xl border border-[#E7DCC8] bg-[#FFFDF8] p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-[#3E2E17]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#8B6B2C]"
              required
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-[#3E2E17]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-[#E7DCC8] bg-white px-4 py-3 outline-none transition focus:border-[#556B2F]"
              required
            />
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-[#8B6B2C] px-6 py-3 font-medium text-white transition hover:bg-[#715622] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}