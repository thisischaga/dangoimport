import React, { useMemo } from 'react';
import { normalizeVariantAttributeKey } from '../../../utils/variantSelection';

const INTERNAL_VARIANT_ATTR_KEYS = new Set([
  'externalvariantid',
  'variantkey',
  'supplierpriceusd',
  'supplierpricecny',
  'vid',
  'pid',
]);

function cleanVariantLabel(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();
  str = str.replace(/^couleur\s*:\s*/i, '');
  str = str.replace(/^color\s*:\s*/i, '');
  str = str.replace(/\s*\/\s*(?:capacité|capacity)\s*:\s*/i, ' · ');
  str = str.replace(/\s*\/\s*(?:taille|size)\s*:\s*/i, ' · ');
  str = str.replace(/\s*\/\s*(?:pointure)\s*:\s*/i, ' · ');
  str = str.replace(/\s*\/\s*/g, ' · ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function readVariantAttrValue(variant, key) {
  if (!variant || !variant.attributes || typeof variant.attributes !== 'object') return null;
  const target = normalizeVariantAttributeKey(key);
  for (const [attrKey, attrValue] of Object.entries(variant.attributes)) {
    if (normalizeVariantAttributeKey(attrKey) === target) {
      const value = String(attrValue ?? '').trim();
      return value || null;
    }
  }
  return null;
}

function isOptionAvailable(variants, key, optionValue, selectedColor, selectedSize, isAlibaba = false) {
  const normalizedKey = normalizeVariantAttributeKey(key);
  const normalizedValue = String(optionValue ?? '').trim();
  if (!normalizedValue) return false;

  // Pour la couleur : toute couleur existant dans les variantes avec stock > 0 (ou sur commande Alibaba) est disponible
  if (normalizedKey === 'color') {
    return variants.some((v) => {
      const value = readVariantAttrValue(v, 'color');
      if (!value || value.toLowerCase() !== normalizedValue.toLowerCase()) return false;
      return isAlibaba || Number(v.stock ?? 0) > 0;
    });
  }

  // Pour la taille : vérifier la compatibilité avec la couleur sélectionnée
  if (normalizedKey === 'size') {
    const hasColorMatch = variants.some((v) => {
      const sVal = readVariantAttrValue(v, 'size');
      if (!sVal || sVal.toLowerCase() !== normalizedValue.toLowerCase()) return false;
      if (!isAlibaba && Number(v.stock ?? 0) <= 0) return false;
      if (!selectedColor) return true;
      const cVal = readVariantAttrValue(v, 'color');
      return !cVal || cVal.toLowerCase() === String(selectedColor).trim().toLowerCase();
    });
    if (hasColorMatch) return true;
    // Si pas de combinaison exacte avec la couleur actuelle mais la taille existe ailleurs
    return variants.some((v) => {
      const sVal = readVariantAttrValue(v, 'size');
      return sVal && sVal.toLowerCase() === normalizedValue.toLowerCase() && (isAlibaba || Number(v.stock ?? 0) > 0);
    });
  }

  // Autres attributs génériques
  return variants.some((v) => {
    const value = readVariantAttrValue(v, normalizedKey);
    return value && value.toLowerCase() === normalizedValue.toLowerCase() && (isAlibaba || Number(v.stock ?? 0) > 0);
  });
}

function ProductVariants({
  product,
  selectedVariantIndex,
  onSelectVariant,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
}) {
  const isAlibaba = Boolean(
    product?.isAlibaba ||
    product?.importSourceType === 'ALIBABA_API' ||
    product?.supplier?.platform === 'alibaba' ||
    /^alibaba:/i.test(product?.externalSourceKey || '') ||
    product?.fulfillmentPlatform === 'Alibaba' ||
    product?.supplierName === 'Alibaba'
  );

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );
  const colors = Array.isArray(product?.color) ? product.color.filter(Boolean) : [];
  const sizes = Array.isArray(product?.size) ? product.size.filter(Boolean) : [];

  const variantGroups = useMemo(() => {
    if (variants.length === 0) return null;
    const attrKeys = new Set();
    variants.forEach((v) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((k) => {
        const normalizedKey = normalizeVariantAttributeKey(k);
        if (!normalizedKey || INTERNAL_VARIANT_ATTR_KEYS.has(String(k).toLowerCase())) return;
        if (!['color', 'size'].includes(normalizedKey)) attrKeys.add(k);
      });
    });
    if (attrKeys.size === 0) return null;
    return Array.from(attrKeys).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      options: [...new Set(variants.map((v) => readVariantAttrValue(v, key)).filter(Boolean))],
    }));
  }, [variants]);

  const hasVariants = variants.length > 0;
  const hasColors = colors.length > 0 || variants.some((v) => readVariantAttrValue(v, 'color'));
  const hasSizes = sizes.length > 0 || variants.some((v) => readVariantAttrValue(v, 'size'));
  const hasOtherGroups = Array.isArray(variantGroups) && variantGroups.length > 0;
  // Afficher "Modèle" seulement si le produit n'a ni couleur, ni taille, ni autre groupe d'attributs
  const showModelGroup = hasVariants && !hasColors && !hasSizes && !hasOtherGroups;

  const renderColorOptions = (list) => list.map((c) => {
    const available = isOptionAvailable(variants, 'color', c, selectedColor, selectedSize, isAlibaba);
    return (
      <button
        key={c}
        type="button"
        className={`product-variants__chip ${selectedColor === c ? 'is-selected' : ''} ${!available ? 'is-disabled' : ''}`}
        onClick={() => onSelectColor?.(c)}
        disabled={!available && !isAlibaba}
      >
        {c}
      </button>
    );
  });

  const renderSizeOptions = (list) => list.map((s) => {
    const available = isOptionAvailable(variants, 'size', s, selectedColor, selectedSize, isAlibaba);
    return (
      <button
        key={s}
        type="button"
        className={`product-variants__chip product-variants__chip--size ${selectedSize === s ? 'is-selected' : ''} ${!available ? 'is-disabled' : ''}`}
        onClick={() => onSelectSize?.(s)}
        disabled={!available && !isAlibaba}
      >
        {s}
      </button>
    );
  });

  if (!hasVariants && !hasColors && !hasSizes) return null;

  return (
    <div className="product-variants">
      {showModelGroup && (
        <div className="product-variants__group">
          <p className="product-variants__label">Modèle</p>
          <div className="product-variants__options">
            {variants.map((v, i) => {
              const label = cleanVariantLabel(v.name) || v.sku || `Option ${i + 1}`;
              const out = Number(v.stock ?? 0) <= 0 && !isAlibaba;
              return (
                <button
                  key={v._id || v.sku || i}
                  type="button"
                  className={`product-variants__chip ${selectedVariantIndex === i ? 'is-selected' : ''} ${out ? 'is-disabled' : ''}`}
                  onClick={() => !out && onSelectVariant?.(i)}
                  disabled={out}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasColors && (
        <div className="product-variants__group">
          <p className="product-variants__label">Couleur</p>
          <div className="product-variants__options">
            {renderColorOptions([...new Set([...colors, ...variants.map((v) => readVariantAttrValue(v, 'color')).filter(Boolean)])])}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="product-variants__group">
          <p className="product-variants__label">Taille</p>
          <div className="product-variants__options">
            {renderSizeOptions([...new Set([...sizes, ...variants.map((v) => readVariantAttrValue(v, 'size')).filter(Boolean)])])}
          </div>
        </div>
      )}

      {variantGroups?.map(({ key, label, options }) => (
        <div key={key} className="product-variants__group">
          <p className="product-variants__label">{label}</p>
          <div className="product-variants__options">
            {options.map((opt) => {
              const available = isOptionAvailable(variants, key, opt, selectedColor, selectedSize, isAlibaba);
              return (
                <button
                  key={`${key}-${opt}`}
                  type="button"
                  className={`product-variants__chip ${!available ? 'is-disabled' : ''}`}
                  onClick={() => onSelectVariant?.(variants.findIndex((v) => readVariantAttrValue(v, key) === opt))}
                  disabled={!available && !isAlibaba}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ProductVariants);
