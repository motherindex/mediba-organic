export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  created_at?: string;
  finalPrice?: number;
  hasDiscount?: boolean;
  promotionType?: "bogo" | "percent_off" | "amount_off" | null;
  promotionValue?: number | null;
};