export type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string | null;
  quantity: number;
  promotionType?: "bogo" | "percent_off" | "amount_off" | null;
  promotionValue?: number | null;
};