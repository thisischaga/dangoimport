/** Prix affiché : promo si valide, sinon prix normal */
export function getEffectivePrice(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promo = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  if (promo > 0 && promo < price) return promo;
  return price;
}

export const DEFAULT_CATALOG_FILTERS = {
  category: '',
  sort: 'relevance',
  minPrice: '',
  maxPrice: '',
  onlyPromo: false,
  inStock: false,
  newArrival: false,
  brand: '',
  condition: '',
};

export function countActiveFilters(filters = {}) {
  let n = 0;
  if (filters.category) n += 1;
  if (filters.minPrice) n += 1;
  if (filters.maxPrice) n += 1;
  if (filters.onlyPromo) n += 1;
  if (filters.inStock) n += 1;
  if (filters.newArrival) n += 1;
  if (filters.brand) n += 1;
  if (filters.condition) n += 1;
  if (filters.sort && filters.sort !== 'relevance') n += 1;
  return n;
}

export function applyProductFilters(products, filters = {}) {
  let result = [...(products || [])];

  if (filters.category) {
    const cat = String(filters.category).toLowerCase();
    result = result.filter(
      (p) => String(p.category || '').toLowerCase() === cat
    );
  }

  const min = filters.minPrice !== '' && filters.minPrice != null
    ? parseFloat(filters.minPrice)
    : null;
  const max = filters.maxPrice !== '' && filters.maxPrice != null
    ? parseFloat(filters.maxPrice)
    : null;

  if (min != null && !Number.isNaN(min)) {
    result = result.filter((p) => getEffectivePrice(p) >= min);
  }
  if (max != null && !Number.isNaN(max)) {
    result = result.filter((p) => getEffectivePrice(p) <= max);
  }

  if (filters.onlyPromo) {
    result = result.filter((p) => {
      const price = Number(p.price ?? 0);
      const promo = Number(p.promoPrice ?? p.salePrice ?? 0);
      return promo > 0 && promo < price;
    });
  }

  if (filters.inStock) {
    result = result.filter((p) => Number(p.stock ?? 0) > 0);
  }

  if (filters.newArrival) {
    result = result.filter(
      (p) => p.isNewArrival || p.isNew || p.isFeatured
    );
  }

  if (filters.brand) {
    const brand = String(filters.brand).toLowerCase();
    result = result.filter((p) =>
      String(p.brand || '').toLowerCase().includes(brand)
    );
  }

  if (filters.condition) {
    result = result.filter(
      (p) => String(p.condition || 'Neuf') === filters.condition
    );
  }

  switch (filters.sort) {
    case 'price-asc':
    case 'price_asc':
      result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
      break;
    case 'price-desc':
    case 'price_desc':
      result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
      break;
    case 'newest':
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      break;
    case 'popular':
      result.sort(
        (a, b) =>
          Number(b.totalSales ?? 0) - Number(a.totalSales ?? 0) ||
          Number(b.isBoosted) - Number(a.isBoosted)
      );
      break;
    case 'promo':
      result.sort((a, b) => {
        const da =
          a.promoPrice && a.price
            ? Math.round((1 - a.promoPrice / a.price) * 100)
            : 0;
        const db =
          b.promoPrice && b.price
            ? Math.round((1 - b.promoPrice / b.price) * 100)
            : 0;
        return db - da;
      });
      break;
    default:
      break;
  }

  return result;
}

export function buildProductQueryParams(filters = {}, searchQuery = '') {
  const params = new URLSearchParams({ limit: '100', page: '1' });
  if (searchQuery) params.set('search', searchQuery);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));

  const sortMap = {
    'price-asc': 'price-asc',
    'price-desc': 'price-desc',
    popular: 'popular',
    newest: undefined,
  };
  const apiSort = sortMap[filters.sort];
  if (apiSort) params.set('sort', apiSort);

  return params;
}
