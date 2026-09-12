import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';

export default function TopSellers() {
  const { data: products = [], isLoading, refetch } = useProductsCatalog({
    limit: 48,
    bestSeller: true,
    sort: 'popular',
  });

  return (
    <div>
      <PageHeader title="Meilleures ventes" subtitle="Les produits les plus achetés par nos clients." breadcrumbs={[{label:'Accueil', to:'/'},{label:'Meilleures ventes'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} loading={isLoading} onRefresh={refetch} />
      </main>
    </div>
  );
}
