/**
 * ════════════════════════════════════════════════════════════════════
 * variantSelection.js
 * Gestion et sélection robuste des variantes et attributs (couleur, taille, etc.)
 * Compatible avec les formats :
 *  - Alibaba (attributes sous forme de tableau [{name, value, image}])
 *  - Alibaba SKUs (sku_attr_list [{attr_name, attr_value, attr_value_image}])
 *  - CJ Dropshipping (attributes sous forme d'objet {color: "...", size: "..."})
 *  - Vendeurs locaux (objets plats ou array)
 * ════════════════════════════════════════════════════════════════════
 */

export const INTERNAL_VARIANT_ATTR_KEYS = new Set([
  'externalvariantid',
  'variantkey',
  'supplierpriceusd',
  'supplierpricecny',
  'vid',
  'pid',
  'skuid',
  'sellerskuid',
  'productid',
]);

/**
 * Dictionnaire étendu de correspondances couleur -> code hexadécimal / gradient
 */
export const COLOR_MAP = {
  // Blancs / Crèmes
  blanc: '#FFFFFF',
  white: '#FFFFFF',
  creme: '#FFFDD0',
  crème: '#FFFDD0',
  cream: '#FFFDD0',
  ivoire: '#FFFFF0',
  ivory: '#FFFFF0',
  beige: '#F5F5DC',

  // Noirs / Gris
  noir: '#18181B',
  black: '#18181B',
  gris: '#9CA3AF',
  gray: '#9CA3AF',
  grey: '#9CA3AF',
  'gris clair': '#E5E7EB',
  'light gray': '#E5E7EB',
  'gris fonce': '#4B5563',
  'gris foncé': '#4B5563',
  'dark gray': '#4B5563',
  anthracite: '#374151',
  argent: '#CBD5E1',
  silver: '#CBD5E1',

  // Bleus
  bleu: '#2563EB',
  blue: '#2563EB',
  'bleu ciel': '#7DD3FC',
  'sky blue': '#7DD3FC',
  'light blue': '#93C5FD',
  'bleu clair': '#93C5FD',
  marine: '#1E3A8A',
  navy: '#1E3A8A',
  'bleu marine': '#1E3A8A',
  'navy blue': '#1E3A8A',
  cyan: '#06B6D4',
  turquoise: '#14B8A6',
  teal: '#0D9488',

  // Rouges / Roses
  rouge: '#EF4444',
  red: '#EF4444',
  rose: '#F472B6',
  pink: '#F472B6',
  'rose pale': '#FBCFE8',
  'rose pâle': '#FBCFE8',
  'light pink': '#FBCFE8',
  bordeaux: '#881337',
  burgundy: '#881337',
  corail: '#FB7185',
  coral: '#FB7185',

  // Verts
  vert: '#10B981',
  green: '#10B981',
  'vert clair': '#6EE7B7',
  'light green': '#6EE7B7',
  menthe: '#A7F3D0',
  mint: '#A7F3D0',
  'vert menthe': '#A7F3D0',
  'vert armee': '#4D7C0F',
  'vert armée': '#4D7C0F',
  'army green': '#4D7C0F',
  olive: '#65A30D',
  kaki: '#78716C',
  khaki: '#78716C',

  // Jaunes / Oranges
  jaune: '#FACC15',
  yellow: '#FACC15',
  orange: '#FB923C',
  ambre: '#F59E0B',
  amber: '#F59E0B',
  or: '#F59E0B',
  gold: '#F59E0B',
  dore: '#F59E0B',
  doré: '#F59E0B',

  // Violets
  violet: '#8B5CF6',
  purple: '#8B5CF6',
  mauve: '#C084FC',
  lilas: '#DDD6FE',
  lavender: '#E9D5FF',
  indigo: '#6366F1',

  // Marrons
  marron: '#78350F',
  brown: '#78350F',
  chocolat: '#451A03',
  cafe: '#713F12',
  café: '#713F12',
  coffee: '#713F12',
  caramel: '#B45309',

  // Multicolores / Dégradés
  multicolore: 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #3B82F6)',
  transparent: 'repeating-conic-gradient(#E5E7EB 0% 25%, #FFFFFF 0% 50%) 50% / 8px 8px',
};

