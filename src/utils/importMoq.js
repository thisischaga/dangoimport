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

export function extractRealProductMoq(product = {}) {
  if (!product || typeof product !== 'object') return 1;

  // 1. Direct explicit MOQ
  const candidates = [
    product.minimumOrderQuantity,
    product.moq,
    product.minOrderQuantity,
    product.minQuantity,
    product.wholesale?.minOrderQuantity,
    product.wholesaleTrade?.minOrderQuantity,
    product.supplier?.wholesaleTrade?.minOrderQuantity,
  ];

  // 2. Extraire depuis publicPriceTiers (paliers de prix calculés)
  if (Array.isArray(product.publicPriceTiers) && product.publicPriceTiers.length > 0) {
    const firstTier = product.publicPriceTiers[0];
    const tierMin = firstTier?.minQuantity || firstTier?.minQty || firstTier?.min;
    if (tierMin) candidates.push(tierMin);
  }

  // 3. Extraire depuis sourcePriceTiers (USD ou direct)
  if (Array.isArray(product.sourcePriceTiers) && product.sourcePriceTiers.length > 0) {
    const firstTier = product.sourcePriceTiers[0];
    const tierMin = firstTier?.minQty || firstTier?.min_quantity || firstTier?.minQuantity || firstTier?.min;
    if (tierMin) candidates.push(tierMin);
  }

  // 4. Extraire depuis pricing.tiers ou pricing.sourcePriceTiers
  if (Array.isArray(product.pricing?.tiers) && product.pricing.tiers.length > 0) {
    const firstTier = product.pricing.tiers[0];
    const tierMin = firstTier?.minQuantity || firstTier?.minQty || firstTier?.min;
    if (tierMin) candidates.push(tierMin);
  }

  // 5. Extraire depuis alibabaSKUs / ladder_price
  const ladder = product.alibabaSKUs?.[0]?.ladder_price
    || product.supplier?.ladderPrices
    || product.variants?.[0]?.ladderPrices
    || product.rawPayload?.result_data?.skus?.[0]?.ladder_price
    || product.rawAlibabaData?.result_data?.skus?.[0]?.ladder_price;
  if (Array.isArray(ladder) && ladder.length > 0) {
    const firstLadder = ladder[0];
    const ladderMin = firstLadder?.min_quantity || firstLadder?.minQuantity || firstLadder?.minQty || firstLadder?.min;
    if (ladderMin) candidates.push(ladderMin);
  }

  // Trouver la première valeur numérique valide > 1
  for (const c of candidates) {
    const n = Math.round(Number(c));
    if (Number.isFinite(n) && n > 1) {
      return n;
    }
  }

  // Si explicitement défini comme 1
  const directExplicit = Number(product.minimumOrderQuantity || product.moq);
  if (Number.isFinite(directExplicit) && directExplicit >= 1) {
    return Math.round(directExplicit);
  }

  return 1;
}

export function getMoqRules(product = {}) {
  const isImport = product?.sourceType === 'DROPSHIPPING'
    || product?.importFeesAtCheckout
    || product?.fulfillmentType === 'DANGO_IMPORT'
    || product?.source === 'ALIBABA'
    || product?.isAlibaba
    || String(product?.vendorName || '').toUpperCase().includes('DANGO IMPORT');

  const realFactoryMoq = extractRealProductMoq(product);

  const unit = Number(product.unitPrice ?? product.price ?? 0);
  const weight = parseWeightKg(product);

  let dynamicMoq = 1;
  if (isImport) {
    const TARGET_VALUE = 3000; // Objectif ~3000 F par commande de lot
    const TARGET_WEIGHT = 0.2; // Objectif ~0.2 kg (200g) par commande de lot
    const MAX_MOQ_CAP = 8;     // Plafond maximum pour avantager le client (jamais plus de 8)

    const moqFromVal = (Number.isFinite(unit) && unit > 0 && unit < TARGET_VALUE) ? Math.ceil(TARGET_VALUE / unit) : 1;
    const moqFromWgt = (weight > 0 && weight < TARGET_WEIGHT) ? Math.ceil(TARGET_WEIGHT / weight) : 1;

    const rawMoq = Math.max(moqFromVal, moqFromWgt);
    dynamicMoq = Math.min(MAX_MOQ_CAP, Math.max(1, rawMoq));
  }

  const explicitMoq = Math.max(realFactoryMoq, dynamicMoq);
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

export function getPublicPriceRange(product = {}) {
  const prices = (Array.isArray(product.publicPriceTiers) ? product.publicPriceTiers : [])
    .map((tier) => Number(tier?.unitPrice ?? tier?.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min < max ? { min, max } : null;
}
