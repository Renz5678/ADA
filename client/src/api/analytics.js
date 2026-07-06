import api from "./axiosInstance";

export const getSummary = (period) => api.get('/analytics/summary', { params: { period } }).then(r => r.data);
export const getTopProducts = () => api.get('/analytics/top-products').then(r => r.data);
export const getWeakProducts = () => api.get('/analytics/weak-products').then(r => r.data);
export const getSalesByMonth = () => api.get('/analytics/sales-by-month').then(r => r.data);
export const getSuggestedFocus = () => api.get('/analytics/suggested-focus').then(r => r.data);
