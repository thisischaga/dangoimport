import React, { useMemo } from 'react';
import {
  extractVariantDimensions,
  getVariantAttributeValue,
  resolveColorStyle,
} from '../../../utils/variantSelection';

function cleanLabel(raw) {
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

function ProductVariants({
  product,
  selectedVariantIndex,
  onSelectVariant,
  selectedAttributes = {},
  onSelectAttribute,
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

  // Extrait les dimensions dynamiques (Couleur, Taille, Capacité, etc.)
  const dimensions = useMemo(() => extractVariantDimensions(variants), [variants]);

  // Variant actif actuel
  const activeVariant = selectedVariantIndex != null && variants[selectedVariantIndex]
    ? variants[selectedVariantIndex]
    : variants[0] || null;

  // Détermine la valeur sélectionnée pour une dimension
  const getSelectedValue = (groupKey) => {
    if (selectedAttributes[groupKey]) return selectedAttributes[groupKey];
    if (groupKey === 'color' && selectedColor) return selectedColor;
    if (groupKey === 'size' && selectedSize) return selectedSize;
    if (activeVariant) {
      const vVal = getVariantAttributeValue(activeVariant, groupKey);
      if (vVal) return vVal;
    }
    return '';
  };

  const handlePickOption = (groupKey, value) => {
    if (groupKey === 'color' && onSelectColor) onSelectColor(value);
    if (groupKey === 'size' && onSelectSize) onSelectSize(value);
    if (onSelectAttribute) {
      onSelectAttribute(groupKey, value);
    } else if (onSelectVariant) {
      // Fallback si onSelectAttribute n'est pas passé
      const matchIdx = variants.findIndex((v) => {
        const vVal = getVariantAttributeValue(v, groupKey);
        return vVal && vVal.toLowerCase() === String(value).toLowerCase();
      });
      if (matchIdx >= 0) onSelectVariant(matchIdx);
    }
  };

  if (!variants || (variants.length <= 1 && dimensions.length === 0)) {
    return null;
  }

  // Si aucune dimension n'a pu être extraite des attributs, afficher la liste des variantes sous forme de modèles
  if (dimensions.length === 0 && variants.length > 1) {
    return (
      <div className="product-variants">
        <div className="product-variants__group">
          <div className="product-variants__header">
            <span className="product-variants__label">Modèle</span>
            {activeVariant && (
              <span className="product-variants__current-value">
                {cleanLabel(activeVariant.name) || activeVariant.sku || `Option ${(selectedVariantIndex || 0) + 1}`}
              </span>
            )}
          </div>
          <div className="product-variants__options">
            {variants.map((v, i) => {
              const label = cleanLabel(v.name) || v.sku || `Option ${i + 1}`;
              const isSelected = selectedVariantIndex === i;
              const isOut = Number(v.stock ?? 0) <= 0 && !isAlibaba;
              return (
                <button
                  key={v._id || v.skuId || v.sku || i}
                  type="button"
                  className={`product-variants__chip ${isSelected ? 'is-selected' : ''} ${isOut ? 'is-disabled' : ''}`}
                  onClick={() => !isOut && onSelectVariant?.(i)}
                  disabled={isOut}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-variants">
      {dimensions.map((group) => {
        const currentVal = getSelectedValue(group.key);
        const isColorGroup = group.key === 'color';

        return (
          <div key={group.key} className="product-variants__group">
            {/* Titre du groupe + valeur active */}
            <div className="product-variants__header">
              <span className="product-variants__label">{group.label}</span>
              {currentVal && (
                <span className="product-variants__current-value">
                  : <strong>{currentVal}</strong>
                </span>
              )}
            </div>

            {/* 1. Affichage en RONDS pour la couleur */}
            {isColorGroup ? (
              <div className="product-variants__color-row" role="radiogroup" aria-label="Choisir une couleur">
                {group.options.map((opt) => {
                  const isSelected = currentVal && currentVal.toLowerCase() === opt.value.toLowerCase();
                  const colorStyle = resolveColorStyle(opt.value, opt.image);

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      title={opt.value}
                      className={`product-variants__color-dot ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handlePickOption('color', opt.value)}
                    >
                      <span
                        className={`product-variants__color-circle ${colorStyle.isLight ? 'is-light' : ''}`}
                        style={{
                          background: colorStyle.background,
                          backgroundColor: colorStyle.backgroundColor,
                        }}
                      >
                        {colorStyle.hasImage && (
                          <img
                            src={opt.image}
                            alt={opt.value}
                            className="product-variants__color-img"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {isSelected && (
                          <span className={`product-variants__check ${colorStyle.isLight ? 'is-dark' : 'is-white'}`}>
                            ✓
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* 2. Affichage en CHIPS pour la taille, capacité, modèle, etc. */
              <div className="product-variants__options">
                {group.options.map((opt) => {
                  const isSelected = currentVal && currentVal.toLowerCase() === opt.value.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`product-variants__chip ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handlePickOption(group.key, opt.value)}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(ProductVariants);
