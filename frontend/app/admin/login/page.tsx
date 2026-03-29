"use client";
// app/admin/login/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const inputStyle = {
    width: "100%",
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.92rem",
    color: "var(--brown)",
    background: "var(--cream)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--brown-mid)",
    marginBottom: 8,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: "var(--brown)", lineHeight: 1.2 }}>
            Mediba&apos;s Organic
          </p>
          <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 6 }}>
            Admin Access
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 600, color: "var(--brown)", marginBottom: 6 }}>
            Sign In
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 28, lineHeight: 1.6 }}>
            Secure access for the Mediba&apos;s Organic store manager.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mediba-organic.com"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <Link
                  href="/admin/forgot-password"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.75rem",
                    color: "var(--green)",
                    textDecoration: "none",
                    fontWeight: 400,
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={inputStyle}
              />
            </div>

            {errorMessage && (
              <p style={{ fontSize: "0.82rem", color: "#c0392b", marginTop: 14, marginBottom: 4 }}>
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 24, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}