import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const API = API_BASE_URL;

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
}

export function useStore(slug) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/stores/${encodeURIComponent(slug)}`, {
        timeout: 15000,
      });
      return res.data?.data ?? null;
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useStoreProducts(slug, params) {
  return useQuery({
    queryKey: ['store:products', slug, params],
    queryFn: async ({ queryKey }) => {
      const [, , p] = queryKey;
      const qs = new URLSearchParams();
      Object.entries(p || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        qs.set(key, String(value));
      });
      const res = await axios.get(
        `${API}/api/stores/${encodeURIComponent(slug)}/products?${qs.toString()}`,
        { timeout: 20000 }
      );
      return {
        products: normalizeList(res.data),
        pagination: res.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 24,
        },
      };
    },
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useStoreRelated(slug, limit = 8) {
  return useQuery({
    queryKey: ['store:related', slug, limit],
    queryFn: async () => {
      const res = await axios.get(
        `${API}/api/stores/${encodeURIComponent(slug)}/related?limit=${limit}`,
        { timeout: 15000 }
      );
      return normalizeList(res.data);
    },
    enabled: Boolean(slug),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
