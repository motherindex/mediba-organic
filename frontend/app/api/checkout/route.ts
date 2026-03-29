// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { Promotion, getCartLineTotal, getProductPricing } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

type CheckoutItemInput = {
  id: string;
  quantity: number;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Pull Stripe keys from Supabase settings (client-entered)
    const { stripe_secret_key, stripe_webhook_secret } = await getSettings([
      "stripe_secret_key",
      "stripe_webhook_secret",
    ]);

    if (!stripe_secret_key) {
      return NextResponse.json(
        { error: "Stripe is not configured yet. Please contact the store admin." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripe_secret_key, { apiVersion: "2024-04-10" });

    const body = await request.json();
    const items: CheckoutItemInput[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const productIds = items.map((i) => i.id).filter(Boolean);

    const [{ data: products, error: productsError }, { data: promotionsData }] =
      await Promise.all([
        supabase.from("products").select("*").in("id", productIds),
        supabase.from("promotions").select("*").in("product_id", productIds),
      ]);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    const productMap = new Map((products ?? []).map((p: any) => [p.id, p]));
    const promotions = (promotionsData ?? []) as Promotion[];

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) continue;

      const quantity = Math.max(1, Number(item.quantity || 1));
      const pricing = getProductPricing({
        productId: product.id,
        basePrice: Number(product.price),
        promotions,
      });

      const chargeableQty =
        pricing.promotion?.type === "bogo" ? Math.ceil(quantity / 2) : quantity;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
            images: product.images?.[0] ? [product.images[0]] : [],
            metadata: { product_id: product.id },
          },
          unit_amount: Math.round(pricing.finalPrice * 100),
        },
        quantity: chargeableQty,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No valid products found." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "ZA", "AU", "NG"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 799, currency: "usd" },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1499, currency: "usd" },
            display_name: "Express Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 3 },
            },
          },
        },
      ],
      customer_creation: "always",
      metadata: {
        cart: JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity }))),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message ?? "Checkout failed." }, { status: 500 });
  }
}