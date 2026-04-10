// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_KEYS = [
  "shippo_from_name",
  "shippo_from_street",
  "shippo_from_city",
  "shippo_from_state",
  "shippo_from_zip",
  "shippo_from_phone",
];

// GET — fetch ship-from address fields only
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", ALLOWED_KEYS)
    .order("key");

  if (error) {
    console.error("[settings GET] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value ?? "";
  }

  return NextResponse.json({ settings });
}

// POST — save ship-from address fields only
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    await supabaseAdmin
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }

  return NextResponse.json({ ok: true });
}
