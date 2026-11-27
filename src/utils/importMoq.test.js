import {
  extractRealProductMoq,
  getMoqRules,
  getPublicPriceRange,
  snapQuantity,
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

  it('uses the supplier MOQ consistently for Alibaba products', () => {
    expect(extractRealProductMoq({
      isAlibaba: true,
      minimumOrderQuantity: 12,
    })).toBe(12);

    const withoutSupplierMoq = { isAlibaba: true, price: 100, weight: 0.1 };
    expect(getMoqRules(withoutSupplierMoq).moq).toBe(1);
    expect(extractRealProductMoq(withoutSupplierMoq)).toBe(1);

    const supplierMoq = {
      isAlibaba: true,
      source: 'ALIBABA',
      minimumOrderQuantity: 6,
      quantityIncrement: 1,
      price: 100,
      weight: 0.1,
    };
    expect(getMoqRules(supplierMoq)).toMatchObject({ moq: 6, increment: 1 });
    expect(snapQuantity(supplierMoq, 2)).toBe(6);
    expect(snapQuantity(supplierMoq, 7)).toBe(7);
    expect(snapQuantity({ ...supplierMoq, stock: 7 }, 20)).toBe(20);
    expect(extractRealProductMoq({
      source: 'ALIBABA',
      rawPayload: { result_data: { wholesale_trade: { min_order_quantity: 9 } } },
    })).toBe(9);
  });
});
