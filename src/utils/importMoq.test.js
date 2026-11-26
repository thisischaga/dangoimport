import {
  extractRealProductMoq,
  getMoqRules,
  getPublicPriceRange,
} from './importMoq';

describe('getPublicPriceRange', () => {
  it('returns the lowest and highest server-calculated tier prices', () => {
    expect(getPublicPriceRange({
      publicPriceTiers: [
        { minQuantity: 16, unitPrice: 966 },
        { minQuantity: 200, unitPrice: 885 },
        { minQuantity: 2000, unitPrice: 491 },
      ],
    })).toEqual({ min: 491, max: 966 });
  });

  it('does not show a range for missing, invalid, or identical prices', () => {
    expect(getPublicPriceRange({})).toBeNull();
    expect(getPublicPriceRange({
      publicPriceTiers: [{ minQuantity: 16, unitPrice: 966 }],
    })).toBeNull();
    expect(getPublicPriceRange({
      publicPriceTiers: [{ unitPrice: 966 }, { unitPrice: 966 }],
    })).toBeNull();
  });

  it('uses the supplier MOQ instead of a dynamically estimated MOQ', () => {
    expect(extractRealProductMoq({
      isAlibaba: true,
      minimumOrderQuantity: 12,
    })).toBe(12);

    const withoutSupplierMoq = { isAlibaba: true, price: 100, weight: 0.1 };
    expect(getMoqRules(withoutSupplierMoq).moq).toBeGreaterThan(1);
    expect(extractRealProductMoq(withoutSupplierMoq)).toBe(1);
  });
});
