"use client";

import { useCart } from "@/components/cart-context";
import { getCartLineTotal } from "@/lib/pricing";
import { CheckoutButton } from "@/components/checkout-button";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    subtotal,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#F8F3E9] px-6 py-16 text-[#3E2E17]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8B6B2C]">
            Cart
          </p>
          <h1 className="mt-2 text-4xl font-bold">Your Cart</h1>
          <p className="mt-3 max-w-2xl text-[#6B7D52]">
            Review your selected products before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-3 text-[#6B7D52]">
              Add products from the shop to get started.
            </p>
            <a
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-[#556B2F] px-6 py-3 font-medium text-white transition hover:bg-[#445624]"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => {
                const lineTotal = getCartLineTotal({
                  unitPrice: item.price,
                  quantity: item.quantity,
                  promotionType: item.promotionType,
                });

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/300x300.png?text=Product"
                      }
                      alt={item.name}
                      className="h-28 w-28 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{item.name}</h2>

                      {item.promotionType === "bogo" ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#556B2F]">
                          BOGO Applied
                        </p>
                      ) : null}

                      <div className="mt-2">
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-[#8B6B2C]">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-[#8E8E8E] line-through">
                              ${item.originalPrice.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="font-bold text-[#8B6B2C]">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="h-10 w-10 rounded-lg border border-[#E7DCC8] bg-white text-lg"
                      >
                        -
                      </button>

                      <span className="min-w-[24px] text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="h-10 w-10 rounded-lg border border-[#E7DCC8] bg-white text-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-[#3E2E17]">
                        ${lineTotal.toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-sm font-medium text-[#556B2F] hover:text-[#8B6B2C]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-fit rounded-2xl border border-[#E7DCC8] bg-[#FFFDF8] p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Order Summary</h2>

              <div className="mt-6 flex items-center justify-between text-[#6B7D52]">
                <span>Subtotal</span>
                <span className="font-medium text-[#3E2E17]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-[#6B7D52]">
                <span>Shipping</span>
                <span className="font-medium text-[#3E2E17]">
                  Calculated later
                </span>
              </div>

              <div className="mt-6 border-t border-[#E7DCC8] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-[#8B6B2C]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <CheckoutButton />

                <a
                  href="/shop"
                  className="mt-4 block text-center text-sm font-medium text-[#556B2F] hover:text-[#8B6B2C]"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}