import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch reviews (optionally filtered by product_id)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  let query = supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[reviews GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews: data });
}

// POST — submit a new review (public — no auth required)
export async function POST(request: Request) {
  const body = await request.json();
  const { product_id, reviewer_name, rating, body: reviewBody } = body;

  if (!product_id || !rating) {
    return NextResponse.json(
      { error: "product_id and rating are required." },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      product_id,
      reviewer_name: reviewer_name?.trim() || null,
      rating,
      body: reviewBody?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[reviews POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
