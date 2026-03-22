import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPromotionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: promotions }, { data: products }] = await Promise.all([
    supabase.from("promotions").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").order("name"),
  ]);

  const productMap = new Map((products ?? []).map((p: any) => [p.id, p.name]));

  const typeLabel: Record<string, string> = {
    bogo: "BOGO",
    percent_off: "% Off",
    amount_off: "$ Off",
  };

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
            marginBottom: 36,
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
              Admin · Promotions
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
              Manage Promotions
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
              Create, review, and update store discounts and promotional offers.
            </p>
          </div>

          <Link href="/admin/promotions/new" className="btn-primary">
            + Create Promotion
          </Link>
        </div>

        {/* Table */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {promotions && promotions.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Product", "Type", "Value", "Start", "End", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "14px 20px",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--brown-light)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo: any) => (
                  <tr
                    key={promo.id}
                    style={{ borderBottom: "1px solid var(--cream-dark)", verticalAlign: "middle" }}
                  >
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "var(--brown)",
                      }}
                    >
                      {productMap.get(promo.product_id) ?? "Unknown"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          background: "rgba(196,146,74,0.1)",
                          color: "var(--gold)",
                          borderRadius: 3,
                          padding: "3px 8px",
                        }}
                      >
                        {typeLabel[promo.type] ?? promo.type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--gold)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {promo.type === "percent_off"
                        ? `${promo.value}%`
                        : promo.type === "amount_off"
                        ? `$${Number(promo.value ?? 0).toFixed(2)}`
                        : "BOGO"}
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--brown-light)", fontSize: "0.85rem" }}>
                      {promo.start_date ? new Date(promo.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--brown-light)", fontSize: "0.85rem" }}>
                      {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={`/admin/promotions/${promo.id}`}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          color: "var(--green)",
                          textDecoration: "none",
                        }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "56px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300 }}>
                No promotions yet.{" "}
                <Link href="/admin/promotions/new" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
                  Create your first promotion →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}