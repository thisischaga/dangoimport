import client from './apiClient';

export const getCategories = () => client.get('/categories').then((res) => res.data.data || []);
export const getVendorDeliveryZonesByVendor = (vendorId) =>
  client.get(`/vendor-delivery/public/${encodeURIComponent(vendorId)}`).then((res) => res.data);
export const getConversations = () => client.get('/conversations/my').then((res) => res.data);
export const getConversationMessages = (conversationId) =>
  client.get(`/conversations/${conversationId}/messages`).then((res) => res.data);
export const startConversation = (payload) =>
  client.post('/conversations/start', payload).then((res) => res.data);
export const sendConversationMessage = (conversationId, payload) =>
  client.post(`/conversations/${conversationId}/messages`, payload).then((res) => res.data);
export const markConversationRead = (conversationId) =>
  client.patch(`/conversations/${conversationId}/read`).then((res) => res.data);
