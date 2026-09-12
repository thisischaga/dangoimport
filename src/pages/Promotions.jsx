import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';

export default function Promotions() {
  const { data: products = [], isLoading, refetch } = useProductsCatalog({ limit: 48, promo: true });

  return (
    <div>
      <PageHeader title="Promotions" subtitle="Profitez des meilleures offres et réductions du moment." breadcrumbs={[{label:'Accueil', to:'/'},{label:'Promotions'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} loading={isLoading} onRefresh={refetch} />
      </main>
    </div>
  );
}
