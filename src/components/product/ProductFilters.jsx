import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Filter,
  Flame,
  Package,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { getCategories } from '../../api';
import {
  countActiveFilters,
  DEFAULT_CATALOG_FILTERS,
} from '../../utils/productFilters';

const CONDITION_OPTIONS = ['Neuf', 'Occasion', 'Reconditionné'];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`catalog-filters__chip shrink-0 ${active ? 'is-active' : ''}`}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, icon: Icon, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 has-[:checked]:border-[#FF6B00] has-[:checked]:bg-[#FFF4EB]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#FF6B00]"
      />
      {Icon ? <Icon size={16} className="text-[#FF6B00]" /> : null}
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </label>
  );
}

function ProductFilters({
  filters: controlledFilters,
  onFiltersChange,
  drawerOpen: drawerOpenProp,
  setDrawerOpen: setDrawerOpenProp,
  showToolbar = true,
}) {
  const [internalFilters, setInternalFilters] = useState(DEFAULT_CATALOG_FILTERS);
  const filters = controlledFilters ?? internalFilters;

  const setFilters = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(filters) : updater;
      if (!controlledFilters) setInternalFilters(next);
      onFiltersChange?.(next);
    },
    [controlledFilters, filters, onFiltersChange]
  );

  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const drawerOpen = typeof drawerOpenProp === 'boolean' ? drawerOpenProp : internalDrawerOpen;
  const setDrawerOpen =
    typeof setDrawerOpenProp === 'function' ? setDrawerOpenProp : setInternalDrawerOpen;

  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (drawerOpen) setDraft(filters);
  }, [drawerOpen, filters]);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const applyDraft = useCallback(() => {
    setFilters(draft);
    setDrawerOpen(false);
  }, [draft, setFilters, setDrawerOpen]);

  const resetAll = useCallback(() => {
    setDraft(DEFAULT_CATALOG_FILTERS);
    setFilters(DEFAULT_CATALOG_FILTERS);
  }, [setFilters]);

  const resetDraft = useCallback(() => {
    setDraft(DEFAULT_CATALOG_FILTERS);
  }, []);

  const drawer = (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120]"
          role="dialog"
          aria-modal="true"
          aria-label="Filtres produits"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                  Filtres
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  Affiner les résultats
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Catégories */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Catégories
                </h4>
                {loadingCategories ? (
                  <p className="text-sm text-slate-400">Chargement…</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      active={!draft.category}
                      onClick={() => setDraft((f) => ({ ...f, category: '' }))}
                    >
                      Toutes
                    </Chip>
                    {categories.map((cat) => {
                      const name = cat.name || cat.label || '';
                      if (!name) return null;
                      return (
                        <Chip
                          key={cat.slug || cat._id || name}
                          active={draft.category === name}
                          onClick={() =>
                            setDraft((f) => ({
                              ...f,
                              category: f.category === name ? '' : name,
                            }))
                          }
                        >
                          {name}
                          {cat.productCount != null ? (
                            <span className="ml-1 opacity-60">({cat.productCount})</span>
                          ) : null}
                        </Chip>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Prix */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Prix (FCFA)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Min"
                    value={draft.minPrice}
                    onChange={(e) =>
                      setDraft((f) => ({ ...f, minPrice: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Max"
                    value={draft.maxPrice}
                    onChange={(e) =>
                      setDraft((f) => ({ ...f, maxPrice: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Options
                </h4>
                <ToggleRow
                  label="Promotions uniquement"
                  icon={Flame}
                  checked={draft.onlyPromo}
                  onChange={(v) => setDraft((f) => ({ ...f, onlyPromo: v }))}
                />
                <ToggleRow
                  label="Nouveautés"
                  icon={Sparkles}
                  checked={draft.newArrival}
                  onChange={(v) => setDraft((f) => ({ ...f, newArrival: v }))}
                />
                <ToggleRow
                  label="En stock uniquement"
                  icon={Package}
                  checked={draft.inStock}
                  onChange={(v) => setDraft((f) => ({ ...f, inStock: v }))}
                />
              </div>

              {/* Marque & condition */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={draft.brand}
                    onChange={(e) => setDraft((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="Ex. Samsung"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    État
                  </label>
                  <select
                    value={draft.condition}
                    onChange={(e) =>
                      setDraft((f) => ({ ...f, condition: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6B00]"
                  >
                    <option value="">Tous</option>
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={resetDraft}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={applyDraft}
                className="flex-1 rounded-xl bg-[#FF6B00] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#e75b00]"
              >
                Appliquer
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!showToolbar) {
    return typeof document !== 'undefined'
      ? createPortal(drawer, document.body)
      : drawer;
  }

  return (
    <div className="catalog-filters mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="catalog-filters__panel">
        {/* Ligne 1 — tri + filtres toujours visibles */}
        <div className="catalog-filters__controls">
          <label className="catalog-filters__sort-wrap">
            <span className="catalog-filters__sort-label">Trier</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="catalog-filters__sort"
              aria-label="Trier les produits"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="catalog-filters__btn catalog-filters__btn--primary cursor-pointer"
          >
            <SlidersHorizontal size={16} />
            Filtres
            {activeCount > 0 ? (
              <span className="catalog-filters__badge">{activeCount}</span>
            ) : null}
          </button>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={resetAll}
              className="catalog-filters__btn catalog-filters__btn--ghost"
              title="Réinitialiser les filtres"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Ligne 2 — catégories */}
        <div className="catalog-filters__chips">
          <Chip
            active={!filters.category}
            onClick={() => setFilters((f) => ({ ...f, category: '' }))}
          >
            Toutes
          </Chip>
          {!loadingCategories &&
            categories.map((cat) => {
              const name = cat.name || cat.label || '';
              if (!name) return null;
              return (
                <Chip
                  key={cat.slug || cat._id || name}
                  active={filters.category === name}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      category: f.category === name ? '' : name,
                    }))
                  }
                >
                  {name}
                </Chip>
              );
            })}
        </div>
      </div>

      {typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer}
    </div>
  );
}

export default React.memo(ProductFilters);
