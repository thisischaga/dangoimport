import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const API = API_BASE_URL;

function normalizeProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/featured`);
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false);
    },
  });
}

export function useProductsCatalog({ search, limit = 200 } = {}) {
  return useQuery({
    queryKey: ['products', 'catalog', { search: search || '', limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), page: '1' });
      if (search) params.set('search', search);
      const res = await axios.get(`${API}/api/products?${params}`);
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false);
    },
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
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
