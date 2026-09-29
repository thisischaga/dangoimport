export function getMoqRules(product = {}) {
  const moq = Math.max(1, Math.round(Number(product.minimumOrderQuantity) || 1));
  const hasIncrement = product.quantityIncrement != null && product.quantityIncrement !== '';
  const increment = Math.max(1, Math.round(Number(
    hasIncrement ? product.quantityIncrement : moq,
  ) || moq));
  return {
    moq,
    increment,
    soldAsLot: moq > 1 && increment === moq,
    packSize: moq > 1 && increment === moq ? moq : 1,
  };
}

export function snapQuantity(product, quantity) {
  const { moq, increment } = getMoqRules(product);
  let qty = Math.round(Number(quantity) || moq);
  if (qty < moq) qty = moq;
  const extra = qty - moq;
  const remainder = extra % increment;
  if (remainder !== 0) {
    qty = qty - remainder + increment;
  }
  const stock = Number(product?.stock);
  if (Number.isFinite(stock) && stock > 0) {
    qty = Math.min(qty, stock);
    if (qty < moq) return moq;
    const extraClamped = qty - moq;
    const rem = extraClamped % increment;
    if (rem !== 0) qty -= rem;
    if (qty < moq) return moq;
  }
  return Math.max(moq, qty);
}

export function getUnitPrice(item = {}) {
  const unit = Number(item.unitPrice ?? item.price ?? 0);
  return Number.isFinite(unit) ? unit : 0;
}

export function getCardDisplayPrice(product = {}) {
  const { soldAsLot, packSize } = getMoqRules(product);
  const unit = getUnitPrice(product);
  const packPrice = Number(product.packPrice || 0);
  if (soldAsLot && packSize > 1) {
    return packPrice > 0 ? packPrice : unit * packSize;
  }
  return unit;
}
