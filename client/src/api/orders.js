import api from "./axiosInstance";

export const getOrders = (page, limit) => api.get('/orders', {
    params: { page, limit }
}).then(r => r.data);

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const createOrder = (data) => api.post('/orders', data).then(r => r.data);

export const updateOrder = (id, updates) => api.put(`/orders/${id}`, updates).then(r => r.data);

export const getOrderItemsByOrder = (orderId) => api.get(`/order-item/order/${orderId}`).then(r => r.data);

export const createOrderItem = (data) => api.post('/order-item', data).then(r => r.data);

export const updateOrderItem = (id, updates) => api.put(`/order-item/${id}`, updates).then(r => r.data);

export const deleteOrderItem = (id) => api.delete(`/order-item/${id}`).then(r => r.data);