import { getProductImages, resolveImageUrl } from './imageUrl';
import { getMoqRules, getUnitPrice, getCardDisplayPrice } from './importMoq';
import { isAlibabaProduct, isDropshippingProduct, getDisplayVendorName } from './publicProduct';
import { formatCFA, calcDiscountPercent } from './formatPrice';

/**
 * Nettoie le code HTML d'une description Alibaba en supprimant les styles,
 * scripts, classes décoratives et balises dangereuses.
 */
export function sanitizeAlibabaHtml(rawHtml = '') {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  let cleaned = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/#detail_decorate_root[\s\S]*?\{[\s\S]*?\}/gi, '')
    .replace(/@media[\s\S]*?\{[\s\S]*?\}/gi, '')
    .replace(/\{[^{}]*\}/g, '')
    .replace(/#detail_decorate_root[^\s;{}]*/gi, '')
    .replace(/\.magic-\d+[^\s;{}]*/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');

  // Supprimer les conteneurs décoratifs vides ou styles inline Alibaba cassés
  cleaned = cleaned
    .replace(/<div[^>]*class="[^"]*magic-[^"]*"[^>]*>/gi, '<div>')
    .replace(/style="[^"]*"/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return cleaned;
}

/**
 * Extrait le texte lisible pur d'une description.
 */
export function extractCleanProse(raw = '', fallbackTitle = '') {
  if (!raw || typeof raw !== 'string') {
    return fallbackTitle ? `${fallbackTitle}.` : '';
  }
  let text = raw
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/#detail_decorate_root[\s\S]*?\{[\s\S]*?\}/gi, ' ')
    .replace(/@media[\s\S]*?\{[\s\S]*?\}/gi, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/#detail_decorate_root[^\s;{}]*/gi, ' ')
    .replace(/\.magic-\d+[^\s;{}]*/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    text.includes('#detail_decorate_root') ||
    /\{[a-z-]+:[^}]+\}/i.test(text) ||
    /border-(?:bottom|top)|padding-(?:top|bottom)|min-height/i.test(text) ||
    text.length < 15
  ) {
    return fallbackTitle ? `${fallbackTitle}.` : '';
  }
  return text;
}

/**
 * Prépare et centralise toutes les données prêtes à afficher dans la fiche produit.
 */
export function buildProductDetailData(product = {}) {
  if (!product || typeof product !== 'object') return null;

  const isAlibaba = isAlibabaProduct(product);
  const isDropship = isDropshippingProduct(product);
  const moqRules = getMoqRules(product);

  // 1. Tarification publique
  const unitPrice = getUnitPrice(product);
  const basePrice = Number(product.price || unitPrice || 0);
  const basePromo = Number(product.salePrice || product.promoPrice || 0);
  const promoPrice = !isDropship && basePromo > 0 && basePromo < basePrice ? basePromo : 0;
  const hasPromo = promoPrice > 0 && promoPrice < basePrice;
  const displayPrice = isDropship ? getCardDisplayPrice(product) : (hasPromo ? promoPrice : basePrice);
  const discountPercent = hasPromo ? calcDiscountPercent(basePrice, promoPrice) : 0;

  // 2. Stock et disponibilité
  const productStock = Number(product.stock ?? 0);
  const rawStockIsSuspect = productStock >= 2147483647;
  const isStockVerified = !rawStockIsSuspect && productStock > 0;
  const inStock = isAlibaba || (!rawStockIsSuspect && productStock > 0);
  const minStock = Number(product.minStock || 10);
  const isLowStock = !isAlibaba && inStock && productStock <= minStock;
  const parsePositiveWeight = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const text = String(value).trim();
    if (!text || /^0+(?:[.,]0+)?\s*(kg|g)?$/i.test(text)) return null;
    const numeric = Number(text.replace(/\s*(kg|g)\b/i, '').replace(',', '.'));
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
  };

  let stockStatusLabel = '';
  let stockStatusCode = 'IN_STOCK';
  if (!inStock) {
    stockStatusLabel = 'Rupture de stock';
    stockStatusCode = 'OUT_OF_STOCK';
  } else if (isAlibaba) {
    stockStatusLabel = 'Sur commande · Fabrication directe usine';
    stockStatusCode = 'MADE_TO_ORDER';
  } else if (isLowStock) {
    stockStatusLabel = `Stock limité · ${productStock} restants`;
    stockStatusCode = 'LOW_STOCK';
  } else {
    stockStatusLabel = productStock > 0 ? `${productStock} en stock` : 'En stock';
    stockStatusCode = 'IN_STOCK';
  }

  // 3. Galerie complète sans limite arbitraire
  const rawImages = getProductImages(product, Infinity);
  const variantImages = (Array.isArray(product.variants) ? product.variants : [])
    .map((v) => resolveImageUrl(v?.image))
    .filter(Boolean);

  const mergedImages = [...new Set([...rawImages, ...variantImages])].filter(Boolean);
  const primaryImage = product.image ? resolveImageUrl(product.image) : mergedImages[0] || null;
  const allImages = primaryImage
    ? [primaryImage, ...mergedImages.filter((url) => url !== primaryImage)]
    : mergedImages;

  const videoUrl = product.videoUrl
    || product.videos?.[0]
    || product.supplier?.videoUrl
    || product.rawAlibabaData?.video_url
    || '';

  // 4. Paliers de prix en gros (PUBLIC en XOF)
  const rawTiers = Array.isArray(product.publicPriceTiers) && product.publicPriceTiers.length > 0
    ? product.publicPriceTiers
    : [];

  let publicPriceTiers = [];
  if (rawTiers.length > 0) {
    publicPriceTiers = rawTiers.map((t) => {
      const min = Math.max(1, Number(t.minQuantity || t.minQty || t.min || 1));
      const max = t.maxQuantity || t.maxQty || t.max ? Number(t.maxQuantity || t.maxQty || t.max) : null;
      const tierUnitPrice = Number(t.unitPrice || t.price || 0);
      const savings = basePrice > 0 && tierUnitPrice < basePrice
        ? Math.round(((basePrice - tierUnitPrice) / basePrice) * 100)
        : 0;
      return {
        min,
        max,
        label: max ? `${min.toLocaleString('fr-FR')} à ${max.toLocaleString('fr-FR')} unités` : `≥ ${min.toLocaleString('fr-FR')} unités`,
        unitPrice: tierUnitPrice,
        unitPriceFormatted: formatCFA(tierUnitPrice),
        savingsPercent: savings,
      };
    });
  } else {
    // Essayer d'extraire depuis sourcePriceTiers ou ladder_price (ex: Alibaba)
    const sourceTiers = (Array.isArray(product.sourcePriceTiers) && product.sourcePriceTiers.length > 0)
      ? product.sourcePriceTiers
      : (Array.isArray(product.normalized?.sourcePriceTiers) && product.normalized.sourcePriceTiers.length > 0)
        ? product.normalized.sourcePriceTiers
        : null;

    const ladderTiers = sourceTiers || (() => {
      const rawLadder = product.rawPayload?.result_data?.skus?.[0]?.ladder_price
        || product.rawAlibabaData?.result_data?.skus?.[0]?.ladder_price
        || product.normalized?.rawAlibabaData?.result_data?.skus?.[0]?.ladder_price
        || product.pricing?.raw?.skus?.[0]?.ladder_price;
      if (!Array.isArray(rawLadder) || !rawLadder.length) return [];
      return rawLadder.map((l) => ({
        minQty: Number(l.min_quantity || l.minQty || 1),
        maxQty: Number(l.max_quantity || l.maxQty) > 0 ? Number(l.max_quantity || l.maxQty) : null,
        price: Number(l.price || 0),
        currency: l.currency || 'USD',
      }));
    })();

    if (ladderTiers.length > 0) {
      const positiveUsd = ladderTiers.map((t) => Number(t.price || 0)).filter((p) => p > 0);
      const minTierUsd = positiveUsd.length ? Math.min(...positiveUsd) : 0;
      const rate = minTierUsd > 0 && basePrice > 0 ? basePrice / minTierUsd : 850;
      const converted = ladderTiers.map((t) => {
        const min = Math.max(1, Number(t.minQty || t.min_quantity || 1));
        const maxVal = Number(t.maxQty || t.max_quantity);
        const max = maxVal > 0 ? maxVal : null;
        const tierUnitPrice = Math.round(Number(t.price || 0) * rate);
        return { min, max, unitPrice: tierUnitPrice };
      });
      const highestPrice = Math.max(...converted.map((t) => t.unitPrice));
      publicPriceTiers = converted.map((t) => {
        const savings = highestPrice > 0 && t.unitPrice < highestPrice
          ? Math.round(((highestPrice - t.unitPrice) / highestPrice) * 100)
          : 0;
        return {
          min: t.min,
          max: t.max,
          label: t.max ? `${t.min.toLocaleString('fr-FR')} à ${t.max.toLocaleString('fr-FR')} unités` : `≥ ${t.min.toLocaleString('fr-FR')} unités`,
          unitPrice: t.unitPrice,
          unitPriceFormatted: formatCFA(t.unitPrice),
          savingsPercent: savings,
        };
      });
    }
  }

  // 5. Spécifications fusionnées complètes
  const specMap = new Map();
  const pushSpec = (key, val) => {
    if (!key || val == null) return;
    const k = String(key).trim();
    const v = String(val).trim();
    if (!k || !v || /^(undefined|null|n\/a|none)$/i.test(v)) return;
    if (v.startsWith('{') || v.startsWith('[')) return;
    if (['neuf', 'new', 'standard', 'general', 'général'].includes(v.toLowerCase())) return;
    if (!specMap.has(k.toLowerCase())) {
      specMap.set(k.toLowerCase(), { key: k, value: v });
    }
  };

  (Array.isArray(product.specifications) ? product.specifications : []).forEach((s) => {
    if (s && s.key && s.value) pushSpec(s.key, s.value);
  });

  if (product.brand && !/generic|cj\s*drop/i.test(product.brand)) {
    pushSpec('Marque', product.brand);
  }
  if (product.modelNumber) pushSpec('Modèle', product.modelNumber);
  if (product.material) pushSpec('Matériau / Composition', product.material);
  if (product.condition) pushSpec('État', product.condition);
  if (product.warranty) pushSpec('Garantie', product.warranty);
  if (product.unit) pushSpec('Unité de vente', product.unit);

  const dim = product.dimensions || product.packaging?.dimensions;
  if (dim && (dim.length || dim.width || dim.height)) {
    const dimStr = [dim.length, dim.width, dim.height].filter(Boolean).join(' × ') + (dim.unit ? ` ${dim.unit}` : ' cm');
    pushSpec('Dimensions', dimStr);
  }
  const weightVal = [product.weight, product.packaging?.weight, product.weightKg]
    .map(parsePositiveWeight)
    .find((value) => value != null);
  if (weightVal != null) {
    pushSpec('Poids brut', `${weightVal} kg`);
  }
  const packageSizeVal = product.packageSize || product.packaging?.packageSize;
  if (packageSizeVal) {
    pushSpec('Dimensions du colis', packageSizeVal);
  }
  const capacityVal = product.supplyCapacity || product.packaging?.supplyCapacity;
  if (capacityVal) {
    pushSpec('Capacité de fourniture', capacityVal);
  }
  if (isAlibaba) {
    pushSpec('Origine', 'Chine (Importation directe usine)');
    pushSpec('Mode d\'approvisionnement', 'Fabrication sur commande vérifiée');
  }

  const specifications = Array.from(specMap.values());

  // 6. Conditionnement & Vente en gros
  const weightCandidates = [product.weight, product.packaging?.weight, product.weightKg];
  const meaningfulWeight = weightCandidates.map(parsePositiveWeight).find((value) => value != null);
  const packaging = {
    weightKg: meaningfulWeight != null ? meaningfulWeight : '',
    packageSize: product.packageSize || product.packaging?.packageSize || '',
    dimensions: product.dimensions || product.packaging?.dimensions || null,
    unit: product.unit || product.packaging?.unit || 'Pièce',
    supplyCapacity: product.supplyCapacity || product.packaging?.supplyCapacity || '',
    hasPackaging: Boolean(meaningfulWeight != null || product.packageSize || product.dimensions),
  };

  const wholesale = {
    minOrderQuantity: moqRules.moq,
    unitType: packaging.unit,
    handlingTimeDays: product.wholesale?.handlingTimeDays || null,
    deliverPeriods: Array.isArray(product.wholesale?.deliverPeriods) ? product.wholesale.deliverPeriods : [],
    hasWholesale: publicPriceTiers.length > 0 || Boolean(product.wholesale?.handlingTimeDays) || moqRules.moq > 1,
  };

  // 7. Délais et Livraison
  const importDays = product.estimatedImportDays || {};
  const importMin = Number(importDays.min || 20);
  const importMax = Number(importDays.max || 30);
  const importDaysLabel = isDropship ? `${importMin}–${importMax} jours` : '';

  const sellerName = getDisplayVendorName(product);

  // 8. Description nettoyée
  const cleanDescription = extractCleanProse(product.description || product.shortDescription, product.name);
  const safeHtml = product.description && product.description.includes('<')
    ? sanitizeAlibabaHtml(product.description)
    : '';

  return {
    id: product._id || product.id,
    name: product.name || 'Produit',
    brand: product.brand && !/generic|cj\s*drop/i.test(product.brand) ? product.brand : null,
    modelNumber: product.modelNumber || null,
    category: product.category || 'Général',
    subCategory: product.subCategory || null,
    tagLabel: product.isFeatured ? 'Sélection' : product.isBestSeller ? 'Populaire' : hasPromo ? 'Promo' : null,

    // Prix
    price: basePrice,
    displayPrice,
    salePrice: promoPrice,
    hasPromo,
    discountPercent,

    // Stock & MOQ
    stock: Number.isFinite(productStock) ? Math.max(0, productStock) : 0,
    stockStatusLabel,
    stockStatusCode,
    inStock,
    isLowStock,
    isStockVerified,
    moqRules,

    // Médias
    images: allImages,
    primaryImage,
    videoUrl,
    hasVideo: Boolean(videoUrl),

    // Sections de contenu
    description: cleanDescription,
    safeHtml,
    specifications,
    publicPriceTiers,
    packaging,
    wholesale,

    // Origine & Expédition
    isAlibaba,
    isDropship,
    sellerName,
    isVendorCertified: Boolean(product.isVendorCertified || product.sellerVerified),
    importDaysLabel,
    shippingInfo: product.shippingInfo || '',
    warranty: product.warranty || '',
    deliveryZones: Array.isArray(product.deliveryZones) ? product.deliveryZones : [],

    // Variantes brutes transmises
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
}
