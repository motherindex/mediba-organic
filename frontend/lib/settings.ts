// lib/settings.ts
// API keys are read from environment variables.
// Ship-from address fields are stored in Supabase (Mediba edits them herself).

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// API keys — always from env vars, never from DB
export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}


export function getStripeWebhookSecret(): string {
  const key = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return key;
}

export function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return key;
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "orders@resend.dev";
}

export function getEasyPostApiKey(): string {
  const key = process.env.EASYPOST_API_KEY;
  if (!key) throw new Error("EASYPOST_API_KEY is not set");
  return key;
}

// Ship-from address — still from DB (Mediba edits these herself)
export async function getShipFromAddress(): Promise<{
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}> {
  const keys = [
    "shippo_from_name",
    "shippo_from_street",
    "shippo_from_city",
    "shippo_from_state",
    "shippo_from_zip",
    "shippo_from_phone",
  ];

  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value ?? "";
  }

  return {
    name: map.shippo_from_name ?? "",
    street: map.shippo_from_street ?? "",
    city: map.shippo_from_city ?? "",
    state: map.shippo_from_state ?? "",
    zip: map.shippo_from_zip ?? "",
    phone: map.shippo_from_phone ?? "",
  };
}
