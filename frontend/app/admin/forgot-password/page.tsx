"use client";
// app/admin/forgot-password/page.tsx

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/admin/reset-password`
        : "/admin/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSent(true);
  }

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

        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "36px 32px" }}>

          {sent ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(74,103,65,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 600, color: "var(--brown)", marginBottom: 12 }}>
                Check your email
              </h1>
              <p style={{ fontSize: "0.88rem", color: "var(--brown-light)", fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>
                We sent a password reset link to <strong style={{ color: "var(--brown)", fontWeight: 500 }}>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 24 }}>
                Didn&apos;t get it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "var(--green)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 600, color: "var(--brown)", marginBottom: 6 }}>
                Reset Password
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 28, lineHeight: 1.6 }}>
                Enter your admin email and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-mid)", marginBottom: 8 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mediba-organic.com"
                    required
                    style={{
                      width: "100%",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.92rem",
                      color: "var(--brown)",
                      background: "var(--cream)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      padding: "11px 14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {errorMessage && (
                  <p style={{ fontSize: "0.82rem", color: "#c0392b", marginBottom: 12 }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link
              href="/admin/login"
              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--brown-light)", textDecoration: "none", fontWeight: 400 }}
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}