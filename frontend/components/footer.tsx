import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#e8dfcf] bg-[#F3EBDC] text-[#3E2E17]">
      <div className="mx-auto max-w-6xl px-6 py-14">

        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold">Mediba's Organic</h3>
            <p className="mt-3 text-sm text-[#5c4a2a]">
              Natural shea butter and organic skincare crafted to nourish,
              protect, and restore your skin.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:underline">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin/login" className="hover:underline">
                  Admin
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@mediba-organic.com"
                  className="hover:underline"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[#e1d6c3] pt-6 text-center text-sm text-[#6b5a3c]">

          {/* Built by */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <span>Built by</span>

            <a
              href="https://mother-index-site.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-medium hover:opacity-80"
            >
              <span>Foundry Systems</span>

              <Image
                src="/foundry.png"
                alt="Foundry Systems"
                width={18}
                height={18}
              />
            </a>
          </div>

          {/* Copyright */}
          <p>
            © {new Date().getFullYear()} Mediba's Organic. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}