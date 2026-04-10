export type Review = {
  id: string;
  product_id: string;
  reviewer_name: string | null;
  rating: number;
  body: string | null;
  created_at: string;
};
