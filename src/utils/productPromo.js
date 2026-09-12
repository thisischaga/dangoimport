export function getProductPromoPrice(product) {
  const price = Number(product?.price || 0);
  const promo = Number(product?.promoPrice ?? product?.salePrice ?? 0);
  if (promo > 0 && promo < price) return promo;
  return null;
}

export function isProductOnPromo(product) {
  if (Boolean(product?.isPromo || product?.onSale)) return true;
  return getProductPromoPrice(product) !== null;
}

export function getDiscountPercent(product) {
  const price = Number(product?.price || 0);
  const promo = getProductPromoPrice(product);
  if (!price || !promo) return 0;
  return Math.round(((price - promo) / price) * 100);
}

export function isProductNewArrival(product) {
  return Boolean(product?.isNewArrival ?? product?.newArrival ?? product?.isNew);
}

export function isProductBestSeller(product) {
  return Boolean(
    product?.isBestSeller ?? product?.bestSeller ?? product?.bestseller
  ) || Number(product?.totalSales ?? product?.soldCount ?? product?.sales ?? 0) > 0;
}
