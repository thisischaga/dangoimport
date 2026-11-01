export function normalizeVariantAttributeKey(raw) {
  if (raw == null) return '';
  const cleaned = String(raw).trim().toLowerCase();
  const aliases = {
    couleur: 'color',
    color: 'color',
    colour: 'color',
    taille: 'size',
    size: 'size',
    pointure: 'size',
    shoe: 'size',
    'eur size': 'size',
    'us size': 'size',
  };
  if (aliases[cleaned]) return aliases[cleaned];
  const sanitized = cleaned.replace(/[^a-z0-9]+/g, '');
  if (aliases[sanitized]) return aliases[sanitized];
  return sanitized || '';
}

export function getVariantAttributeValue(variant, key) {
  if (!variant || !variant.attributes || typeof variant.attributes !== 'object') return null;
  const targetKey = normalizeVariantAttributeKey(key);
  for (const [attrKey, attrValue] of Object.entries(variant.attributes)) {
    if (normalizeVariantAttributeKey(attrKey) === targetKey) {
      const value = String(attrValue ?? '').trim();
      return value || null;
    }
  }
  return null;
}

function matchesSelection(variant, selectedColor, selectedSize) {
  const colorValue = getVariantAttributeValue(variant, 'color');
  const sizeValue = getVariantAttributeValue(variant, 'size');
  const colorMatch = !selectedColor || !colorValue || colorValue.toLowerCase() === String(selectedColor).trim().toLowerCase();
  const sizeMatch = !selectedSize || !sizeValue || sizeValue.toLowerCase() === String(selectedSize).trim().toLowerCase();
  return colorMatch && sizeMatch;
}

export function resolveVariantSelection(variants, selectedColor = null, selectedSize = null) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) {
    return { index: -1, color: selectedColor ?? null, size: selectedSize ?? null, variant: null };
  }

  const normalizedColor = selectedColor ? String(selectedColor).trim() : null;
  const normalizedSize = selectedSize ? String(selectedSize).trim() : null;

  const exactMatchIndex = list.findIndex((variant) => matchesSelection(variant, normalizedColor, normalizedSize));
  if (exactMatchIndex >= 0) {
    return {
      index: exactMatchIndex,
      color: normalizedColor,
      size: normalizedSize,
      variant: list[exactMatchIndex],
    };
  }

  const partialMatchIndex = list.findIndex((variant) => {
    const colorValue = getVariantAttributeValue(variant, 'color');
    const sizeValue = getVariantAttributeValue(variant, 'size');
    const colorMatched = !normalizedColor || !colorValue || colorValue.toLowerCase() === normalizedColor.toLowerCase();
    const sizeMatched = !normalizedSize || !sizeValue || sizeValue.toLowerCase() === normalizedSize.toLowerCase();
    return colorMatched || sizeMatched;
  });

  if (partialMatchIndex >= 0) {
    return {
      index: partialMatchIndex,
      color: normalizedColor,
      size: normalizedSize,
      variant: list[partialMatchIndex],
    };
  }

  return {
    index: 0,
    color: normalizedColor,
    size: normalizedSize,
    variant: list[0],
  };
}
