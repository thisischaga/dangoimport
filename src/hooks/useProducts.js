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

function isApprovedStatus(product) {
  const raw = String(product?.validationStatus || product?.status || '') || '';
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return (
    normalized === 'approved' ||
    normalized === 'approuve' ||
    normalized === 'approuvee' ||
    normalized.includes('approve') ||
    normalized.includes('appr')
  );
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/featured`, { timeout: 15000 });
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false && isApprovedStatus(p));
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
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false && isApprovedStatus(p));
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
      const product = normalizeSingleProduct(res.data);
      if (!product) return null;
      if (product.isPublished === false) return null;
      if (String(product.validationStatus || '').toLowerCase() !== 'approved') return null;
      return product;
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
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false && isApprovedStatus(p));
    },
    enabled: !!id,
  });
}

export function useProductReviews(productId, { page = 1, limit = 10 } = {}) {
  return useQuery({
    queryKey: ['products', productId, 'reviews', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await axios.get(`${API}/api/products/${productId}/reviews?${params}`, {
        timeout: 15000,
      });
      const data = res.data?.data;
      const reviews = Array.isArray(data) ? data : [];
      const pagination = res.data?.pagination || {};
      return { reviews, pagination };
    },
    enabled: !!productId,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useVendorProducts(vendorName) {
  return useQuery({
    queryKey: ['products', 'vendor', vendorName],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/vendor/${encodeURIComponent(vendorName)}`);
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false && isApprovedStatus(p));
    },
    enabled: !!vendorName,
  });
}
