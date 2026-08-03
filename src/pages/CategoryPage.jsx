import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import client from '../apiClient';
import ProductGrid from '../components/product/ProductGrid';

async function fetchCategory(slug) {
  const res = await client.get(`/categories/${slug}`);
  return res.data.data;
}

async function fetchCategoryProducts(slug, page = 1, limit = 20, q = {}) {
  const params = new URLSearchParams({ page, limit, ...q });
  const res = await client.get(`/categories/${slug}/products?${params.toString()}`);
  return res.data;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { data: cat, isLoading: loadingCat } = useQuery({ queryKey: ['category', slug], queryFn: () => fetchCategory(slug), enabled: !!slug });
  const { data: productsResp, isLoading: loadingProducts } = useQuery({ queryKey: ['categoryProducts', slug], queryFn: () => fetchCategoryProducts(slug, 1, 24), enabled: !!slug });

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loadingCat ? <h1>Chargement...</h1> : (
          <header className="mb-6">
            <h1 className="text-3xl font-bold">{cat.name}</h1>
            <p className="text-sm text-slate-600">{cat.description}</p>
            <p className="text-xs text-slate-500 mt-1">{cat.productCount ?? 0} produits</p>
          </header>
        )}

        <section>
          <ProductGrid products={productsResp?.data || []} loading={loadingProducts} />
        </section>
      </div>
    </div>
  );
}
