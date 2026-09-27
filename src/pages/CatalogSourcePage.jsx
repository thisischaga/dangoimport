import React, { useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';
import { isCjCatalogProduct, isMarketplaceProduct } from '../utils/publicProduct';

const PRESETS = {
  import: {
    title: 'À importer',
    subtitle: 'Produits sourcés via CJdropshipping, importés puis vendus par Dango Import.',
    empty: 'Aucun produit à importer n’est publié pour le moment.',
    filter: isCjCatalogProduct,
  },
  marketplace: {
    title: 'Marketplace',
    subtitle: 'Produits proposés par les vendeurs locaux de la marketplace Dango Import.',
    empty: 'Aucun produit marketplace n’est publié pour le moment.',
    filter: isMarketplaceProduct,
  },
};

export default function CatalogSourcePage({ mode = 'import' }) {
  const preset = PRESETS[mode] || PRESETS.import;
  const { data: products = [], isLoading, refetch } = useProductsCatalog({ limit: 100 });

  const filtered = useMemo(
    () => (products || []).filter(preset.filter),
    [products, preset],
  );

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <Header />
      <PageHeader
        title={preset.title}
        subtitle={preset.subtitle}
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: preset.title }]}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isLoading && filtered.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
            {preset.empty}
          </p>
        ) : (
          <ProductGrid products={filtered} loading={isLoading} onRefresh={refetch} />
        )}
      </main>
      <Footer />
    </div>
  );
}
