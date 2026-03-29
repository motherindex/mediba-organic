"use client";
// app/admin/settings/page.tsx

import { useEffect, useState } from "react";
import { F } from "@/lib/form-styles";

type SettingKey =
  | "stripe_secret_key"
  | "stripe_publishable_key"
  | "stripe_webhook_secret"
  | "resend_api_key"
  | "resend_from_email"
  | "shippo_api_key"
  | "shippo_from_name"
  | "shippo_from_street"
  | "shippo_from_city"
  | "shippo_from_state"
  | "shippo_from_zip"
  | "shippo_from_phone";

type Field = {
  key: SettingKey;
  label: string;
  placeholder: string;
  section: string;
  secret?: boolean;
  hint?: string;
  type?: string;
};

const FIELDS: Field[] = [
  // ── Stripe ──────────────────────────────────────────────────
  {
    key: "stripe_secret_key",
    label: "Secret Key",
    placeholder: "sk_live_...",
    section: "Stripe",
    secret: true,
    hint: "Stripe Dashboard → Developers → API Keys",
  },
  {
    key: "stripe_publishable_key",
    label: "Publishable Key",
    placeholder: "pk_live_...",
    section: "Stripe",
    hint: "Stripe Dashboard → Developers → API Keys",
  },
  {
    key: "stripe_webhook_secret",
    label: "Webhook Secret",
    placeholder: "whsec_...",
    section: "Stripe",
    secret: true,
    hint: "Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret",
  },

  // ── Resend ───────────────────────────────────────────────────
  {
    key: "resend_api_key",
    label: "Resend API Key",
    placeholder: "re_...",
    section: "Email (Resend)",
    secret: true,
    hint: "Resend Dashboard → API Keys → Create API Key",
  },
  {
    key: "resend_from_email",
    label: "From Email Address",
    placeholder: "orders@yourdomain.com",
    section: "Email (Resend)",
    hint: "Must be from a verified domain in Resend. Customers will receive emails from this address.",
  },

  // ── Shippo ───────────────────────────────────────────────────
  {
    key: "shippo_api_key",
    label: "Shippo API Key",
    placeholder: "shippo_live_...",
    section: "Shipping (Shippo)",
    secret: true,
    hint: "Shippo Dashboard → API → API Keys → Live token",
  },
  {
    key: "shippo_from_name",
    label: "Ship-From Name",
    placeholder: "Mediba's Organic",
    section: "Shipping (Shippo)",
    hint: "The name that appears on shipping labels as the sender",
  },
  {
    key: "shippo_from_street",
    label: "Street Address",
    placeholder: "123 Main St",
    section: "Shipping (Shippo)",
  },
  {
    key: "shippo_from_city",
    label: "City",
    placeholder: "New York",
    section: "Shipping (Shippo)",
  },
  {
    key: "shippo_from_state",
    label: "State",
    placeholder: "NY",
    section: "Shipping (Shippo)",
  },
  {
    key: "shippo_from_zip",
    label: "ZIP Code",
    placeholder: "10001",
    section: "Shipping (Shippo)",
  },
  {
    key: "shippo_from_phone",
    label: "Phone Number",
    placeholder: "+1 555 000 0000",
    section: "Shipping (Shippo)",
    hint: "Required by some carriers for label generation",
  },
];

const SECTIONS = ["Stripe", "Email (Resend)", "Shipping (Shippo)"];

const SECTION_HINTS: Record<string, string> = {
  "Stripe": "Handles payment processing. Create an account at stripe.com → complete identity verification → switch to live mode → copy live API keys.",
  "Email (Resend)": "Sends order confirmation and shipping emails to customers. Create an account at resend.com → verify your domain → create an API key.",
  "Shipping (Shippo)": "Generates real shipping labels for USPS, UPS, and FedEx. Create an account at goshippo.com → go to API settings → copy your live API token → enter your ship-from address below.",
};

