// lib/settings.ts
// Fetches API keys from the settings table in Supabase.
// This means the client enters their own keys in /admin/settings —
// you (the developer) never need access to their Stripe, Resend, or Shippo accounts.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getSetting(key: string): Promise<string> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", keys);

  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value ?? "";
  }
  return result;
}