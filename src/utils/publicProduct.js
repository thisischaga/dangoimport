export const PLATFORM_VENDOR_NAME = 'DANGO IMPORT';
export const CJ_CATALOG_VENDOR_LABEL = 'À importer';

/**
 * Extrait toutes les informations utiles issues de la réponse
 * Alibaba /eco/buyer/product/description pour l'affichage client.
 *
 * Les données sont attendues dans product.supplier et/ou product.alibabaData
 * telles qu'elles sont persistées après import via ALIBABA_API.
 *
 * @param {object} product - Produit normalisé (après sanitizeProductForDisplay)
 * @returns {object} - Objet avec toutes les infos Alibaba enrichies
 */
export function extractAlibabaDisplayInfo(product) {
  if (!product) return {};

  const supplier = product.supplier || {};
  const raw = product.alibabaData || {}; // champ optionnel si on stocke le payload brut

  // --- Ladder pricing (prix par palier de quantité) ---
  const ladderPrices = Array.isArray(raw.ladderPrices || supplier.ladderPrices)
    ? (raw.ladderPrices || supplier.ladderPrices)
    : [];

  // --- SKUs avec attributs couleur/taille ---
  const rawSkus = Array.isArray(raw.skus || supplier.skus) ? (raw.skus || supplier.skus) : [];
  const skus = rawSkus.map((sku) => ({
    skuId: sku.sku_id || sku.skuId || '',
    sellerSkuId: sku.seller_sku_id || sku.sellerSkuId || '',
    image: sku.image || '',
    status: sku.status || 'NORMAL',
    unit: sku.unit || 'Pièce',
    costPrice: Number(sku.cost_origin_price || sku.costOriginPrice || 0),
    totalCostPrice: Number(sku.total_origin_cost_price || sku.totalOriginCostPrice || 0),
    shippingFee: Number(sku.shipping_fee || sku.shippingFee || 0),
    currency: sku.cost_price_currency || sku.currency || 'USD',
    attrs: Array.isArray(sku.sku_attr_list || sku.skuAttrList)
      ? (sku.sku_attr_list || sku.skuAttrList).map((a) => ({
          name: a.attr_name_desc || a.attrNameDesc || '',
          value: a.attr_value_desc || a.attrValueDesc || '',
          image: a.attr_value_image || a.attrValueImage || '',
        }))
      : [],
    ladderPrices: Array.isArray(sku.ladder_price || sku.ladderPrice)
      ? (sku.ladder_price || sku.ladderPrice).map((lp) => ({
          min: Number(lp.min_quantity || lp.minQuantity || 0),
          max: Number(lp.max_quantity || lp.maxQuantity || 0),
          price: Number(lp.price || 0),
          currency: lp.currency || 'USD',
        }))
      : [],
  }));

  // --- Wholesale / vente en gros ---
  const wt = raw.wholesale_trade || raw.wholesaleTrade || supplier.wholesaleTrade || {};
  const wholesale = Object.keys(wt).length > 0 ? {
    volume: wt.volume,
    batchNumber: wt.batch_number || wt.batchNumber,
    packageSize: wt.package_size || wt.packageSize,
    price: Number(wt.price || 0),
    saleType: wt.sale_type || wt.saleType,
    weight: wt.weight,
    unitType: wt.unit_type || wt.unitType || 'Pièce',
    handlingTime: wt.handling_time || wt.handlingTime,
    minOrderQuantity: Number(wt.min_order_quantity || wt.minOrderQuantity || 0),
    shippingLineTemplateId: wt.shipping_line_template_id || wt.shippingLineTemplateId,
    deliverPeriods: Array.isArray(wt.deliver_periods || wt.deliverPeriods)
      ? (wt.deliver_periods || wt.deliverPeriods).map((p) => ({
          quantity: p.quantity,
          processPeriod: p.process_period || p.processPeriod,
        }))
      : [],
  } : null;

  // --- Certifications ---
  const certs = Array.isArray(raw.certifications || supplier.certifications)
    ? (raw.certifications || supplier.certifications)
    : [];

  // --- Pays / origine fabrication ---
  const shipFrom = raw.shipFromCountryName
    || supplier.shipFromCountryName
    || raw.ship_from_country_name
    || '';

  // --- URL produit original Alibaba ---
  const detailUrl = raw.detail_url || raw.detailUrl || supplier.productUrl || '';

  // --- Vidéo ---
  const videoUrl = raw.video_url || raw.videoUrl || (Array.isArray(product.videos) ? product.videos[0] : '') || '';

  // --- Fournisseur ---
  const supplierName = raw.supplier || supplier.name || supplier.manufacturerName || '';
  const eCompanyId = raw.eCompanyId || supplier.eCompanyId || '';

  // --- Catégorie Alibaba ---
  const alibabaCategory = raw.category || '';
  const alibabaCategoryId = raw.category_id || raw.categoryId || '';

  // --- Stock / inventaire ---
  const isCountryRisk = String(raw.is_country_risk || 'false').toLowerCase() === 'true';

  return {
    ladderPrices,
    skus,
    wholesale,
    certs,
    shipFrom,
    detailUrl,
    videoUrl,
    supplierName,
    eCompanyId,
    alibabaCategory,
    alibabaCategoryId,
    isCountryRisk,
    hasSkus: skus.length > 0,
    hasLadderPrices: skus.some((s) => s.ladderPrices.length > 0) || ladderPrices.length > 0,
    hasWholesale: wholesale !== null,
    hasCerts: certs.length > 0,
    hasVideo: Boolean(videoUrl),
    hasDetailUrl: Boolean(detailUrl),
  };
}

