import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { DeleteReviewButton } from "@/components/delete-review-button";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        padding: "48px 20px 80px",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            Admin · Reviews
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.7rem, 3.5vw, 2.8rem)",
              fontWeight: 600,
              color: "var(--brown)",
              lineHeight: 1.1,
            }}
          >
            Customer Reviews
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300, marginTop: 6 }}>
            {reviews?.length ?? 0} total review{reviews?.length !== 1 ? "s" : ""}. Delete any that violate guidelines.
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center", background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <p style={{ fontSize: "0.9rem", color: "var(--brown-light)", fontWeight: 300 }}>
              No reviews yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map((review: any) => (
              <div
                key={review.id}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "20px 24px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: 14, color: s <= review.rating ? "var(--gold)" : "var(--border)" }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brown)", fontFamily: "'Jost', sans-serif" }}>
                      {review.reviewer_name || "Anonymous"}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--brown-light)", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                      {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    {review.products?.name && (
                      <span style={{ fontSize: "0.72rem", color: "var(--gold)", fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "0.06em" }}>
                        {review.products.name}
                      </span>
                    )}
                  </div>
                  {review.body && (
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--brown-light)", lineHeight: 1.7, fontWeight: 300 }}>
                      {review.body}
                    </p>
                  )}
                </div>
                <DeleteReviewButton reviewId={review.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
