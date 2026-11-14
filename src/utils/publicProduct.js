export const PLATFORM_VENDOR_NAME = 'DANGO IMPORT';
export const CJ_CATALOG_VENDOR_LABEL = 'À importer';

function unwrapAlibabaPayload(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? unwrapAlibabaPayload(value[0]) : {};
  }
  return value && typeof value === 'object' ? value : {};
}

export function extractAlibabaDisplayInfo(product) {
  if (!product) return {};

  const supplier = product.supplier || {};

  // After sanitize, alibabaSKUs is the normalized field — prefer it
  const normalizedSkus = Array.isArray(product.alibabaSKUs) ? product.alibabaSKUs : null;

  // Fallback to raw for backwards compat (pre-sanitize contexts)
  const raw = unwrapAlibabaPayload(product.rawAlibabaData || product.alibabaData || {});

  const ladderPrices = Array.isArray(raw.ladderPrices || supplier.ladderPrices)
    ? (raw.ladderPrices || supplier.ladderPrices)
    : [];

  const rawSkus = normalizedSkus
    || (Array.isArray(raw.skus || supplier.skus) ? (raw.skus || supplier.skus) : []);

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

  const certs = Array.isArray(raw.certifications || supplier.certifications)
    ? (raw.certifications || supplier.certifications)
    : [];

  const shipFrom = raw.shipFromCountryName
    || supplier.shipFromCountryName
    || raw.ship_from_country_name
    || '';

  const detailUrl = raw.detail_url || raw.detailUrl || supplier.productUrl || '';
  const videoUrl = raw.video_url || raw.videoUrl || (Array.isArray(product.videos) ? product.videos[0] : '') || '';
  const supplierName = raw.supplier || supplier.name || supplier.manufacturerName || '';
  const eCompanyId = raw.eCompanyId || supplier.eCompanyId || '';
  const alibabaCategory = raw.category || '';
  const alibabaCategoryId = raw.category_id || raw.categoryId || '';
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
  'rawAlibabaData',
  'rawPayload',
  'normalized',
  'pricing',
  'rawSections',
];

export function isDropshippingProduct(product) {
  if (!product) return false;
  if (product?.sourceType === 'DROPSHIPPING') return true;
  if (product?.isAlibaba || product?.source === 'ALIBABA') return true;
  if (product?.supplier?.platform === 'alibaba' || product?.supplier?.platform === 'cj') return true;
  if (product?.importSourceType || product?.fulfillmentPlatform) return true;
  return true;
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
  if (product.isAlibaba === true) return true;
  const source = String(product?.source || '').toLowerCase();
  if (source === 'alibaba') return true;
  if (product.sourceProductId || product.externalProductId) return true;
  const platform = String(product?.supplier?.platform || product?.supplierPlatform || product?.fulfillmentPlatform || '').toLowerCase();
  if (platform === 'alibaba') return true;
  if (product?.importSourceType === 'ALIBABA_API') return true;
  const rawPayload = unwrapAlibabaPayload(product?.rawAlibabaData || product?.alibabaData || {});
  const rawSource = String(rawPayload?.source || '').toLowerCase();
  if (rawSource === 'alibaba') return true;
  const key = String(product?.externalSourceKey || product?.externalSourceId || '').toLowerCase();
  if (/^alibaba:/i.test(key)) return true;
  const url = String(product?.supplier?.productUrl || product?.supplierUrl || product?.productUrl || product?.detailUrl || '').toLowerCase();
  if (/alibaba\.com/i.test(url)) return true;
  const supplierName = String(product?.supplier?.name || product?.fulfillmentSupplierName || product?.vendorName || '').toLowerCase();
  if (supplierName === 'alibaba') return true;
  if (/alicdn\.com/i.test(String(product?.mainImage || product?.image || ''))) return true;
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
  const storedName = String(product?.name || product?.title || '').trim();
  const storedIsBad = isInvalidTranslationText(storedName) || isGenericProductPlaceholder(storedName);
  const candidates = [
    storedIsBad ? '' : storedName,
    product?.title,
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

function sanitizeVariantsForDisplay(variants = [], isAlibaba = false) {
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
    const variantStock = Number(variant?.stock ?? 0);
    const stock = Number.isFinite(variantStock) ? Math.max(0, variantStock) : 0;
    return { ...variant, name, stock };
  });
}

