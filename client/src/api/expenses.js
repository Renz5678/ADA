import api from "./axiosInstance";

export const getExpenses = (page, limit) => {
    let url = '/expenses';
    const params = new URLSearchParams();
    if (page && limit) {
        params.append('page', page);
        params.append('limit', limit);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    return api.get(url).then(r => r.data);
};
export const getExpenseById = (id) => api.get(`/expenses/${id}`).then(r => r.data);
export const createExpense = (data) => api.post('/expenses', data).then(r => r.data.data);
export const updateExpense = (id, updates) => api.put(`/expenses/${id}`, updates).then(r => r.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(r => r.data);