const INTERNAL_FIELDS = [
  'costPrice',
  'otherCosts',
  'estimatedProfit',
  'marginPercent',
  'syncError',
  'lastSyncErrorAt',
  'importSourceType',
  'pickupAddress',
  'sellerAddress',
  'history',
  'rejectionReason',
  'changeRequestComment',
  'reviews',
  'supplier',
  'vendorId',
];

export function isDropshippingProduct(product) {
  return product?.sourceType === 'DROPSHIPPING';
}

export function isCjCatalogProduct(product) {
  if (String(product?.vendorName || '').trim() === CJ_CATALOG_VENDOR_LABEL) return true;
  const platform = String(product?.supplier?.platform || '').toLowerCase();
  if (platform === 'cj') return true;
  if (product?.importSourceType === 'CJ_API') return true;
  if (/^cj:/i.test(String(product?.externalSourceKey || ''))) return true;
  return false;
}

export function isAlibabaProduct(product) {
  if (!product) return false;
  const platform = String(product?.supplier?.platform || '').toLowerCase();
  if (platform === 'alibaba') return true;
  if (product?.importSourceType === 'ALIBABA_API') return true;
  if (/^alibaba:/i.test(String(product?.externalSourceKey || ''))) return true;
  return false;
}

function isInvalidTranslationText(text) {
  const s = String(text || '').trim();
  if (!s) return true;
  const upper = s.toUpperCase();
  return upper.includes('MYMEMORY')
    || upper.includes('TRANSLATED.NET')
    || upper.includes('YOU USED ALL AVAILABLE')
    || upper.includes('FREE TRANSLATION')
    || upper.includes('QUERY LENGTH')
    || upper.includes('USAGE LIMITS')
    || upper.includes('TO TRANSLATE MORE');
}

function isGenericProductPlaceholder(text) {
  const s = String(text || '').trim().toLowerCase();
  return !s
    || s === 'produit'
    || s === 'produit cj'
    || s === 'product'
    || s === 'article'
    || s === 'article dango import';
}

function titleFromSlug(slug) {
  const raw = String(slug || '').trim();
  if (!raw) return '';
  const withoutPid = raw.replace(/-[a-f0-9]{6,}$/i, '').replace(/-/g, ' ').trim();
  if (withoutPid.length < 4) return '';
  return withoutPid.replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveDisplayProductName(product) {
  const variantNames = (Array.isArray(product?.variants) ? product.variants : [])
    .map((v) => String(v?.name || v?.attributes?.variantKey || v?.sku || '').trim())
    .filter((n) => n && !isInvalidTranslationText(n) && !isGenericProductPlaceholder(n));
  const storedName = String(product?.name || '').trim();
  const storedIsBad = isInvalidTranslationText(storedName) || isGenericProductPlaceholder(storedName);
  const candidates = [
    storedIsBad ? '' : storedName,
    product?.supplier?.productNameEn,
    product?.supplier?.nameEn,
    ...variantNames,
    product?.shortDescription,
    titleFromSlug(product?.slug),
  ]
    .map((c) => String(c || '').trim())
    .filter(Boolean)
    .filter((c) => !isInvalidTranslationText(c))
    .filter((c) => !isGenericProductPlaceholder(c));
  return candidates[0] || variantNames[0] || 'Article Dango Import';
}

function sanitizeVariantsForDisplay(variants = []) {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant, index) => {
    const raw = String(variant?.name || '').trim();
    const fallbacks = [
      variant?.attributes?.variantKey,
      variant?.sku,
      `Option ${index + 1}`,
    ];
    const name = (!isInvalidTranslationText(raw) && !isGenericProductPlaceholder(raw))
      ? raw
      : (fallbacks.map((c) => String(c || '').trim()).find((c) => c && !isInvalidTranslationText(c)) || `Option ${index + 1}`);
    return { ...variant, name };
  });
}

/** Stock affichable (aligné fiche produit : max stock produit, variantes, entrepôts CJ). */
export function getProductSellableStock(product) {
  if (!product) return 0;
  let stock = Number(product.stock ?? 0);
  if (!Number.isFinite(stock) || stock < 0) stock = 0;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length) {
    const variantStock = variants.reduce(
      (sum, v) => sum + Math.max(0, Number(v?.stock ?? 0) || 0),
      0,
    );
    stock = Math.max(stock, variantStock);
  }

  const inventories = product.supplier?.warehouseInventories;
  if (Array.isArray(inventories) && inventories.length) {
    const warehouseStock = inventories.reduce(
      (sum, row) => sum + Math.max(0, Number(row?.quantity ?? row?.totalInventoryNum ?? 0) || 0),
      0,
    );
    stock = Math.max(stock, warehouseStock);
  }

  return Math.max(0, Math.round(stock));
}

