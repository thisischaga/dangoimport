import React, { useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';

export default function TopSellers() {
  const { data: rawProducts = [], isLoading, refetch } = useProductsCatalog({
    limit: 100,
  });

  const products = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) return [];
    return [...rawProducts].sort((a, b) => {
      const salesA = Number(a?.soldCount || a?.sales || a?.totalSold || 0);
      const salesB = Number(b?.soldCount || b?.sales || b?.totalSold || 0);
      if (salesB !== salesA) return salesB - salesA;
      const ratingA = Number(a?.rating || a?.averageRating || 0);
      const ratingB = Number(b?.rating || b?.averageRating || 0);
      return ratingB - ratingA;
    });
  }, [rawProducts]);

  return (
    <div>
      <PageHeader
        title="Meilleures ventes"
        subtitle="Les produits les plus achetés par nos clients."
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Meilleures ventes' }]}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} loading={isLoading} onRefresh={refetch} />
      </main>
    </div>
  );
}
