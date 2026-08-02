import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';

export default function TopSellers() {
  const { data: products = [] } = useProductsCatalog({ limit: 120 });
  const bestSellers = products
    .filter((product) => product?.isBestSeller || Number(product?.soldCount ?? 0) > 0)
    .sort((a, b) => {
      const soldA = Number(a?.soldCount ?? 0);
      const soldB = Number(b?.soldCount ?? 0);
      if (soldB !== soldA) return soldB - soldA;
      return (b?.isBestSeller ? 1 : 0) - (a?.isBestSeller ? 1 : 0);
    })
    .slice(0, 48);

  return (
    <div>
      <PageHeader title="Meilleures ventes" subtitle="Les produits les plus achetés par nos clients." breadcrumbs={[{label:'Accueil', to:'/'},{label:'Meilleures ventes'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} />
      </main>
    </div>
  );
}
