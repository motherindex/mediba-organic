"use client";
// app/admin/settings/page.tsx

import { useEffect, useState } from "react";
import { F } from "@/lib/form-styles";

type SettingKey =
  | "shippo_from_name"
  | "shippo_from_street"
  | "shippo_from_city"
  | "shippo_from_state"
  | "shippo_from_zip"
  | "shippo_from_phone";

const DEFAULT_VALUES: Record<SettingKey, string> = {
  shippo_from_name: "",
  shippo_from_street: "",
  shippo_from_city: "",
  shippo_from_state: "",
  shippo_from_zip: "",
  shippo_from_phone: "",
};

export default function SettingsPage() {
  const [values, setValues] = useState<Record<SettingKey, string>>(DEFAULT_VALUES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ settings }) => {
        if (settings) setValues((prev) => ({ ...prev, ...settings }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSaving(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Failed to save settings. Please try again.");
    }
  }

  function set(key: SettingKey, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px", fontFamily: "'Jost', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ color: "var(--brown-light)", fontWeight: 300 }}>Loading settings…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "48px 20px 80px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
          Admin · Settings
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 3vw, 2.6rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1, marginBottom: 6 }}>
          Shipping Address
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 32, lineHeight: 1.7 }}>
          Your ship-from address is printed on all shipping labels. Keep this up to date.
        </p>

        {/* Address card */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 24px 28px", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--brown)", margin: "0 0 20px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            Ship-From Address
          </h2>

          {/* Name — full width */}
          <div style={F.fieldGroup}>
            <label style={F.label}>Ship-From Name</label>
            <input
              type="text"
              value={values.shippo_from_name}
              onChange={(e) => set("shippo_from_name", e.target.value)}
              placeholder="Mediba's Organic"
              style={F.input}
            />
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.73rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 4, lineHeight: 1.5 }}>
              The name that appears on shipping labels as the sender.
            </p>
          </div>

          {/* Street — full width */}
          <div style={F.fieldGroup}>
            <label style={F.label}>Street Address</label>
            <input
              type="text"
              value={values.shippo_from_street}
              onChange={(e) => set("shippo_from_street", e.target.value)}
              placeholder="123 Main St"
              style={F.input}
            />
          </div>

          {/* City + State + ZIP — 3 col */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={F.label}>City</label>
              <input
                type="text"
                value={values.shippo_from_city}
                onChange={(e) => set("shippo_from_city", e.target.value)}
                placeholder="New York"
                style={F.input}
              />
            </div>
            <div>
              <label style={F.label}>State</label>
              <input
                type="text"
                value={values.shippo_from_state}
                onChange={(e) => set("shippo_from_state", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="NY"
                maxLength={2}
                style={F.input}
              />
            </div>
            <div>
              <label style={F.label}>ZIP Code</label>
              <input
                type="text"
                value={values.shippo_from_zip}
                onChange={(e) => set("shippo_from_zip", e.target.value)}
                placeholder="10001"
                style={F.input}
              />
            </div>
          </div>

          {/* Phone — full width */}
          <div style={F.fieldGroup}>
            <label style={F.label}>Phone Number</label>
            <input
              type="text"
              value={values.shippo_from_phone}
              onChange={(e) => set("shippo_from_phone", e.target.value)}
              placeholder="+1 555 000 0000"
              style={F.input}
            />
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.73rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 4, lineHeight: 1.5 }}>
              Required by some carriers for label generation.
            </p>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="banner-success" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            Address saved successfully!
          </div>
        )}
        {error && <div className="banner-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1, minWidth: 160 }}>
          {saving ? "Saving…" : "Save Address"}
        </button>

        {/* API keys info box */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 6 }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--brown)", fontWeight: 600, marginBottom: 4 }}>
            API Keys & Integrations
          </p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, lineHeight: 1.7 }}>
            Stripe, Resend, and EasyPost API keys are configured by your developer and stored securely as environment variables. To update them, contact your developer.
          </p>
        </div>

      </div>
    </main>
  );
}
