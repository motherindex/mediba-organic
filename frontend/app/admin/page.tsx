// app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [
    { count: productCount },
    { count: promotionCount },
    { count: orderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("promotions").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Products",    value: productCount   ?? 0, href: "/admin/products" },
    { label: "Active Promotions", value: promotionCount ?? 0, href: "/admin/promotions" },
    { label: "Total Orders",      value: orderCount     ?? 0, href: "/admin/orders" },
  ];

  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    pending:    { bg: "rgba(196,146,74,0.12)",  color: "#C4924A" },
    processing: { bg: "rgba(74,103,65,0.12)",   color: "#4A6741" },
    shipped:    { bg: "rgba(59,90,160,0.12)",   color: "#3B5AA0" },
    delivered:  { bg: "rgba(74,103,65,0.18)",   color: "#2E6B25" },
    cancelled:  { bg: "rgba(180,50,50,0.1)",    color: "#B43232" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", padding: "64px 24px 96px", fontFamily: "'Jost', sans-serif" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
              Admin
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", fontWeight: 600, color: "var(--brown)", lineHeight: 1.1 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
              Store overview for Mediba&apos;s Organic.
            </p>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/admin/products" className="btn-primary">Manage Products</Link>
            <Link href="/admin/promotions" className="btn-outline">Manage Promotions</Link>
            <Link href="/admin/orders" className="btn-outline">View Orders</Link>
            <Link
              href="/admin/settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "var(--brown-light)",
                textDecoration: "none",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "8px 16px",
                background: "var(--white)",
                transition: "border-color 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
          {stats.map((s) => (
            <div key={s.label} className="card-hover" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 24px 20px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)", marginBottom: 10 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                {s.value}
              </p>
              <Link href={s.href} style={{ display: "inline-block", marginTop: 12, fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", color: "var(--green)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
          ))}
        </div>

        {/* Quick links row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Add New Product", href: "/admin/products/new", icon: "+" },
            { label: "View All Orders", href: "/admin/orders", icon: "📦" },
            { label: "Manage Promotions", href: "/admin/promotions", icon: "🏷️" },
            { label: "API & Integrations", href: "/admin/settings", icon: "🔑" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "16px 20px",
                textDecoration: "none",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--brown)",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 28px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: "var(--brown)" }}>
              Recent Orders
            </h2>
            <Link href="/admin/orders" style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--green)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Order ID", "Customer", "Status", "Total", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0 16px 12px 0", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => {
                    const status = order.status ?? "pending";
                    const colors = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                        <td style={{ padding: "14px 16px 14px 0", color: "var(--brown-mid)", whiteSpace: "nowrap", fontWeight: 600 }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: "14px 16px 14px 0", color: "var(--brown)", maxWidth: 180 }}>
                          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.customer_email || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px 14px 0" }}>
                          <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: colors.bg, color: colors.color, borderRadius: 3, padding: "3px 8px" }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px 14px 0", color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700 }}>
                          ${Number(order.price ?? 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "14px 0" }}>
                          <Link href={`/admin/orders/${order.id}`} style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--green)", textDecoration: "none" }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, paddingBottom: 20 }}>
              No recent orders yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}