import api from "./axiosInstance";

export const getOrders = (page, limit) => api.get('/orders', {
    params: { page, limit }
}).then(r => r.data);

export const createOrder = async (data) => api.get('/orders', data);