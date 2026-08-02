import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import { useProductsCatalog } from '../hooks/useProducts';

export default function NewArrivals() {
  const { data: products = [] } = useProductsCatalog({ limit: 48 });
  const arrivals = products.filter((product) => product?.isNewArrival);

  return (
    <div>
      <PageHeader title="Nouveautés" subtitle="Découvrez les produits récemment publiés par nos vendeurs." breadcrumbs={[{label:'Accueil', to:'/'},{label:'Nouveautés'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} />
      </main>
    </div>
  );
}