export function normalizeCatalogProductStock(product) {
  if (!product || typeof product !== 'object') return product;
  const stock = getProductSellableStock(product);
  let variants = product.variants;
  if (stock > 0 && Array.isArray(variants) && variants.length) {
    const allVariantsZero = variants.every((v) => Number(v?.stock ?? 0) <= 0);
    if (allVariantsZero) {
      variants = variants.map((v) => ({ ...v, stock }));
    }
  }
  return { ...product, stock, variants: variants ?? product.variants };
}

export function getDisplayProductName(product) {
  return resolveDisplayProductName(product);
}

export function sanitizeProductForDisplay(product) {
  if (!product) return null;

  const sanitized = { ...product };
  INTERNAL_FIELDS.forEach((field) => {
    delete sanitized[field];
  });

  sanitized.stock = getProductSellableStock(product);
  sanitized.name = resolveDisplayProductName(product);
  if (isInvalidTranslationText(sanitized.description)) {
    sanitized.description = sanitized.name;
  }
  if (isInvalidTranslationText(sanitized.shortDescription)) {
    sanitized.shortDescription = String(sanitized.description || sanitized.name).slice(0, 220);
  }
  if (Array.isArray(product.variants)) {
    sanitized.variants = sanitizeVariantsForDisplay(product.variants);
  }

  if (isDropshippingProduct(product)) {
    sanitized.vendorName = PLATFORM_VENDOR_NAME;
    sanitized.isVendorCertified = true;
    sanitized.originLabel = 'Chine';
    sanitized.fulfillmentType = product.fulfillmentType || 'DANGO_IMPORT';
    if (product.estimatedDeliveryDays != null) {
      sanitized.estimatedDeliveryDays = product.estimatedDeliveryDays;
    } else if (product.supplier?.estimatedDeliveryDays != null) {
      sanitized.estimatedDeliveryDays = product.supplier.estimatedDeliveryDays;
    }
    if (product.shippingInfo) sanitized.shippingInfo = product.shippingInfo;
    if (product.subCategory) sanitized.subCategory = product.subCategory;
    if (product.shippingOrigin) sanitized.shippingOrigin = product.shippingOrigin;
    if (product.fulfillmentSupplierName) sanitized.fulfillmentSupplierName = product.fulfillmentSupplierName;
    if (product.fulfillmentPlatform) sanitized.fulfillmentPlatform = product.fulfillmentPlatform;
    if (Array.isArray(product.specifications)) sanitized.specifications = product.specifications;
    delete sanitized.country;
    delete sanitized.origin;
  } else if (!sanitized.originLabel) {
    sanitized.originLabel = resolveLocalOriginLabel(product);
  }

  return sanitized;
}

export function sanitizeProductsForDisplay(products = []) {
  return (products || []).map(sanitizeProductForDisplay).filter(Boolean);
}

export function getDisplayVendorName(product) {
  if (isDropshippingProduct(product) || isCjCatalogProduct(product)) return PLATFORM_VENDOR_NAME;
  return product?.vendorName || product?.sellerName || 'Vendeur indépendant';
}

export function resolveLocalOriginLabel(product = {}) {
  const zones = Array.isArray(product.deliveryZones) ? product.deliveryZones : [];
  const parts = [
    product.originLabel,
    product.country,
    product.origin,
    product.vendorCountry,
    product.sellerCountry,
    product.shippingOrigin?.countryName,
    product.shippingOrigin?.countryCode,
    ...zones.map((zone) => zone?.country),
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/\btogo\b|\btg\b/.test(parts)) return 'Togo';
  if (/\bbenin\b|\bbj\b/.test(parts)) return 'Bénin';
  return '';
}

export function getProductOriginLabel(product) {
  if (isDropshippingProduct(product) || isCjCatalogProduct(product)) return 'Chine';
  return product?.originLabel || resolveLocalOriginLabel(product);
}

export function isMarketplaceProduct(product) {
  if (!product) return false;
  if (isCjCatalogProduct(product) || isDropshippingProduct(product)) return false;
  const source = String(product.sourceType || 'LOCAL_SELLER');
  return source === 'LOCAL_SELLER';
}

export function sanitizeProductForCart(product) {
  if (!product) return null;

  const base = sanitizeProductForDisplay(product);
  return {
    _id: base._id || base.id,
    id: base._id || base.id,
    name: base.name,
    price: base.price,
    salePrice: base.salePrice,
    promoPrice: base.promoPrice,
    image: base.image,
    images: base.images,
    stock: base.stock,
    category: base.category,
    vendorName: getDisplayVendorName(product),
    sourceType: product.sourceType || 'LOCAL_SELLER',
    estimatedDeliveryDays: base.estimatedDeliveryDays,
    selectedOptions: product.selectedOptions,
    selectedVariant: product.selectedVariant,
    selectedColor: product.selectedColor,
    selectedSize: product.selectedSize,
  };
}
