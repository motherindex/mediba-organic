import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  title: "Mediba's Organic | Natural Shea Butter & Skincare",
  description:
    "Shop Mediba's Organic for natural shea butter and organic skincare products made to nourish, protect, and restore your skin.",
  keywords: [
    "Mediba's Organic",
    "shea butter",
    "organic skincare",
    "natural skincare",
    "body butter",
    "skin nourishment",
  ],
  openGraph: {
    title: "Mediba's Organic | Natural Shea Butter & Skincare",
    description:
      "Natural shea butter and organic skincare products made for everyday care.",
    siteName: "Mediba's Organic",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8F3E9] text-[#3E2E17] antialiased">
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}