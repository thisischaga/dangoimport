import { buildProductDetailData, sanitizeAlibabaHtml, extractCleanProse } from './buildProductDetailData';

describe('buildProductDetailData', () => {
  it('correctly handles an Alibaba product with colors, sizes, and price tiers', () => {
    const raw = {
      _id: 'ali-101',
      name: 'Chaussures Sneakers Sport Usine',
      isAlibaba: true,
      price: 15000,
      stock: 0,
      minimumOrderQuantity: 2,
      quantityIncrement: 2,
      publicPriceTiers: [
        { minQuantity: 2, maxQuantity: 9, unitPrice: 15000, currency: 'XOF' },
        { minQuantity: 10, maxQuantity: 49, unitPrice: 13500, currency: 'XOF' },
        { minQuantity: 50, maxQuantity: null, unitPrice: 12000, currency: 'XOF' },
      ],
      packaging: {
        weight: '0.8',
        packageSize: '30x20x12 cm',
        unit: 'Paire',
      },
      wholesale: {
        minOrderQuantity: 2,
        unitType: 'Paire',
        handlingTimeDays: 5,
        deliverPeriods: [{ quantity: 100, processPeriodDays: 7 }],
      },
      variants: [
        { name: 'Noir / 42', price: 15000, stock: 0, attributes: { color: 'Noir', size: '42' } },
        { name: 'Blanc / 43', price: 15000, stock: 0, attributes: { color: 'Blanc', size: '43' } },
      ],
      specifications: [
        { key: 'Matériau supérieur', value: 'Mesh respirant' },
        { key: 'Semelle', value: 'Caoutchouc amortissant' },
      ],
      images: [
        { url: 'https://example.com/shoes-1.jpg' },
        { url: 'https://example.com/shoes-2.jpg' },
      ],
    };

    const data = buildProductDetailData(raw);

    expect(data.isAlibaba).toBe(true);
    expect(data.stockStatusLabel).toBe('Sur commande · Fabrication directe usine');
    expect(data.inStock).toBe(true);
    expect(data.publicPriceTiers.length).toBe(3);
    expect(data.publicPriceTiers[0].label).toBe('2 à 9 unités');
    expect(data.publicPriceTiers[0].unitPriceFormatted).toContain('15');
    expect(data.publicPriceTiers[0].unitPriceFormatted).toContain('XOF');
    expect(data.publicPriceTiers[1].savingsPercent).toBe(10);
    expect(data.specifications.some((s) => s.key === 'Matériau supérieur')).toBe(true);
    expect(data.specifications.some((s) => s.key === 'Poids brut')).toBe(true);
    expect(data.packaging.packageSize).toBe('30x20x12 cm');
    expect(data.wholesale.handlingTimeDays).toBe(5);
  });

  it('keeps Alibaba stock at a real value instead of inventing a 999 fallback', () => {
    const raw = {
      _id: 'ali-102',
      name: 'Sac de voyage étanche',
      isAlibaba: true,
      price: 18000,
      stock: 2147483647,
      variants: [
        { name: 'Modèle unique', price: 18000, stock: 2147483647 },
      ],
    };

    const data = buildProductDetailData(raw);

    expect(data.isAlibaba).toBe(true);
    expect(data.inStock).toBe(true);
    expect(data.stockStatusLabel).toBe('Sur commande · Fabrication directe usine');
    expect(data.stock).toBe(2147483647);
  });

  it('correctly handles local seller product with confirmed stock', () => {
    const raw = {
      _id: 'local-101',
      name: 'Robe Wax Lomé',
      sourceType: 'LOCAL_SELLER',
      vendorName: 'Boutique Afi',
      price: 12000,
      stock: 3,
      minStock: 5,
      deliveryZones: [{ locality: 'Lomé', price: 1000 }],
    };

    const data = buildProductDetailData(raw);

    expect(data.isAlibaba).toBe(false);
    expect(data.isDropship).toBe(false);
    expect(data.isLowStock).toBe(true);
    expect(data.stockStatusLabel).toBe('Stock limité · 3 restants');
    expect(data.deliveryZones.length).toBe(1);
    expect(data.sellerName).toBe('Boutique Afi');
  });

  it('correctly sanitizes and strips dangerous or broken HTML from descriptions', () => {
    const dangerousHtml = `
      <style>#detail_decorate_root { background: red; }</style>
      <script>alert('xss')</script>
      <div class="magic-1" style="font-size: 18px;" onclick="doBad()">
        <p>Magnifique montre connectée étanche avec suivi cardiaque.</p>
      </div>
    `;

    const cleanedHtml = sanitizeAlibabaHtml(dangerousHtml);
    expect(cleanedHtml).not.toContain('<script');
    expect(cleanedHtml).not.toContain('<style');
    expect(cleanedHtml).not.toContain('onclick');
    expect(cleanedHtml).not.toContain('#detail_decorate_root');
    expect(cleanedHtml).toContain('Magnifique montre connectée étanche');

    const prose = extractCleanProse(dangerousHtml);
    expect(prose).toContain('Magnifique montre connectée étanche avec suivi cardiaque.');
  });

  it('handles missing images gracefully without crashing and merges variant images', () => {
    const raw = {
      _id: 'img-101',
      name: 'Produit sans galerie',
      variants: [
        { name: 'Bleu', image: 'https://example.com/variant-blue.jpg' },
      ],
    };

    const data = buildProductDetailData(raw);

    expect(data.images).toContain('https://example.com/variant-blue.jpg');
    expect(data.name).toBe('Produit sans galerie');
  });

  it('correctly extracts rich Alibaba payload data (keyAttributes, ladder_price, warranty, supplier)', () => {
    const raw = {
      _id: '6aeb2e5721f510f2fa306a0b',
      name: 'KYT 60W USB-C Cable',
      source: 'ALIBABA',
      price: 341,
      rawPayload: {
        result_data: {
          supplier: 'Shenzhen Keyuantai Industry Co., Ltd.',
          mode_id: 'KYT-830',
          keyAttributes: {
            attributes: [
              {
                type: 'Industry-specific attributes',
                attributes: [
                  { name: 'connectors', values: [{ value: 'USB 3.0 Connector' }] },
                  { name: 'function', values: [{ value: '3A Fast Charging' }] },
                  { name: 'material', values: [{ value: 'Nylon' }, { value: 'TPE' }] },
                  { name: 'usb type', values: [{ value: 'type-c to type-c' }] },
                ],
              },
              {
                type: 'Other attributes',
                attributes: [
                  { name: 'conductor', values: [{ value: 'Pure Copper' }] },
                  { name: 'Warranty', values: [{ value: '24 moths' }] },
                ],
              },
              {
                type: 'Packaging and delivery',
                attributes: [
                  { name: 'Single package size:', values: [{ value: '3X3X2 cm' }] },
                  { name: 'Single gross weight:', values: [{ value: '0.100 KG' }] },
                ],
              },
            ],
          },
          skus: [
            {
              ladder_price: [
                { min_quantity: 1000, max_quantity: 2999, price: 0.51, currency: 'USD' },
                { min_quantity: 3000, max_quantity: 4999, price: 0.48, currency: 'USD' },
                { min_quantity: 5000, max_quantity: 9999, price: 0.45, currency: 'USD' },
                { min_quantity: 10000, max_quantity: -1, price: 0.40, currency: 'USD' },
              ],
            },
          ],
        },
      },
    };

    const data = buildProductDetailData(raw);

    expect(data.isAlibaba).toBe(true);
    expect(data.publicPriceTiers.length).toBe(4);
    expect(data.publicPriceTiers[0].label).toContain('1\u202f000');
    expect(data.specifications.some((s) => s.key === 'Connecteurs' && s.value === 'USB 3.0 Connector')).toBe(true);
    expect(data.specifications.some((s) => s.key === 'Conducteur interne' && s.value === 'Cuivre pur')).toBe(true);
    expect(data.specifications.some((s) => s.key === 'Garantie usine' && s.value === '24 mois')).toBe(true);
    expect(data.packaging.weightKg).toBe(0.1);
    expect(data.packaging.packageSize).toBe('3X3X2 cm');
    expect(data.modelNumber).toBe('KYT-830');
    expect(data.supplierName).toBe('Shenzhen Keyuantai Industry Co., Ltd.');
  });
});
