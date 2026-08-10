import React, { useMemo } from 'react';

function ProductVariants({
  product,
  selectedVariantIndex,
  onSelectVariant,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
}) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const colors = Array.isArray(product?.color) ? product.color.filter(Boolean) : [];
  const sizes = Array.isArray(product?.size) ? product.size.filter(Boolean) : [];

  const variantGroups = useMemo(() => {
    if (variants.length === 0) return null;
    const attrKeys = new Set();
    variants.forEach((v) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((k) => attrKeys.add(k));
    });
    if (attrKeys.size === 0) return null;
    return Array.from(attrKeys).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      options: [...new Set(variants.map((v) => v.attributes?.[key]).filter(Boolean))],
    }));
  }, [variants]);

  const hasVariants = variants.length > 0;
  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;

  if (!hasVariants && !hasColors && !hasSizes) return null;

  return (
    <div className="product-variants">
      {hasVariants && !variantGroups && (
        <div className="product-variants__group">
          <p className="product-variants__label">Modèle</p>
          <div className="product-variants__options">
            {variants.map((v, i) => {
              const label = v.name || v.sku || `Option ${i + 1}`;
              const out = Number(v.stock ?? 0) <= 0;
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

      {variantGroups?.map(({ key, label, options }) => (
        <div key={key} className="product-variants__group">
          <p className="product-variants__label">{label}</p>
          <div className="product-variants__options">
            {options.map((opt) => (
              <button key={opt} type="button" className="product-variants__chip">
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {hasColors && (
        <div className="product-variants__group">
          <p className="product-variants__label">Couleur</p>
          <div className="product-variants__options">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`product-variants__chip ${selectedColor === c ? 'is-selected' : ''}`}
                onClick={() => onSelectColor?.(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div className="product-variants__group">
          <p className="product-variants__label">Taille</p>
          <div className="product-variants__options">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`product-variants__chip ${selectedSize === s ? 'is-selected' : ''}`}
                onClick={() => onSelectSize?.(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ProductVariants);