/**
 * Convertit un nom de couleur en code CSS (hex/gradient).
 */
export function resolveColorStyle(colorRaw, imageUrl = null) {
  const name = String(colorRaw || '').trim().toLowerCase();
  
  // 1. Correspondance exacte
  if (COLOR_MAP[name]) {
    const val = COLOR_MAP[name];
    const isLight = ['blanc', 'white', 'creme', 'crème', 'cream', 'ivoire', 'ivory', 'beige', 'jaune', 'yellow', 'gris clair', 'light gray', 'rose pale', 'rose pâle', 'light pink', 'argent', 'silver'].includes(name);
    return {
      background: val,
      backgroundColor: val.startsWith('linear') ? undefined : val,
      isLight,
      hasImage: false,
    };
  }

  // 2. Correspondance partielle (ex: "Bleu ciel (500ml)" -> "bleu ciel")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (name.includes(key)) {
      const isLight = ['blanc', 'white', 'creme', 'crème', 'cream', 'ivoire', 'ivory', 'beige', 'jaune', 'yellow', 'gris clair', 'light gray', 'rose pale', 'rose pâle', 'light pink', 'argent', 'silver'].includes(key);
      return {
        background: val,
        backgroundColor: val.startsWith('linear') ? undefined : val,
        isLight,
        hasImage: false,
      };
    }
  }

  // 3. Si une image de variant/couleur existe et pas de couleur trouvée
  if (imageUrl) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      isLight: true,
      hasImage: true,
    };
  }

  // 4. Couleur par défaut élégante
  return {
    backgroundColor: '#E4E8EB',
    isLight: true,
    hasImage: false,
  };
}

/**
 * Coerce une valeur d'attribut qui peut être une string ou un objet Alibaba.
 * Gère aussi les tableaux d'objets (Alibaba SKU attributes).
 */
export function coerceAttrValue(raw) {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw)) {
    // Tableau de valeurs : on prend la première valeur significative
    for (const item of raw) {
      const v = coerceAttrValue(item);
      if (v) return v;
    }
    return '';
  }
  if (typeof raw === 'object') {
    // Alibaba attribute object : {value, attr_value, attr_value_desc, attrValue, name, label, skuPropertyValueDisplayName, ...}
    const v =
      raw.value ??
      raw.attr_value ??
      raw.attr_value_desc ??
      raw.attrValue ??
      raw.skuPropertyValueDisplayName ??
      raw.displayName ??
      raw.valueName ??
      raw.name ??
      raw.label ??
      '';
    return String(v).trim();
  }
  return String(raw).trim();
}

/**
 * Normalise les clés d'attributs pour regrouper couleur, taille, etc.
 */
export function normalizeVariantAttributeKey(raw) {
  if (raw == null) return '';
  const cleaned = String(raw).trim().toLowerCase();
  const aliases = {
    couleur: 'color',
    color: 'color',
    colour: 'color',
    shade: 'color',
    taille: 'size',
    size: 'size',
    pointure: 'size',
    shoe: 'size',
    'eur size': 'size',
    'us size': 'size',
    capacite: 'capacity',
    capacité: 'capacity',
    capacity: 'capacity',
    volume: 'capacity',
    contenance: 'capacity',
    modele: 'model',
    modèle: 'model',
    model: 'model',
    materiau: 'material',
    matériau: 'material',
    material: 'material',
  };
  if (aliases[cleaned]) return aliases[cleaned];
  const sanitized = cleaned.replace(/[^a-z0-9]+/g, '');
  if (aliases[sanitized]) return aliases[sanitized];
  return sanitized || '';
}

/**
 * Récupère la valeur d'un attribut sur un variant donné.
 */
