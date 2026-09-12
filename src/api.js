import client from './apiClient';

export const getCategories = () => client.get('/categories').then((res) => res.data.data || []);
export const getVendorDeliveryZonesByVendor = (vendorId) =>
  client.get(`/vendor-delivery/public/${encodeURIComponent(vendorId)}`).then((res) => res.data);
export const calculateDeliveryOptions = (payload) =>
  client.post('/vendor-delivery/calculate-option', payload).then((res) => res.data);
