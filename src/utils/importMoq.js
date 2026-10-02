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

export function getMoqRules(product = {}) {
  const isImport = product?.sourceType === 'DROPSHIPPING'
    || product?.importFeesAtCheckout
    || product?.fulfillmentType === 'DANGO_IMPORT'
    || String(product?.vendorName || '').toUpperCase().includes('DANGO IMPORT');

  const unit = Number(product.unitPrice ?? product.price ?? 0);
  const weight = parseWeightKg(product);

  // MOQ 20 uniquement pour les produits import légers (< 0.6 kg) ET bon marché (< 2000 F)
  const isLightAndCheap = isImport && weight > 0 && weight < 0.6 && Number.isFinite(unit) && unit > 0 && unit < 2000;
  const defaultMoq = isLightAndCheap ? 20 : 1;

  const explicitMoq = Math.max(defaultMoq, Math.round(Number(product.minimumOrderQuantity) || defaultMoq));
  const moq = explicitMoq;

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
  return getUnitPrice(product);
}
