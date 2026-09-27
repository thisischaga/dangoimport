import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { sanitizeProductForDisplay, sanitizeProductsForDisplay } from '../utils/publicProduct';

const API = API_BASE_URL;

function normalizeProducts(payload) {
  const list = Array.isArray(payload)
    ? payload
    : payload?.data && Array.isArray(payload.data)
      ? payload.data
      : [];

  return list.filter((item) => item && typeof item === 'object' && (item._id || item.id || item.slug || item.name))
    .map(sanitizeProductForDisplay);
}

function normalizeSingleProduct(payload) {
  if (!payload) return null;
  if (typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
    return sanitizeProductForDisplay(payload.data);
  }
  return sanitizeProductForDisplay(payload);
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

function isHiddenPublicStatus(product) {
  const raw = String(product?.validationStatus || product?.status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return ['rejected', 'disabled', 'draft', 'archived'].includes(raw);
}

function isPubliclyVisibleProduct(product) {
  if (!product) return false;
  if (product.isPublished === false) return false;
  if (isHiddenPublicStatus(product)) return false;
  const raw = String(product.validationStatus || product.status || '').trim();
  if (!raw) return true;
  return isApprovedStatus(product) || !isHiddenPublicStatus(product);
}

function isHiddenPublicStatus(product) {
  const raw = String(product?.validationStatus || product?.status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return ['rejected', 'disabled', 'draft', 'archived'].includes(raw);
}

function isPubliclyVisibleProduct(product) {
  if (!product) return false;
  if (product.isPublished === false) return false;
  if (isHiddenPublicStatus(product)) return false;
  const raw = String(product.validationStatus || product.status || '').trim();
  if (!raw) return true;
  return isApprovedStatus(product) || !isHiddenPublicStatus(product);
}

function isHiddenPublicStatus(product) {
  const raw = String(product?.validationStatus || product?.status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return ['rejected', 'disabled', 'draft', 'archived'].includes(raw);
}

function isPubliclyVisibleProduct(product) {
  if (!product) return false;
  if (product.isPublished === false) return false;
  if (isHiddenPublicStatus(product)) return false;
  const raw = String(product.validationStatus || product.status || '').trim();
  if (!raw) return true;
  return isApprovedStatus(product) || !isHiddenPublicStatus(product);
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/products/featured`, { timeout: 30000 });
      return normalizeProducts(res.data).filter((p) => p?.isPublished !== false && isApprovedStatus(p));
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useProductsCatalog({
  search,
  limit = 200,
  promo = false,
  newArrival = false,
  bestSeller = false,
  sort,
} = {}) {
  return useQuery({
    queryKey: ['products', 'catalog', { search: search || '', limit, promo, newArrival, bestSeller, sort: sort || '' }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), page: '1' });
      if (search) params.set('search', search);
      if (promo) params.set('promo', 'true');
      if (newArrival) params.set('newArrival', 'true');
      if (bestSeller) params.set('bestSeller', 'true');
      if (sort) params.set('sort', sort);
      const res = await axios.get(`${API}/api/products?${params}`, { timeout: 60000 });
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
      const res = await axios.get(`${API}/api/products/${id}`, { timeout: 30000 });
      const product = normalizeSingleProduct(res.data);
      if (!isPubliclyVisibleProduct(product)) return null;
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
        timeout: 30000,
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
