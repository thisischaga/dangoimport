import { resolveImageUrl } from './imageUrl';

/**
 * Extrait toutes les URLs d'images d'une chaîne HTML (balises <img>).
 */
export function extractImagesFromHtml(html = '') {
  if (!html || typeof html !== 'string') return [];
  const urls = [];
  const imgRegex = /<img[^>]+src=['"]([^'"]+)['"]/gi;
  let match = imgRegex.exec(html);
  while (match) {
    const rawUrl = match[1];
    const resolved = resolveImageUrl(rawUrl);
    if (resolved && !urls.includes(resolved)) {
      urls.push(resolved);
    }
    match = imgRegex.exec(html);
  }
  return urls;
}

/**
 * Extrait les images de présentation d'usine / entreprise.
 * Priorité : alibabaDescriptionHtml (extrait dans sanitize) > description HTML > descriptionImages > images OTHER
 */
export function extractPresentationImages(product = {}) {
  // Après sanitize, les données brutes Alibaba sont dans alibabaDescriptionHtml (avec fallback raw)
  const htmlCandidates = [
    product?.alibabaDescriptionHtml,
    product?.descriptionHtml,
    product?.rawPayload?.result_data?.description,
    product?.rawAlibabaData?.result_data?.description,
    product?.description,
  ];

  const htmlImages = [];
  for (const html of htmlCandidates) {
    if (html && typeof html === 'string' && html.includes('<img')) {
      const extracted = extractImagesFromHtml(html);
      extracted.forEach((url) => {
        if (!htmlImages.includes(url)) htmlImages.push(url);
      });
      if (htmlImages.length > 0) break;
    }
  }

  // Si des images de description ont été explicitement enregistrées
  if (Array.isArray(product?.descriptionImages)) {
    product.descriptionImages.forEach((img) => {
      const url = resolveImageUrl(typeof img === 'string' ? img : img?.url);
      if (url && !htmlImages.includes(url)) htmlImages.push(url);
    });
  }

  // Visuels de contexte/usine marqués OTHER
  const otherImages = (Array.isArray(product?.images) ? product.images : [])
    .filter((img) => img?.source === 'OTHER' || img?.isMain === false)
    .map((img) => resolveImageUrl(typeof img === 'string' ? img : img?.url))
    .filter(Boolean);

  return [...new Set([...htmlImages, ...otherImages])];
}

/**
 * Récupère la galerie complète du produit (photos studio / produit).
 * Priorité : image principale > images galerie normalisées > alibabaGalleryImages (extrait dans sanitize)
 */
export function extractGalleryImages(product = {}, max = Infinity) {
  if (!product) return [];
  const gallery = [];

  const add = (raw) => {
    if (!raw) return;
    const url = resolveImageUrl(typeof raw === 'string' ? raw : raw?.url);
    if (url && !gallery.includes(url)) gallery.push(url);
  };

  // 1. Image principale prioritaire
  add(product.image);
  add(product.mainImage);

  // 2. Images produit principales / studio (source GALLERY)
  if (Array.isArray(product.images)) {
    product.images
      .filter((img) => !img?.source || img?.source === 'GALLERY' || img?.isMain)
      .forEach(add);
  }

  // 3. Images galerie normalisées Alibaba (extrait dans sanitizeProductForDisplay, avec fallback raw)
  const alibabaGallery = Array.isArray(product.alibabaGalleryImages)
    ? product.alibabaGalleryImages
    : Array.isArray(product.rawPayload?.result_data?.images)
      ? product.rawPayload.result_data.images
      : Array.isArray(product.rawAlibabaData?.result_data?.images)
        ? product.rawAlibabaData.result_data.images
        : Array.isArray(product.galleryImages)
          ? product.galleryImages
          : [];
  alibabaGallery.forEach(add);

  // 4. Si la galerie est très pauvre, inclure toutes les images de product.images
  if (gallery.length <= 1 && Array.isArray(product.images)) {
    product.images.forEach(add);
  }

  return Number.isFinite(max) && max > 0 ? gallery.slice(0, max) : gallery;
}

/**
 * Associe aux variantes l'image de leur couleur respective.
 * Lit depuis product.alibabaSKUs (extrait dans sanitizeProductForDisplay via rawAlibabaData.result_data.skus).
 */
export function enrichVariantsWithColorImages(product = {}, rawVariants = []) {
  // Après sanitize : alibabaSKUs contient les SKUs bruts (avec fallback raw)
  const skus = Array.isArray(product?.alibabaSKUs)
    ? product.alibabaSKUs
    : Array.isArray(product?.rawPayload?.result_data?.skus)
      ? product.rawPayload.result_data.skus
      : Array.isArray(product?.rawAlibabaData?.result_data?.skus)
        ? product.rawAlibabaData.result_data.skus
        : Array.isArray(product?.supplier?.skus)
          ? product.supplier.skus
          : [];

  const colorImageMap = {};
  if (Array.isArray(skus)) {
    skus.forEach((sku) => {
      const attrs = sku?.sku_attr_list || [];
      attrs.forEach((attr) => {
        const name = String(attr?.attr_name_desc || attr?.name || '').toLowerCase();
        const val = String(attr?.attr_value_desc || attr?.value || '').trim().toLowerCase();
        const img = attr?.attr_value_image || sku?.image;
        if (img && (name.includes('color') || name.includes('couleur')) && val) {
          const cleanImg = resolveImageUrl(String(img).replace(/_\d+x\d+\.\w+$/, ''));
          if (cleanImg && !colorImageMap[val]) {
            colorImageMap[val] = cleanImg;
          }
        }
      });
    });
  }

  return rawVariants.map((v) => {
    const vColor = String(
      v?.attributes?.color
      || v?.attributes?.Couleur
      || v?.attributes?.couleur
      || ''
    ).trim().toLowerCase();

    const existingImage = resolveImageUrl(v?.image);
    const colorImage = colorImageMap[vColor] || existingImage || null;

    return {
      ...v,
      image: colorImage || existingImage || '',
    };
  });
}
