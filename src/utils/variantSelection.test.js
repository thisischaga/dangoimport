import { resolveVariantSelection, normalizeVariantAttributeKey } from './variantSelection';

describe('variantSelection', () => {
  it('normalizes color and size keys case-insensitively', () => {
    expect(normalizeVariantAttributeKey('Couleur')).toBe('color');
    expect(normalizeVariantAttributeKey('Taille')).toBe('size');
    expect(normalizeVariantAttributeKey('pointure')).toBe('size');
  });

  it('selects the matching variant for a valid color-size combination', () => {
    const variants = [
      { name: 'Noir / S', attributes: { couleur: 'Noir', taille: 'S' } },
      { name: 'Noir / M', attributes: { couleur: 'Noir', taille: 'M' } },
      { name: 'Blanc / S', attributes: { couleur: 'Blanc', taille: 'S' } },
    ];

    expect(resolveVariantSelection(variants, 'Noir', 'M')).toEqual({
      index: 1,
      color: 'Noir',
      size: 'M',
      variant: variants[1],
    });
  });

  it('falls back to the first valid variant when only one attribute is selected', () => {
    const variants = [
      { name: 'Noir / S', attributes: { couleur: 'Noir', taille: 'S' } },
      { name: 'Blanc / S', attributes: { couleur: 'Blanc', taille: 'S' } },
    ];

    expect(resolveVariantSelection(variants, 'Blanc')).toEqual({
      index: 1,
      color: 'Blanc',
      size: null,
      variant: variants[1],
    });
  });
});