export function getVariantAttributeValue(variant, key) {
  if (!variant) return null;
  const targetKey = normalizeVariantAttributeKey(key);

  // 1. Propriétés directes
  if (targetKey === 'color' && variant.color) return coerceAttrValue(variant.color);
  if (targetKey === 'size' && variant.size) return coerceAttrValue(variant.size);

  // 2. Si variant.attributes est un tableau (Alibaba)
  if (Array.isArray(variant.attributes)) {
    for (const attr of variant.attributes) {
      if (!attr) continue;
      const aName = normalizeVariantAttributeKey(attr.name || attr.key || attr.attr_name || attr.attribute_name);
      if (aName === targetKey) {
        const val = coerceAttrValue(attr.value ?? attr.attr_value ?? attr.val ?? attr);
        if (val) return val;
      }
    }
  }

  // 3. Si variant.sku_attr_list est un tableau (Alibaba SKUs bruts)
  if (Array.isArray(variant.sku_attr_list)) {
    for (const attr of variant.sku_attr_list) {
      if (!attr) continue;
      const aName = normalizeVariantAttributeKey(attr.attr_name_desc || attr.attr_name || attr.name);
      if (aName === targetKey) {
        const val = coerceAttrValue(attr.attr_value_desc || attr.attr_value || attr.value);
        if (val) return val;
      }
    }
  }

  // 4. Si variant.attributes est un objet (CJ / Local)
  if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
    for (const [attrKey, attrValue] of Object.entries(variant.attributes)) {
      if (normalizeVariantAttributeKey(attrKey) === targetKey) {
        const val = coerceAttrValue(attrValue);
        if (val) return val;
      }
    }
  }

  return null;
}

/**
 * Récupère l'image associée à un attribut (souvent la miniature de la couleur)
 */
export function getVariantAttributeImage(variant, key) {
  if (!variant) return null;
  const targetKey = normalizeVariantAttributeKey(key);

  if (Array.isArray(variant.attributes)) {
    for (const attr of variant.attributes) {
      if (!attr) continue;
      const aName = normalizeVariantAttributeKey(attr.name || attr.key || attr.attr_name || attr.attribute_name);
      if (aName === targetKey && attr.image) {
        return attr.image;
      }
    }
  }

  if (Array.isArray(variant.sku_attr_list)) {
    for (const attr of variant.sku_attr_list) {
      if (!attr) continue;
      const aName = normalizeVariantAttributeKey(attr.attr_name_desc || attr.attr_name || attr.name);
      if (aName === targetKey && (attr.attr_value_image || attr.image)) {
        return attr.attr_value_image || attr.image;
      }
    }
  }

  if (targetKey === 'color' && variant.image) {
    return variant.image;
  }

  return null;
}

/**
 * Extrait tous les attributs d'un variant sous forme d'objet { color: '...', size: '...' }
 * Gère tous les formats : Alibaba (array), CJ (object), local (plat), etc.
 */
export function extractAllVariantAttributes(variant) {
  if (!variant) return {};
  const result = {};

  // ── Propriétés directes ───────────────────────────────────────────
  if (variant.color) {
    const c = coerceAttrValue(variant.color);
    if (c && !c.startsWith('{') && !c.startsWith('[')) result.color = c;
  }
  if (variant.size) {
    const s = coerceAttrValue(variant.size);
    if (s && !s.startsWith('{') && !s.startsWith('[')) result.size = s;
  }

  // ── Alibaba : variant.attributes = [{name, value|attr_value, image?}] ──
  if (Array.isArray(variant.attributes)) {
    variant.attributes.forEach((attr) => {
      if (!attr) return;
      const rawName = attr.name || attr.key || attr.attr_name || attr.attribute_name
        || attr.skuPropertyName || attr.propertyName;
      // La valeur peut être un objet { value, image } ou une string directe
      let rawVal;
      if (attr.value !== undefined) rawVal = attr.value;
      else if (attr.attr_value !== undefined) rawVal = attr.attr_value;
      else if (attr.val !== undefined) rawVal = attr.val;
      else if (attr.attr_value_desc !== undefined) rawVal = attr.attr_value_desc;
      else rawVal = attr;
      const val = coerceAttrValue(rawVal);
      if (rawName && val && !val.startsWith('{') && !val.startsWith('[')) {
        const norm = normalizeVariantAttributeKey(rawName);
        if (norm && !INTERNAL_VARIANT_ATTR_KEYS.has(norm)) {
          result[norm] = val;
        }
      }
    });
  }

  // ── CJ / Local : variant.attributes = { color: '...', size: '...' } ──
  if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
    Object.entries(variant.attributes).forEach(([k, v]) => {
      const norm = normalizeVariantAttributeKey(k);
      const val = coerceAttrValue(v);
      if (norm && val && !val.startsWith('{') && !val.startsWith('[') && !INTERNAL_VARIANT_ATTR_KEYS.has(norm)) {
        result[norm] = val;
      }
    });
  }

  // ── Alibaba SKUs bruts : sku_attr_list ──────────────────────────────
  if (Array.isArray(variant.sku_attr_list)) {
    variant.sku_attr_list.forEach((attr) => {
      if (!attr) return;
      const rawName = attr.attr_name_desc || attr.attr_name || attr.name || attr.skuPropertyName;
      const rawVal = attr.attr_value_desc || attr.attr_value || attr.value || attr.skuPropertyValueDisplayName;
      const val = coerceAttrValue(rawVal);
      if (rawName && val && !val.startsWith('{') && !val.startsWith('[')) {
        const norm = normalizeVariantAttributeKey(rawName);
        if (norm && !INTERNAL_VARIANT_ATTR_KEYS.has(norm) && !result[norm]) {
          result[norm] = val;
        }
      }
    });
  }

  return result;
}

