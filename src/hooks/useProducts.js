import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const API = API_BASE_URL;

function normalizeProducts(payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : [];

  return list.filter((item) => item && typeof item === 'object' && (item._id || item.id || item.slug || item.name));
}

function normalizeSingleProduct(payload) {
  if (!payload) return null;
  if (typeof payload === 'object' && payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/featured`, { timeout: 15000 });
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useProductsCatalog({ search, limit = 200 } = {}) {
  return useQuery({
    queryKey: ['products', 'catalog', { search: search || '', limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), page: '1' });
      if (search) params.set('search', search);
      const res = await axios.get(`${API}/api/products?${params}`, { timeout: 15000 });
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/${id}`, { timeout: 15000 });
      return normalizeSingleProduct(res.data);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useSimilarProducts(id) {
  return useQuery({
    queryKey: ['products', 'similar', id],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/similar/${id}`);
      return normalizeProducts(res.data);
    },
    enabled: !!id,
  });
}

export function useVendorProducts(vendorName) {
  return useQuery({
    queryKey: ['products', 'vendor', vendorName],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/vendor/${encodeURIComponent(vendorName)}`);
      return normalizeProducts(res.data);
    },
    enabled: !!vendorName,
  });
}
