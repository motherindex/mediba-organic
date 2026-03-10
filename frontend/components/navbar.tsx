"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

export function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#E7DCC8] bg-[#FFFDF8]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center justify-center md:justify-start">
            <img
              src="/logo.png"
              alt="Mediba's Organic"
              className="h-[52px] w-auto sm:h-[60px]"
            />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-medium text-[#3E2E17] md:justify-end">
            <Link href="/" className="transition hover:text-[#8B6B2C]">
              Home
            </Link>

            <Link href="/shop" className="transition hover:text-[#8B6B2C]">
              Shop
            </Link>

            <a href="/#about" className="transition hover:text-[#556B2F]">
              About
            </a>

            <a href="/#contact" className="transition hover:text-[#556B2F]">
              Contact
            </a>

            <Link
              href="/cart"
              className="rounded-full border border-[#E7DCC8] px-4 py-2 transition hover:border-[#8B6B2C] hover:text-[#8B6B2C]"
            >
              Cart ({itemCount})
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}