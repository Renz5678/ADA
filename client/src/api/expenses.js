import api from "./axiosInstance";

export const getExpenses = () => api.get('/expenses').then(r => r.data);
export const getExpenseById = (id) => api.get(`/expenses/${id}`).then(r => r.data);
export const createExpense = (data) => api.post('/expenses', data).then(r => r.data.data);
export const updateExpense = (id, updates) => api.put(`/expenses/${id}`, updates).then(r => r.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(r => r.data);
