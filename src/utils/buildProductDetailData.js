import { resolveImageUrl } from './imageUrl';
import { extractGalleryImages, extractPresentationImages, enrichVariantsWithColorImages } from './productMedia';
import { getMoqRules, getUnitPrice, getCardDisplayPrice } from './importMoq';
import { isAlibabaProduct, isDropshippingProduct, getDisplayVendorName } from './publicProduct';
import { formatCFA, calcDiscountPercent } from './formatPrice';

/**
 * Nettoie le code HTML d'une description Alibaba.
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

const ATTR_LABELS_FR = {
  connectors: 'Connecteurs',
  function: 'Fonctionnalités',
  material: 'Matériau',
  type: 'Type de câble / produit',
  'usb type': 'Connectique USB',
  'place of origin': 'Lieu de fabrication',
  use: 'Appareils compatibles',
  application: 'Compatibilité / Usage',
  'model number': 'Référence modèle',
  conductor: 'Conducteur interne',
  jacket: 'Gaine extérieure',
  'private mold': "Moule d'usine exclusif",
  shielding: 'Blindage anti-interférence',
  feature: 'Points forts',
  moq: "Quantité minimale d'usine (MOQ)",
  warranty: 'Garantie usine',
  'selling units:': 'Unité de vente',
  'single package size:': 'Dimensions colis unitaire',
  'single gross weight:': 'Poids brut unitaire',
  'cable length': 'Longueur du câble',
  color: 'Couleur disponible',
};

const VALUE_TRANSLATIONS = {
  'pure copper': 'Cuivre pur',
  shielded: 'Blindé',
  nylon: 'Nylon tressé',
  tpe: 'TPE renforcé',
  'eco-friendly': 'Écologique',
  '3a fast charging': 'Charge rapide 3A',
  'guangdong, china': 'Guangdong, Chine',
  '24 moths': '24 mois',
  'mobile phone': 'Téléphones mobiles',
  'for phone, tablet, laptop': 'Smartphones, tablettes, PC portables',
  'single item': 'Article individuel',
  'type-c to type-c': 'USB-C vers USB-C',
  'fast charging cable': 'Câble charge rapide',
  yes: 'Oui',
  no: 'Non',
};

/**
 * Prépare et centralise toutes les données prêtes à afficher dans la fiche produit.
 *
 * NOTE : Ce fichier lit exclusivement les champs NORMALISÉS du produit.
 * rawAlibabaData / rawPayload sont supprimés par sanitizeProductForDisplay().
 * Les données critiques Alibaba sont ré-exposées par sanitize en tant que :
 *   - product.alibabaSKUs          (SKUs avec sku_attr_list + ladder_price)
 *   - product.alibabaKeyAttributes (fiche technique)
 *   - product.alibabaDescriptionHtml (HTML usine pour présentation + OEM/ODM)
 *   - product.alibabaGalleryImages  (galerie brute)
 *   - product.modelNumber           (numéro modèle usine)
 *   - product.sourcePriceTiers      (paliers USD bruts)
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

  // 3. Galerie complète et variantes enrichies
  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const enrichedVariants = enrichVariantsWithColorImages(product, rawVariants);
  const rawImages = extractGalleryImages(product);
  const variantImages = enrichedVariants
    .map((v) => resolveImageUrl(v?.image))
    .filter(Boolean);

  const mergedImages = [...new Set([...rawImages, ...variantImages])].filter(Boolean);
  const primaryImage = product.image ? resolveImageUrl(product.image) : mergedImages[0] || null;
  const allImages = primaryImage
    ? [primaryImage, ...mergedImages.filter((url) => url !== primaryImage)]
    : mergedImages;

  const presentationImages = extractPresentationImages(product);

  const videoUrl = product.videoUrl
    || product.videos?.[0]
    || product.supplier?.videoUrl
    || '';

  // 4. Paliers de prix en gros (PUBLIC en XOF)
  const rawTiers = Array.isArray(product.publicPriceTiers) && product.publicPriceTiers.length > 0
    ? product.publicPriceTiers
    : [];

  let publicPriceTiers = [];
  if (rawTiers.length > 0) {
    publicPriceTiers = rawTiers.map((t) => {
      const min = Math.max(1, Number(t.minQuantity || t.minQty || t.min || 1));
      const max = t.maxQuantity || t.maxQty || t.max
        ? Number(t.maxQuantity || t.maxQty || t.max)
        : null;
      const tierUnitPrice = Number(t.unitPrice || t.price || 0);
      const savings = basePrice > 0 && tierUnitPrice < basePrice
        ? Math.round(((basePrice - tierUnitPrice) / basePrice) * 100)
        : 0;
      return {
        min,
        max,
        label: max
          ? `${min.toLocaleString('fr-FR')} à ${max.toLocaleString('fr-FR')} unités`
          : `≥ ${min.toLocaleString('fr-FR')} unités`,
        unitPrice: tierUnitPrice,
        unitPriceFormatted: formatCFA(tierUnitPrice),
        savingsPercent: savings,
      };
    });
  } else {
    // Fallback : sourcePriceTiers (extrait depuis ladder_price dans sanitizeProductForDisplay, ou rawPayload fallback)
    const ladderTiers = (Array.isArray(product.sourcePriceTiers) && product.sourcePriceTiers.length > 0)
      ? product.sourcePriceTiers
      : (() => {
          const rawLadder = product.alibabaSKUs?.[0]?.ladder_price
            || product.rawPayload?.result_data?.skus?.[0]?.ladder_price
            || product.rawAlibabaData?.result_data?.skus?.[0]?.ladder_price;
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
        const min = Math.max(1, Number(t.minQty || 1));
        const maxVal = Number(t.maxQty);
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
          label: t.max
            ? `${t.min.toLocaleString('fr-FR')} à ${t.max.toLocaleString('fr-FR')} unités`
            : `≥ ${t.min.toLocaleString('fr-FR')} unités`,
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

  // Specs normalisées du produit
  (Array.isArray(product.specifications) ? product.specifications : []).forEach((s) => {
    if (s && s.key && s.value) pushSpec(s.key, s.value);
  });

  // Specs depuis alibabaKeyAttributes (extrait dans sanitizeProductForDisplay, avec fallback raw)
  const keyAttrsSrc = product.alibabaKeyAttributes
    || product.keyAttributes
    || product.alibaba?.keyAttributes
    || product.rawPayload?.result_data?.keyAttributes
    || product.rawAlibabaData?.result_data?.keyAttributes
    || null;
  const keyAttrsList = Array.isArray(keyAttrsSrc?.attributes)
    ? keyAttrsSrc.attributes
    : (Array.isArray(keyAttrsSrc) ? keyAttrsSrc : []);

  keyAttrsList.forEach((group) => {
    (group.attributes || []).forEach((attr) => {
      if (!attr?.name) return;
      const vals = (attr.values || []).map((v) => (typeof v === 'string' ? v : v?.value)).filter(Boolean);
      if (!vals.length && attr.value) vals.push(attr.value);
      if (vals.length) {
        const rawName = attr.name.trim();
        const lowerName = rawName.toLowerCase().replace(/:$/, '');
        if (['brand name', 'logo', 'product name', 'keywords'].includes(lowerName)) return;
        const cleanName = ATTR_LABELS_FR[lowerName] || rawName.replace(/:$/, '').trim();
        const cleanVal = vals
          .map((v) => VALUE_TRANSLATIONS[String(v).trim().toLowerCase()] || v)
          .join(', ');
        pushSpec(cleanName, cleanVal);
      }
    });
  });

  // Numéro de modèle (extrait dans sanitize vers product.modelNumber, avec fallback raw)
  const modelVal = product.modelNumber
    || product.rawPayload?.result_data?.mode_id
    || product.rawAlibabaData?.result_data?.mode_id
    || null;
  if (modelVal) pushSpec('Référence modèle usine', modelVal);

  // Fournisseur (avec fallback raw, sans exposer le nom direct si alibaba)
  const supplierVal = product.supplier?.name
    || product.vendorName
    || product.rawPayload?.result_data?.supplier
    || product.rawAlibabaData?.result_data?.supplier
    || null;
  if (supplierVal && !/alibaba/i.test(supplierVal)) {
    pushSpec('Usine partenaire certifiée', supplierVal);
  }

  if (product.brand && !/generic|cj\s*drop/i.test(product.brand)) {
    pushSpec('Marque', product.brand);
  }
  if (product.material) pushSpec('Matériau / Composition', product.material);
  if (product.condition) pushSpec('État', product.condition);

  // Garantie
  const keyWarranty = keyAttrsList
    .flatMap((g) => g.attributes || [])
    .find((a) => /warranty/i.test(a?.name || ''))
    ?.values?.[0]?.value;
  const warrantyVal = product.warranty || keyWarranty || '';
  if (warrantyVal) {
    const cleanW = VALUE_TRANSLATIONS[String(warrantyVal).trim().toLowerCase()] || warrantyVal;
    pushSpec('Garantie usine', cleanW);
  }

  if (product.unit) pushSpec('Unité de vente', product.unit);

  const dim = product.dimensions || product.packaging?.dimensions;
  if (dim && (dim.length || dim.width || dim.height)) {
    const dimStr =
      [dim.length, dim.width, dim.height].filter(Boolean).join(' × ') +
      (dim.unit ? ` ${dim.unit}` : ' cm');
    pushSpec('Dimensions', dimStr);
  }

  const weightVal = [product.weight, product.packaging?.weight, product.weightKg]
    .map(parsePositiveWeight)
    .find((v) => v != null);

  const keyWeightRaw = keyAttrsList
    .flatMap((g) => g.attributes || [])
    .find((a) => /single gross weight/i.test(a?.name || ''))
    ?.values?.[0]?.value;
  const keyPackageSize = keyAttrsList
    .flatMap((g) => g.attributes || [])
    .find((a) => /single package size/i.test(a?.name || ''))
    ?.values?.[0]?.value;

  const finalWeightKg = weightVal != null ? weightVal : parsePositiveWeight(keyWeightRaw);
  if (finalWeightKg != null) {
    pushSpec('Poids brut', `${finalWeightKg} kg`);
  }

  const packageSizeVal = product.packageSize || product.packaging?.packageSize || keyPackageSize;
  if (packageSizeVal) {
    pushSpec('Dimensions colis unitaire', packageSizeVal.replace(/\s*x\s*/gi, ' × '));
  }

  const capacityVal = product.supplyCapacity || product.packaging?.supplyCapacity;
  if (capacityVal) {
    pushSpec('Capacité de fourniture usine', capacityVal);
  }

  if (isAlibaba) {
    pushSpec('Origine', 'Chine (Fabrication et importation directe usine)');
    pushSpec("Mode d'approvisionnement", 'Fabrication sur commande vérifiée avec inspection');
  }

  const specifications = Array.from(specMap.values());

  // 6. Conditionnement & Vente en gros
  const packaging = {
    weightKg: finalWeightKg != null ? finalWeightKg : '',
    packageSize: packageSizeVal || '',
    dimensions: product.dimensions || product.packaging?.dimensions || null,
    unit: product.unit || product.packaging?.unit || 'Pièce',
    supplyCapacity: capacityVal || '',
    hasPackaging: Boolean(finalWeightKg != null || packageSizeVal || product.dimensions),
  };

  const wholesale = {
    minOrderQuantity: moqRules.moq,
    unitType: packaging.unit,
    handlingTimeDays: product.wholesale?.handlingTimeDays || null,
    deliverPeriods: Array.isArray(product.wholesale?.deliverPeriods)
      ? product.wholesale.deliverPeriods
      : [],
    hasWholesale:
      publicPriceTiers.length > 0 ||
      Boolean(product.wholesale?.handlingTimeDays) ||
      moqRules.moq > 1,
  };

  // 7. Délais et Livraison
  const importDays = product.estimatedImportDays || {};
  const importMin = Number(importDays.min || 20);
  const importMax = Number(importDays.max || 30);
  const importDaysLabel = isDropship ? `${importMin}–${importMax} jours` : '';

  const sellerName = getDisplayVendorName(product);
  const hasFactorySupplier = Boolean(isAlibaba || supplierVal);

  // 8. Personnalisation usine (OEM / ODM)
  // Lire depuis alibabaDescriptionHtml (HTML usine brut) + description normalisée (avec fallback raw)
  const fullDesc = `${product.alibabaDescriptionHtml || ''} ${product.description || ''} ${product.rawPayload?.result_data?.description || ''} ${product.rawAlibabaData?.result_data?.description || ''}`;
  const hasCustom = /oem|odm|customiz|personnalis/i.test(fullDesc);
  const customOptions = [];
  if (/logo/i.test(fullDesc)) customOptions.push('Impression de logo personnalisé');
  if (/length|longueur/i.test(fullDesc)) customOptions.push('Longueur de câble sur mesure');
  if (/connector|bo[îi]tier/i.test(fullDesc)) customOptions.push('Boîtier et connecteurs personnalisés');
  if (/braid|tress/i.test(fullDesc)) customOptions.push('Texture tressée au choix');
  if (/packag|emballage/i.test(fullDesc)) customOptions.push("Conception d'emballage personnalisé");
  if (hasCustom && customOptions.length === 0) {
    customOptions.push('Logo usine personnalisé', 'Emballage sur mesure', 'Personnalisation graphique');
  }
  const customization = {
    available: hasCustom,
    options: customOptions,
  };

  // 9. Description nettoyée
  const cleanDescription = extractCleanProse(
    product.description || product.shortDescription,
    product.name,
  );
  const safeHtml =
    product.description && product.description.includes('<')
      ? sanitizeAlibabaHtml(product.description)
      : '';

  return {
    id: product._id || product.id,
    name: product.name || product.title || 'Produit',
    brand: product.brand && !/generic|cj\s*drop/i.test(product.brand) ? product.brand : null,
    modelNumber: modelVal || null,
    category: product.category || 'Général',
    subCategory: product.subCategory || null,
    tagLabel: product.isFeatured
      ? 'Sélection'
      : product.isBestSeller
        ? 'Populaire'
        : hasPromo
          ? 'Promo'
          : null,

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
    presentationImages,

    // Sections de contenu
    description: cleanDescription,
    safeHtml,
    specifications,
    publicPriceTiers,
    packaging,
    wholesale,
    customization,

    // Origine & Expédition
    isAlibaba,
    isDropship,
    sellerName,
    hasFactorySupplier,
    isVendorCertified: Boolean(product.isVendorCertified || product.sellerVerified),
    importDaysLabel,
    shippingInfo: product.shippingInfo || '',
    warranty: product.warranty || warrantyVal || '',
    deliveryZones: Array.isArray(product.deliveryZones) ? product.deliveryZones : [],

    // Variantes enrichies avec les images de couleurs
    variants: enrichedVariants,
  };
}
