export function parseWeightKg(product = {}) {
  const raw = product.weightKg ?? product.weight;
  if (raw == null || raw === '') return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw <= 0) return 0;
    return raw > 30 ? Math.round((raw / 1000) * 1000) / 1000 : Math.round(raw * 1000) / 1000;
  }
  const text = String(raw).trim().toLowerCase().replace(',', '.');
  const match = text.match(/([\d.]+)\s*(kg|kgs|kilo|kilogrammes?|g|gr|grammes?|lbs?)?/);
  if (!match) return 0;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const unit = String(match[2] || '');
  if (unit === 'g' || unit === 'gr' || unit.startsWith('gram')) return Math.round((n / 1000) * 1000) / 1000;
  if (unit.startsWith('kg') || unit.startsWith('kilo')) return Math.round(n * 1000) / 1000;
  return n > 30 ? Math.round((n / 1000) * 1000) / 1000 : Math.round(n * 1000) / 1000;
}

export function lightProductMoqFromWeight(weightKg, thresholdKg = 1) {
  const weight = Number(weightKg);
  const threshold = Number(thresholdKg) || 1;
  if (!(weight > 0) || weight >= threshold) return 1;
  return Math.max(2, Math.ceil((threshold / weight) - 1e-9));
}

export function getMoqRules(product = {}) {
  const explicitMoq = Math.max(1, Math.round(Number(product.minimumOrderQuantity) || 1));
  const unit = Number(product.unitPrice ?? product.price ?? 0);
  const weight = parseWeightKg(product);
  const underWeight = weight > 0 && weight < 1;
  const underPrice = Number.isFinite(unit) && unit > 0 && unit < 2000;
  const autoMoq = (underWeight && underPrice)
    ? lightProductMoqFromWeight(weight, 1)
    : 1;
  const moq = Math.max(explicitMoq, autoMoq);
  const hasIncrement = product.quantityIncrement != null && product.quantityIncrement !== '';
  const explicitIncrement = hasIncrement
    ? Math.max(1, Math.round(Number(product.quantityIncrement) || moq))
    : null;
  const increment = explicitIncrement && explicitIncrement !== explicitMoq
    ? explicitIncrement
    : moq;
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
  const n = Number.isFinite(unit) ? unit : 0;
  const isImport = item?.sourceType === 'DROPSHIPPING'
    || item?.importFeesAtCheckout
    || item?.fulfillmentType === 'DANGO_IMPORT'
    || String(item?.vendorName || '').toUpperCase().includes('DANGO IMPORT');
  if (!isImport) return n;
  return n;
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
