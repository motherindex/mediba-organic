import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Promotion, getCartLineTotal, getProductPricing } from "@/lib/pricing";

type CheckoutItemInput = {
  id: string;
  quantity: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const productIds = items
      .map((item: CheckoutItemInput) => item.id)
      .filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No valid products provided." },
        { status: 400 }
      );
    }

    const [
      { data: products, error: productsError },
      { data: promotions, error: promotionsError },
    ] = await Promise.all([
      supabase.from("products").select("*").in("id", productIds),
      supabase.from("promotions").select("*").in("product_id", productIds),
    ]);

    if (productsError) {
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      );
    }

    if (promotionsError) {
      return NextResponse.json(
        { error: promotionsError.message },
        { status: 500 }
      );
    }

    const productMap = new Map(
      (products ?? []).map((product: any) => [product.id, product])
    );
    const activePromotions = (promotions ?? []) as Promotion[];

    const normalizedItems = items
      .map((item: CheckoutItemInput) => {
        const product = productMap.get(item.id);

        if (!product) {
          return null;
        }

        const quantity = Math.max(1, Number(item.quantity || 1));

        const pricing = getProductPricing({
          productId: product.id,
          basePrice: Number(product.price),
          promotions: activePromotions,
        });

        const lineTotal = getCartLineTotal({
          unitPrice: pricing.finalPrice,
          quantity,
          promotionType: pricing.promotion?.type,
        });

        return {
          product_id: product.id,
          name: product.name,
          quantity,
          image: product.images?.[0] ?? null,
          base_price: Number(product.price),
          unit_price: pricing.finalPrice,
          promotion_type: pricing.promotion?.type ?? null,
          promotion_value: pricing.promotion?.value ?? null,
          line_total: lineTotal,
        };
      })
      .filter(Boolean);

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "No purchasable products found." },
        { status: 400 }
      );
    }

    const subtotal = normalizedItems.reduce(
      (sum: number, item: any) => sum + Number(item.line_total),
      0
    );

    return NextResponse.json({
      ok: true,
      mode: "checkout_foundation",
      message:
        "Checkout foundation created. Connect this payload to Stripe Checkout when the client is ready.",
      currency: "usd",
      items: normalizedItems,
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(subtotal.toFixed(2)),
    });
  } catch (error) {
    console.error("Checkout route error:", error);

    return NextResponse.json(
      { error: "Failed to initialize checkout." },
      { status: 500 }
    );
  }
}