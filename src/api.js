import client from './apiClient';

export const getCategories = () => client.get('/categories').then((res) => res.data.data || []);
