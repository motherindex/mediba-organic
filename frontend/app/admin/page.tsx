import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [
    { count: productCount },
    { count: promotionCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("promotions").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Products",    value: productCount  ?? 0, href: "/admin/products" },
    { label: "Active Promotions", value: promotionCount ?? 0, href: "/admin/promotions" },
    { label: "Recent Orders",     value: recentOrders?.length ?? 0, href: null },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "64px 24px 96px",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1152, margin: "0 auto" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 6,
              }}
            >
              Admin
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
                fontWeight: 600,
                color: "var(--brown)",
                lineHeight: 1.1,
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
              Store overview for Mediba&apos;s Organic.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/admin/products" className="btn-primary">
              Manage Products
            </Link>
            <Link href="/admin/promotions" className="btn-outline">
              Manage Promotions
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 36,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-hover"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "24px 24px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--brown-light)",
                  marginBottom: 10,
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2.8rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              {s.href && (
                <Link
                  href={s.href}
                  style={{
                    display: "inline-block",
                    marginTop: 12,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: "var(--green)",
                    textDecoration: "none",
                  }}
                >
                  View all →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "28px 28px 8px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "var(--brown)",
              marginBottom: 20,
            }}
          >
            Recent Orders
          </h2>

          {recentOrders && recentOrders.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Order ID", "Customer Email", "Status", "Price"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "0 16px 12px 0",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--brown-light)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                      <td style={{ padding: "14px 16px 14px 0", color: "var(--brown-mid)", whiteSpace: "nowrap" }}>
                        {order.id.slice(0, 8)}…
                      </td>
                      <td style={{ padding: "14px 16px 14px 0", color: "var(--brown)" }}>
                        {order.customer_email || "—"}
                      </td>
                      <td style={{ padding: "14px 16px 14px 0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "rgba(74,103,65,0.1)",
                            color: "var(--green)",
                            borderRadius: 3,
                            padding: "3px 8px",
                          }}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 0", color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700 }}>
                        ${Number(order.price ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
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