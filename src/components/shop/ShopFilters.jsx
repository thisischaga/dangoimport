import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'promo', label: 'Promotions' },
  { value: 'name-asc', label: 'Nom A → Z' },
  { value: 'name-desc', label: 'Nom Z → A' },
];

function ShopFilters({
  searchInput,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStock,
  onInStockChange,
  promoOnly,
  onPromoOnlyChange,
  newOnly,
  onNewOnlyChange,
  onReset,
  totalItems,
  mobileOpen,
  onMobileToggle,
}) {
  const hasActiveFilters =
    Boolean(category) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    promoOnly ||
    newOnly;

  return (
    <aside className="shop-filters">
      <div className="shop-filters__toolbar">
        <div className="shop-filters__search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Rechercher dans cette boutique…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Rechercher un produit dans la boutique"
          />
          {searchInput ? (
            <button
              type="button"
              className="shop-filters__clear-input"
              onClick={() => onSearchChange('')}
              aria-label="Effacer la recherche"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className="shop-filters__sort-wrap">
          <label htmlFor="shop-sort" className="shop-filters__sort-label">
            Trier par
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="shop-filters__mobile-toggle"
          onClick={onMobileToggle}
          aria-expanded={mobileOpen}
        >
          <SlidersHorizontal size={16} />
          Filtres
          {hasActiveFilters ? <span className="shop-filters__dot" /> : null}
        </button>
      </div>

      <div className={`shop-filters__panel ${mobileOpen ? 'is-open' : ''}`}>
        <div className="shop-filters__panel-head">
          <h2>Filtres</h2>
          {hasActiveFilters ? (
            <button type="button" onClick={onReset} className="shop-filters__reset">
              Réinitialiser
            </button>
          ) : null}
        </div>

        <div className="shop-filters__group">
          <h3>Catégories</h3>
          <div className="shop-filters__chips">
            <button
              type="button"
              className={`shop-chip ${!category ? 'is-active' : ''}`}
              onClick={() => onCategoryChange('')}
            >
              Toutes les catégories
            </button>
            {(categories || []).map((c) => (
              <button
                key={c}
                type="button"
                className={`shop-chip ${category === c ? 'is-active' : ''}`}
                onClick={() => onCategoryChange(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-filters__group">
          <h3>Prix (FCFA)</h3>
          <div className="shop-filters__price-row">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              aria-label="Prix minimum"
            />
            <span aria-hidden>—</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              aria-label="Prix maximum"
            />
          </div>
        </div>

        <div className="shop-filters__group">
          <h3>Disponibilité &amp; offres</h3>
          <label className="shop-check">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => onInStockChange(e.target.checked)}
            />
            <span>En stock uniquement</span>
          </label>
          <label className="shop-check">
            <input
              type="checkbox"
              checked={promoOnly}
              onChange={(e) => onPromoOnlyChange(e.target.checked)}
            />
            <span>Promotions</span>
          </label>
          <label className="shop-check">
            <input
              type="checkbox"
              checked={newOnly}
              onChange={(e) => onNewOnlyChange(e.target.checked)}
            />
            <span>Nouveautés</span>
          </label>
        </div>

        {typeof totalItems === 'number' ? (
          <p className="shop-filters__count">
            {totalItems} résultat{totalItems > 1 ? 's' : ''}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

export default React.memo(ShopFilters);
