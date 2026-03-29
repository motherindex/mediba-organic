"use client";
// app/admin/reset-password/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the session via URL hash — we need to wait for it
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/admin");
    }, 2500);
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

          {success ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(74,103,65,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 600, color: "var(--brown)", marginBottom: 12 }}>
                Password Updated
              </h1>
              <p style={{ fontSize: "0.88rem", color: "var(--brown-light)", fontWeight: 300, lineHeight: 1.7 }}>
                Your password has been changed. Redirecting to your dashboard…
              </p>
            </div>

          ) : !sessionReady ? (
            /* Waiting for session from email link */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: "0.88rem", color: "var(--brown-light)", fontWeight: 300 }}>
                Verifying your reset link…
              </p>
            </div>

          ) : (
            /* New password form */
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", fontWeight: 600, color: "var(--brown)", marginBottom: 6 }}>
                Set New Password
              </h1>
              <p style={{ fontSize: "0.85rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 28, lineHeight: 1.6 }}>
                Choose a strong password for your admin account.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-mid)", marginBottom: 8 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-mid)", marginBottom: 8 }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Password match indicator */}
                {confirm.length > 0 && (
                  <p style={{ fontSize: "0.75rem", marginTop: 6, fontWeight: 500, color: password === confirm ? "var(--green)" : "#c0392b" }}>
                    {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}

                {errorMessage && (
                  <p style={{ fontSize: "0.82rem", color: "#c0392b", marginTop: 12, marginBottom: 4 }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 24, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}