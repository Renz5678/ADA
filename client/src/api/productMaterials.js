import api from './axiosInstance';

export const getProductMaterials = (productId) => 
    api.get(`/products/${productId}/materials`).then(r => r.data);

export const addProductMaterial = (productId, data) => 
    api.post(`/products/${productId}/materials`, data).then(r => r.data);

export const removeProductMaterial = (productId, materialId) => 
    api.delete(`/products/${productId}/materials/${materialId}`).then(r => r.data);