export function getProductSellableStock(product) {
  if (!product) return 0;
  if (isAlibabaProduct(product)) {
    const rawStock = Number(
      product.stock
      ?? product.inventory?.raw?.[0]?.inventory_list?.[0]?.inventory_count
      ?? 0
    );
    return Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : 0;
  }

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

  // isAlibabaProduct MUST be called before rawAlibabaData is deleted
  const isAlibaba = isAlibabaProduct(product);

  // Unwrap raw Alibaba payload (from rawAlibabaData or rawPayload)
  const rawAlibaba = unwrapAlibabaPayload(
    product.rawAlibabaData || product.rawPayload || product.alibabaData || {},
  );

  const sanitized = { ...product };

  // ─── Extract critical Alibaba fields BEFORE wiping INTERNAL_FIELDS ───────────
  if (isAlibaba) {
    // result_data may be nested one level deeper
    const rawResult = rawAlibaba.result_data || rawAlibaba;

    // SKUs (sku_attr_list for color/image matrix + ladder_price for price tiers)
    const rawSkus = Array.isArray(rawResult.skus) ? rawResult.skus
      : Array.isArray(rawAlibaba.skus) ? rawAlibaba.skus
      : Array.isArray(product.supplier?.skus) ? product.supplier.skus
      : [];
    if (rawSkus.length > 0) {
      sanitized.alibabaSKUs = rawSkus;
    }

    // keyAttributes for the product spec sheet
    const rawKeyAttrs = rawResult.keyAttributes
      || rawAlibaba.keyAttributes
      || product.keyAttributes
      || null;
    if (rawKeyAttrs) {
      sanitized.alibabaKeyAttributes = rawKeyAttrs;
    }

    // Factory HTML description (may contain presentation images, OEM/ODM markers)
    const rawDescHtml = rawResult.description || rawAlibaba.description || '';
    if (rawDescHtml && rawDescHtml.includes('<')) {
      sanitized.alibabaDescriptionHtml = rawDescHtml;
    }

    // Raw gallery image URLs
    const rawImgs = Array.isArray(rawResult.images) ? rawResult.images
      : Array.isArray(rawAlibaba.images) ? rawAlibaba.images
      : [];
    if (rawImgs.length > 0) {
      sanitized.alibabaGalleryImages = rawImgs;
    }

    // Factory model number
    if (!sanitized.modelNumber && rawResult.mode_id) {
      sanitized.modelNumber = rawResult.mode_id;
    }

    // Raw USD price tiers from first SKU's ladder_price
    if (!sanitized.sourcePriceTiers && rawSkus.length > 0) {
      const ladder = rawSkus[0]?.ladder_price;
      if (Array.isArray(ladder) && ladder.length > 0) {
        sanitized.sourcePriceTiers = ladder.map((l) => ({
          minQty: Number(l.min_quantity || l.minQty || 1),
          maxQty: Number(l.max_quantity || l.maxQty) > 0
            ? Number(l.max_quantity || l.maxQty)
            : null,
          price: Number(l.price || 0),
          currency: l.currency || 'USD',
        }));
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Remove all internal/sensitive fields (including rawAlibabaData, rawPayload, etc.)
  INTERNAL_FIELDS.forEach((field) => {
    delete sanitized[field];
  });

  if (isAlibaba) {
    sanitized.isAlibaba = true;
    sanitized.isPublished = true;
    sanitized.publicationStatus = 'published';

    // Conserver et propager l'ensemble des données riches Alibaba pour ProductDetail
    sanitized.alibaba = product.alibaba || sanitized.alibaba;
    sanitized.alibabaSKUs = product.alibabaSKUs || sanitized.alibabaSKUs || [];
    sanitized.alibabaKeyAttributes = product.alibabaKeyAttributes || sanitized.alibabaKeyAttributes || null;
    sanitized.keyAttributes = product.keyAttributes || sanitized.keyAttributes || sanitized.alibabaKeyAttributes || null;
    sanitized.attributes = product.attributes || sanitized.attributes || [];
    sanitized.publicPriceTiers = product.publicPriceTiers || sanitized.publicPriceTiers || [];
    sanitized.sourcePriceTiers = product.sourcePriceTiers || sanitized.sourcePriceTiers || [];
    sanitized.alibabaDescriptionHtml = product.alibabaDescriptionHtml || product.descriptionHtml || product.description || sanitized.alibabaDescriptionHtml || '';
    sanitized.descriptionHtml = sanitized.alibabaDescriptionHtml;
    sanitized.description = sanitized.description || sanitized.alibabaDescriptionHtml;
    sanitized.videoUrl = product.videoUrl || sanitized.videoUrl || '';
    sanitized.packaging = product.packaging || sanitized.packaging || null;
    sanitized.wholesale = product.wholesale || sanitized.wholesale || null;
    sanitized.specifications = product.specifications || sanitized.specifications || [];
    sanitized.supplierSummary = product.supplierSummary || sanitized.supplierSummary || null;
    sanitized.modelNumber = product.modelNumber || sanitized.modelNumber || '';
    sanitized.brand = product.brand || sanitized.brand || '';
    sanitized.category = product.category || sanitized.category || '';
    sanitized.certifications = product.certifications || sanitized.certifications || [];
    if (product.supplier) {
      sanitized.supplier = {
        name: product.supplier.name || 'Alibaba',
        platform: 'alibaba',
        productUrl: product.supplier.productUrl || '',
        estimatedDeliveryDays: product.supplier.estimatedDeliveryDays || 25,
        ladderPrices: product.supplier.ladderPrices || [],
        skus: product.supplier.skus || [],
        wholesaleTrade: product.supplier.wholesaleTrade || null,
        videoUrl: product.supplier.videoUrl || '',
        eCompanyId: product.supplier.eCompanyId || '',
        alibabaCategory: product.supplier.alibabaCategory || '',
        shipFromCountryName: product.supplier.shipFromCountryName || 'Chine',
      };
    }
    if (product.externalSourceKey) {
      sanitized.externalSourceKey = product.externalSourceKey;
    }
  }

  const normalizeUrl = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    return String(item.url || item.imageUrl || item.src || '').trim();
  };
  const rawImageCandidates = [
    product.mainImage,
    product.image,
    Array.isArray(product.galleryImages) ? product.galleryImages : [],
    Array.isArray(product.images) ? product.images : [],
    Array.isArray(sanitized.alibabaGalleryImages) ? sanitized.alibabaGalleryImages : [],
    Array.isArray(rawAlibaba.result_data?.images) ? rawAlibaba.result_data.images : [],
    Array.isArray(rawAlibaba.galleryImages) ? rawAlibaba.galleryImages : [],
    Array.isArray(rawAlibaba.images) ? rawAlibaba.images : [],
    Array.isArray(rawAlibaba.gallery) ? rawAlibaba.gallery : [],
    rawAlibaba.result_data?.product_image,
    rawAlibaba.product_image,
  ].flat();
  const imageCandidates = [...new Set(
    rawImageCandidates.flat().map(normalizeUrl).filter(Boolean)
  )];
  if (imageCandidates.length) {
    sanitized.galleryImages = imageCandidates;
    sanitized.images = imageCandidates;
    sanitized.image = imageCandidates[0];
    sanitized.mainImage = product.mainImage || imageCandidates[0];
  }

  if ((!sanitized.price || Number(sanitized.price) <= 0) && isAlibaba) {
    const rawP = Number(
      product.price ||
      sanitized.sourcePriceTiers?.[0]?.price ||
      sanitized.alibabaSKUs?.[0]?.ladder_price?.[0]?.price ||
      product.pricing?.tiers?.[0]?.price ||
      product.variants?.[0]?.pricing?.[0]?.price ||
      product.pricing?.sourcePrice ||
      rawAlibaba.result_data?.skus?.[0]?.ladder_price?.[0]?.price ||
      rawAlibaba.result_data?.wholesale_trade?.price ||
      rawAlibaba.result_data?.price ||
      0
    );
    if (rawP > 0) {
      sanitized.price = Math.round(rawP * 620 * 1.3);
    }
  }

  // Récupérer le poids pour l'affichage et les calculs de transport
  if (!sanitized.weight) {
    const rawWeight = (
      product.weight
      || product.logistics?.weight
      || product.packaging?.weight
      || rawAlibaba.weight
      || rawAlibaba.logistics?.weight
      || rawAlibaba.result_data?.productShippingInfo?.weight
      || rawAlibaba.result_data?.logistics_info?.weight
      || rawAlibaba.result_data?.weight
      || rawAlibaba.wholesale_trade?.weight
      || ''
    );
    if (rawWeight) {
      sanitized.weight = rawWeight;
      sanitized.weightUnit = product.weightUnit || product.logistics?.weightUnit || 'kg';
    }
  }

  const fallbackDescription = [
    product.description,
    product.shortDescription,
    rawAlibaba.description,
    rawAlibaba.result_data?.description,
    rawAlibaba.product?.description,
    rawAlibaba.raw?.result?.result_data?.description,
  ].find((value) => typeof value === 'string' && value.trim());
  if (fallbackDescription) {
    sanitized.description = sanitized.description || fallbackDescription;
  }
  if (!sanitized.shortDescription && sanitized.description) {
    sanitized.shortDescription = String(sanitized.description).slice(0, 220);
  }

  const keyAttributes = unwrapAlibabaPayload(rawAlibaba.keyAttributes || {});
  const keyAttributeRows = Array.isArray(
    keyAttributes.attributes
    || keyAttributes.attribute_list
    || keyAttributes.attr_list
    || keyAttributes.product_attributes,
  )
    ? (
      keyAttributes.attributes
      || keyAttributes.attribute_list
      || keyAttributes.attr_list
      || keyAttributes.product_attributes
    )
    : [];
  const specRows = [
    ...(Array.isArray(product.specifications) ? product.specifications : []),
    ...(Array.isArray(rawAlibaba.specifications) ? rawAlibaba.specifications : []),
    ...keyAttributeRows,
  ].map((row) => {
    if (!row || typeof row !== 'object') return null;
    const key = row.key || row.name || row.attr_name_desc || row.attr_name || row.attributeName || row.prop_name || row.property_name || '';
    const value = row.value || row.val || row.attr_value_desc || row.attr_value || row.attributeValue || row.prop_value || row.property_value || '';
    if (!key || !value) return null;
    return { key: String(key).trim(), value: String(value).trim() };
  }).filter(Boolean);
  if (specRows.length) {
    sanitized.specifications = specRows;
  }

  sanitized.stock = getProductSellableStock(isAlibaba ? { ...product, isAlibaba: true } : product);
  sanitized.name = resolveDisplayProductName(product);
  if (isInvalidTranslationText(sanitized.description)) {
    sanitized.description = sanitized.name;
  }
  if (isInvalidTranslationText(sanitized.shortDescription)) {
    sanitized.shortDescription = String(sanitized.description || sanitized.name).slice(0, 220);
  }
  if (Array.isArray(product.variants)) {
    sanitized.variants = sanitizeVariantsForDisplay(product.variants, isAlibaba);
  }

  if (isAlibaba) {
    if (!Array.isArray(sanitized.color) || !sanitized.color.length) {
      const colors = new Set();
      (sanitized.variants || []).forEach((v) => {
        const c = v?.attributes?.color || v?.attributes?.Couleur || v?.attributes?.Colour;
        if (c && typeof c === 'string') colors.add(c.trim());
      });
      if (colors.size > 0) sanitized.color = Array.from(colors);
    }
    if (!Array.isArray(sanitized.size) || !sanitized.size.length) {
      const sizes = new Set();
      (sanitized.variants || []).forEach((v) => {
        const s = v?.attributes?.size || v?.attributes?.Taille || v?.attributes?.Pointure;
        if (s && typeof s === 'string') sizes.add(s.trim());
      });
      if (sizes.size > 0) sanitized.size = Array.from(sizes);
    }
  }

  if (isDropshippingProduct(product)) {
    sanitized.vendorName = PLATFORM_VENDOR_NAME;
    sanitized.isVendorCertified = true;
    sanitized.originLabel = '';
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
  } else {
    sanitized.originLabel = '';
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
  return '';
}

export function isMarketplaceProduct(product) {
  if (!product) return false;
  if (isCjCatalogProduct(product)) return false;
  if (
    product.isAlibaba === true ||
    String(product.source || '').toUpperCase() === 'ALIBABA' ||
    product.sourceProductId ||
    product.externalProductId ||
    product.fulfillmentPlatform === 'Alibaba' ||
    /alicdn\.com/i.test(String(product.mainImage || product.image || ''))
  ) {
    return true;
  }
  if (isDropshippingProduct(product)) return false;
  const source = String(product.sourceType || 'LOCAL_SELLER').toUpperCase();
  return source === 'LOCAL_SELLER' || source === 'MARKETPLACE';
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
