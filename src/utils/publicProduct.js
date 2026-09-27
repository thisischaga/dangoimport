export const PLATFORM_VENDOR_NAME = 'DANGO IMPORT';

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

export function sanitizeProductForDisplay(product) {
  if (!product) return null;

  const sanitized = { ...product };
  INTERNAL_FIELDS.forEach((field) => {
    delete sanitized[field];
  });

  sanitized.stock = getProductSellableStock(product);

  if (isDropshippingProduct(product)) {
    sanitized.vendorName = PLATFORM_VENDOR_NAME;
    sanitized.isVendorCertified = true;
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
  }

  return sanitized;
}

export function sanitizeProductsForDisplay(products = []) {
  return (products || []).map(sanitizeProductForDisplay).filter(Boolean);
}

export function getDisplayVendorName(product) {
  if (isDropshippingProduct(product)) return PLATFORM_VENDOR_NAME;
  return product?.vendorName || product?.sellerName || 'Vendeur indépendant';
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
