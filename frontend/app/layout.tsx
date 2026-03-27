import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
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
    images: [
      {
        url: "/logo-badge.png",
        width: 1200,
        height: 630,
        alt: "Mediba's Organic Shea Butter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mediba's Organic | Natural Shea Butter & Skincare",
    description:
      "Natural shea butter and organic skincare products made for everyday care.",
    images: ["/logo-badge.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ background: "var(--cream)", color: "var(--brown)" }}
      >
        <CartProvider>
          <Navbar />
          <div style={{ paddingTop: 68 }}>
            {children}
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}