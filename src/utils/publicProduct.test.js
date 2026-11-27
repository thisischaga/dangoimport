import {
  isAlibabaProduct,
  getProductSellableStock,
  sanitizeProductForDisplay,
  extractAlibabaDisplayInfo,
} from './publicProduct';

describe('publicProduct Alibaba utilities', () => {
  it('correctly detects Alibaba products through all flag variations', () => {
    expect(isAlibabaProduct({ isAlibaba: true })).toBe(true);
    expect(isAlibabaProduct({ fulfillmentPlatform: 'Alibaba' })).toBe(true);
    expect(isAlibabaProduct({ supplier: { platform: 'alibaba' } })).toBe(true);
    expect(isAlibabaProduct({ importSourceType: 'ALIBABA_API' })).toBe(true);
    expect(isAlibabaProduct({ externalSourceKey: 'alibaba:1601635137534' })).toBe(true);
    expect(isAlibabaProduct({ source: 'ALIBABA', sourceProductId: 'abc123' })).toBe(true);
    expect(isAlibabaProduct({ rawAlibabaData: { source: 'ALIBABA' }, sourceType: 'DROPSHIPPING' })).toBe(true);
    expect(isAlibabaProduct({ vendorName: 'Local Vendor', sourceType: 'LOCAL_SELLER' })).toBe(false);
  });

  it('does not expose Alibaba supplier inventory as storefront stock', () => {
    const aliProduct = { isAlibaba: true, stock: 0 };
    expect(getProductSellableStock(aliProduct)).toBe(0);

    const aliProductWithStock = { isAlibaba: true, stock: 15 };
    expect(getProductSellableStock(aliProductWithStock)).toBe(0);
    expect(getProductSellableStock({
      isAlibaba: true,
      variants: [{ stock: 7 }, { stock: 11 }],
    })).toBe(0);
  });

  it('does not fabricate a client price from supplier pricing when the server sale price is missing', () => {
    const rawAli = {
      isAlibaba: true,
      sourcePriceTiers: [{ minQty: 1, price: 10, currency: 'USD' }],
    };

    expect(sanitizeProductForDisplay(rawAli).price).toBeUndefined();
    expect(sanitizeProductForDisplay({ ...rawAli, price: 13500 }).price).toBe(13500);
  });

  it('sanitizes Alibaba product, deriving color and size arrays from variant attributes', () => {
    const rawAli = {
      _id: 'prod123',
      name: 'Sneakers Nike Air',
      isAlibaba: true,
      stock: 0,
      variants: [
        {
          name: 'Blanc / 42',
          stock: 17,
          attributes: {
            color: 'Blanc',
            size: '42',
          },
        },
        {
          name: 'Noir / 43',
          stock: 9,
          attributes: {
            Couleur: 'Noir',
            Taille: '43',
          },
        },
      ],
    };

    const sanitized = sanitizeProductForDisplay(rawAli);
    expect(sanitized.isAlibaba).toBe(true);
    expect(sanitized.stock).toBe(0);
    expect(sanitized.color).toEqual(['Blanc', 'Noir']);
    expect(sanitized.size).toEqual(['42', '43']);
    expect(sanitized.variants[0].stock).toBe(0);
    expect(sanitized.variants[1].stock).toBe(0);
  });

  it('reads Alibaba supplier metadata from the canonical rawAlibabaData payload', () => {
    const info = extractAlibabaDisplayInfo({
      rawAlibabaData: {
        detailUrl: 'https://www.alibaba.com/product-detail/123.html',
        supplier: 'Alibaba Trade',
        shipFromCountryName: 'Chine',
        skus: [
          {
            sku_id: 'SKU-1',
            ladder_price: [{ min_quantity: 10, price: 12.5 }],
          },
        ],
      },
    });

    expect(info.detailUrl).toBe('https://www.alibaba.com/product-detail/123.html');
    expect(info.supplierName).toBe('Alibaba Trade');
    expect(info.shipFrom).toBe('Chine');
    expect(info.hasLadderPrices).toBe(true);
    expect(info.skus[0].skuId).toBe('SKU-1');
  });

  it('unwraps single-item Alibaba arrays before reading payload fields', () => {
    const wrapped = {
      rawAlibabaData: [{
        source: 'ALIBABA',
        images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
        description: '<p>Produit Alibaba authentique</p>',
        keyAttributes: {
          attributes: [{ attr_name_desc: 'Matériau', attr_value_desc: 'Coton' }],
        },
      }],
      description: '',
      variants: [],
      stock: 0,
    };

    const sanitized = sanitizeProductForDisplay(wrapped);

    expect(isAlibabaProduct(sanitized)).toBe(true);
    expect(sanitized.images).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    expect(sanitized.description).toContain('Produit Alibaba authentique');
    expect(sanitized.specifications[0]).toMatchObject({ key: 'Matériau', value: 'Coton' });
  });
});
