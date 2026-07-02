import api from './axiosInstance';

export const getProducts = () => api.get('/products').then(r => r.data);

export const createProduct = (product) => api.post('/products', product).then(r => r.data);

export const updateProduct = (id, updates) => api.put(`/products/${id}`, updates).then(r => r.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);