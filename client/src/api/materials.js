import api from "./axiosInstance";

export const getMaterials = () => api.get('/materials').then(r => r.data);
export const getMaterialById = (id) => api.get(`/materials/${id}`).then(r => r.data);
export const createMaterial = (data) => api.post('/materials', data).then(r => r.data.data);
export const updateMaterial = (id, updates) => api.put(`/materials/${id}`, updates).then(r => r.data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`).then(r => r.data);
