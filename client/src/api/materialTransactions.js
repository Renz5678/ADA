import api from "./axiosInstance";

export const getMaterialTransactions = () => api.get('/material-transaction').then(r => r.data);
export const getMaterialTransactionById = (id) => api.get(`/material-transaction/${id}`).then(r => r.data);
export const createMaterialTransaction = (materialId, data) => api.post(`/material-transaction/${materialId}`, data).then(r => r.data.data);
export const updateMaterialTransaction = (id, updates) => api.put(`/material-transaction/${id}`, updates).then(r => r.data);
export const deleteMaterialTransaction = (id) => api.delete(`/material-transaction/${id}`).then(r => r.data);