const DEFAULT_VALUES: Record<SettingKey, string> = {
  stripe_secret_key: "",
  stripe_publishable_key: "",
  stripe_webhook_secret: "",
  resend_api_key: "",
  resend_from_email: "",
  shippo_api_key: "",
  shippo_from_name: "",
  shippo_from_street: "",
  shippo_from_city: "",
  shippo_from_state: "",
  shippo_from_zip: "",
  shippo_from_phone: "",
};

export default function SettingsPage() {
  const [values, setValues] = useState<Record<SettingKey, string>>(DEFAULT_VALUES);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
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
          Integrations & API Keys
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 32, lineHeight: 1.7 }}>
          Enter your API keys and store details below. Everything is stored securely — your developer does not have access to these values.
        </p>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const sectionFields = FIELDS.filter((f) => f.section === section);
          const configuredCount = sectionFields.filter((f) => values[f.key]).length;
          const allConfigured = configuredCount === sectionFields.length;

          return (
            <div key={section} style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 24px 28px", marginBottom: 20 }}>

              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--brown)", margin: 0 }}>
                  {section}
                </h2>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "3px 10px", borderRadius: 3,
                  background: allConfigured ? "rgba(74,103,65,0.1)" : "rgba(196,146,74,0.1)",
                  color: allConfigured ? "var(--green)" : "var(--gold)",
                }}>
                  {allConfigured ? "✓ Configured" : `${configuredCount}/${sectionFields.length} fields`}
                </span>
              </div>

              {/* Section hint */}
              {SECTION_HINTS[section] && (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--brown-light)", fontWeight: 300, lineHeight: 1.7, marginBottom: 20, background: "var(--cream)", padding: "10px 14px", borderRadius: 4 }}>
                  {SECTION_HINTS[section]}
                </p>
              )}

              {/* Grid for address fields */}
              <div style={{
                display: "grid",
                gridTemplateColumns: section === "Shipping (Shippo)" ? "repeat(auto-fit, minmax(200px, 1fr))" : "1fr",
                gap: 16,
              }}>
                {sectionFields.map((field) => (
                  <div key={field.key}>
                    <label style={{ ...F.label, marginBottom: 4 }}>{field.label}</label>
                    {field.hint && (
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.73rem", color: "var(--brown-light)", fontWeight: 300, marginBottom: 5, lineHeight: 1.5 }}>
                        {field.hint}
                      </p>
                    )}
                    <div style={{ position: "relative" }}>
                      <input
                        type={field.secret && !revealed[field.key] ? "password" : "text"}
                        value={values[field.key] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ ...F.input, paddingRight: field.secret ? 80 : undefined }}
                      />
                      {field.secret && (
                        <button
                          type="button"
                          onClick={() => setRevealed((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "var(--green)", letterSpacing: "0.06em" }}
                        >
                          {revealed[field.key] ? "Hide" : "Reveal"}
                        </button>
                      )}
                    </div>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", marginTop: 3, fontWeight: values[field.key] ? 500 : 300, color: values[field.key] ? "var(--green)" : "var(--brown-light)" }}>
                      {values[field.key] ? "✓ Set" : "Not configured"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Feedback */}
        {success && (
          <div className="banner-success" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            All settings saved successfully!
          </div>
        )}
        {error && <div className="banner-error" style={{ marginBottom: 16 }}>{error}</div>}

        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1, minWidth: 180 }}>
          {saving ? "Saving…" : "Save All Settings"}
        </button>

        {/* Security note */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(74,103,65,0.06)", border: "1px solid rgba(74,103,65,0.15)", borderRadius: 6 }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--green)", fontWeight: 500, marginBottom: 4 }}>🔒 Security Note</p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--brown-light)", fontWeight: 300, lineHeight: 1.7 }}>
            All API keys and settings are stored securely in your database and are only accessible by authenticated admins. Your developer does not have access to these values. Never share your secret keys with anyone.
          </p>
        </div>
      </div>
    </main>
  );
}