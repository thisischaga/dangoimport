import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const CATEGORIES = ['Tous', 'Vêtements', 'Électronique', 'Maison', 'Cadeaux', 'Auto', 'Nouveautés'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Recommandés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'promo', label: 'Meilleures promos' },
];
const MIN_RATINGS = [0, 3, 3.5, 4, 4.5];

function Chip({ label, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '6px 14px',
        borderRadius: '999px',
        border: active ? '1.5px solid #FF6B00' : '1.5px solid #e0e0e0',
        background: active ? '#FFF3EA' : '#fff',
        color: active ? '#FF6B00' : '#555',
        fontWeight: active ? 700 : 500,
        fontSize: '12px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      aria-pressed={active}
    >
      {label}
    </motion.button>
  );
}

function ProductFilters({ onFiltersChange }) {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeSort, setActiveSort] = useState('default');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyFreeShip, setOnlyFreeShip] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const emit = useCallback((patch) => {
    const state = {
      category: activeCategory,
      sort: activeSort,
      onlyPromo,
      onlyFreeShip,
      minRating,
      ...patch,
    };
    onFiltersChange?.(state);
  }, [activeCategory, activeSort, onlyPromo, onlyFreeShip, minRating, onFiltersChange]);

  const setCategory = (cat) => { setActiveCategory(cat); emit({ category: cat }); };
  const setSort = (s) => { setActiveSort(s); setShowSortMenu(false); emit({ sort: s }); };
  const togglePromo = () => { setOnlyPromo((v) => { emit({ onlyPromo: !v }); return !v; }); };
  const toggleFreeShip = () => { setOnlyFreeShip((v) => { emit({ onlyFreeShip: !v }); return !v; }); };
  const setRating = (r) => { setMinRating(r); emit({ minRating: r }); };

  const hasActiveFilters = activeCategory !== 'Tous' || activeSort !== 'default' || onlyPromo || onlyFreeShip || minRating > 0;

  const resetAll = () => {
    setActiveCategory('Tous');
    setActiveSort('default');
    setOnlyPromo(false);
    setOnlyFreeShip(false);
    setMinRating(0);
    onFiltersChange?.({ category: 'Tous', sort: 'default', onlyPromo: false, onlyFreeShip: false, minRating: 0 });
  };

  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #ebebeb',
        padding: '12px 0',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Row 1 — Categories + Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '8px',
          }}
        >
          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setCategory(cat)}
            />
          ))}

          {/* Spacer */}
          <div style={{ flex: 1, minWidth: '8px' }} />

          {/* Sort dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <motion.button
              onClick={() => setShowSortMenu((v) => !v)}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '999px',
                border: activeSort !== 'default' ? '1.5px solid #FF6B00' : '1.5px solid #e0e0e0',
                background: activeSort !== 'default' ? '#FFF3EA' : '#fff',
                color: activeSort !== 'default' ? '#FF6B00' : '#555',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <SlidersHorizontal size={13} />
              {SORT_OPTIONS.find((s) => s.value === activeSort)?.label}
              <ChevronDown size={12} />
            </motion.button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                    background: '#fff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    minWidth: '180px',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: activeSort === opt.value ? '#FFF3EA' : 'transparent',
                        color: activeSort === opt.value ? '#FF6B00' : '#333',
                        fontWeight: activeSort === opt.value ? 700 : 500,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2 — Quick filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label="🔥 Promos"
            active={onlyPromo}
            onClick={togglePromo}
          />
          <Chip
            label="🚚 Livraison gratuite"
            active={onlyFreeShip}
            onClick={toggleFreeShip}
          />

          {/* Min rating */}
          {[3, 4, 4.5].map((r) => (
            <Chip
              key={r}
              label={`⭐ ${r}+`}
              active={minRating === r}
              onClick={() => setRating(minRating === r ? 0 : r)}
            />
          ))}

          {/* Reset */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={resetAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1.5px solid #ffb3b3',
                background: '#fff1f1',
                color: '#FF4747',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <X size={11} />
              Réinitialiser
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductFilters);
