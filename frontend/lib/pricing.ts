export type Promotion = {
  id: string;
  product_id: string;
  type: "bogo" | "percent_off" | "amount_off";
  value: number | null;
  start_date: string | null;
  end_date: string | null;
};

export type PricingResult = {
  basePrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  promotion: Promotion | null;
};

function isPromotionActive(promotion: Promotion) {
  const now = new Date();

  const startsOk =
    !promotion.start_date || new Date(promotion.start_date).getTime() <= now.getTime();

  const endsOk =
    !promotion.end_date || new Date(promotion.end_date).getTime() >= now.getTime();

  return startsOk && endsOk;
}

export function getActivePromotion(
  productId: string,
  promotions: Promotion[] = []
): Promotion | null {
  const eligible = promotions.filter(
    (promotion) =>
      promotion.product_id === productId && isPromotionActive(promotion)
  );

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    const aStart = a.start_date ? new Date(a.start_date).getTime() : 0;
    const bStart = b.start_date ? new Date(b.start_date).getTime() : 0;
    return bStart - aStart;
  });

  return eligible[0];
}

export function getProductPricing(args: {
  productId: string;
  basePrice: number;
  promotions?: Promotion[];
}): PricingResult {
  const { productId, basePrice, promotions = [] } = args;

  const promotion = getActivePromotion(productId, promotions);

  if (!promotion) {
    return {
      basePrice,
      finalPrice: basePrice,
      hasDiscount: false,
      promotion: null,
    };
  }

  if (promotion.type === "percent_off") {
    const percent = Number(promotion.value ?? 0);
    const finalPrice = Math.max(0, basePrice - basePrice * (percent / 100));

    return {
      basePrice,
      finalPrice: Number(finalPrice.toFixed(2)),
      hasDiscount: finalPrice < basePrice,
      promotion,
    };
  }

  if (promotion.type === "amount_off") {
    const amount = Number(promotion.value ?? 0);
    const finalPrice = Math.max(0, basePrice - amount);

    return {
      basePrice,
      finalPrice: Number(finalPrice.toFixed(2)),
      hasDiscount: finalPrice < basePrice,
      promotion,
    };
  }

  return {
    basePrice,
    finalPrice: basePrice,
    hasDiscount: false,
    promotion,
  };
}

export function getCartLineTotal(args: {
  unitPrice: number;
  quantity: number;
  promotionType?: string | null;
}) {
  const { unitPrice, quantity, promotionType } = args;

  if (promotionType === "bogo") {
    const chargedQuantity = Math.ceil(quantity / 2);
    return Number((chargedQuantity * unitPrice).toFixed(2));
  }

  return Number((unitPrice * quantity).toFixed(2));
}