const DIMENSION_LABELS_FR = {
  color: 'Couleur',
  size: 'Taille',
  capacity: 'Capacité',
  model: 'Modèle',
  material: 'Matériau',
  style: 'Style',
  specification: 'Option',
};

/**
 * Extrait toutes les dimensions distinctes de la liste des variantes.
 */
export function extractVariantDimensions(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return [];

  const groupsMap = new Map(); // key -> { key, label, optionsMap: Map(val -> { value, label, image }) }

  variants.forEach((v) => {
    const attrs = extractAllVariantAttributes(v);
    Object.entries(attrs).forEach(([key, val]) => {
      if (!val) return;
      if (!groupsMap.has(key)) {
        const label = DIMENSION_LABELS_FR[key] || (key.charAt(0).toUpperCase() + key.slice(1));
        groupsMap.set(key, { key, label, optionsMap: new Map() });
      }
      const group = groupsMap.get(key);
      if (!group.optionsMap.has(val)) {
        const image = getVariantAttributeImage(v, key) || (key === 'color' ? v.image : null);
        group.optionsMap.set(val, {
          value: val,
          label: val,
          image,
        });
      }
    });
  });

  return Array.from(groupsMap.values()).map((g) => ({
    key: g.key,
    label: g.label,
    options: Array.from(g.optionsMap.values()),
  }));
}

/**
 * Trouve l'index du variant le plus proche des critères sélectionnés
 */
export function findBestMatchingVariant(variants = [], selectedMap = {}) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) return -1;

  const entries = Object.entries(selectedMap).filter(([k, v]) => Boolean(v));
  if (!entries.length) return 0;

  // 1. Correspondance exacte sur tous les critères
  const exactIdx = list.findIndex((v) => {
    return entries.every(([key, val]) => {
      const vVal = getVariantAttributeValue(v, key);
      return vVal && vVal.toLowerCase() === String(val).trim().toLowerCase();
    });
  });
  if (exactIdx >= 0) return exactIdx;

  // 2. Meilleur score
  let bestIdx = 0;
  let bestScore = -1;

  list.forEach((v, idx) => {
    let score = 0;
    entries.forEach(([key, val]) => {
      const vVal = getVariantAttributeValue(v, key);
      if (vVal && vVal.toLowerCase() === String(val).trim().toLowerCase()) {
        score += key === 'color' ? 3 : key === 'size' ? 2 : 1;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  });

  return bestIdx;
}

/**
 * Rétro-compatibilité avec les tests unitaires existants
 */
export function resolveVariantSelection(variants, selectedColor = null, selectedSize = null) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) {
    return { index: -1, color: selectedColor ?? null, size: selectedSize ?? null, variant: null };
  }

  const selectedMap = {};
  if (selectedColor) selectedMap.color = selectedColor;
  if (selectedSize) selectedMap.size = selectedSize;

  const matchedIndex = findBestMatchingVariant(list, selectedMap);
  const matchedVariant = list[matchedIndex] || list[0];

  return {
    index: matchedIndex >= 0 ? matchedIndex : 0,
    color: selectedColor || null,
    size: selectedSize || null,
    variant: matchedVariant,
  };
}
