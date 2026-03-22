import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

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
              Admin · Products
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
              Manage Products
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
              Add, edit, and remove store products.
            </p>
          </div>

          <Link href="/admin/products/new" className="btn-primary">
            + Add Product
          </Link>
        </div>

        {/* Table card */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {products && products.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Image", "Product", "Price", "Actions"].map((h) => (
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
                {products.map((product: any) => (
                  <tr
                    key={product.id}
                    style={{ borderBottom: "1px solid var(--cream-dark)", verticalAlign: "middle" }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/200x200.png?text=Product"}
                        alt={product.name}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "var(--brown)",
                      }}
                    >
                      {product.name}
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
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Link
                          href={`/admin/products/${product.id}`}
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
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "56px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300 }}>
                No products yet.{" "}
                <Link href="/admin/products/new" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
                  Add your first product →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}