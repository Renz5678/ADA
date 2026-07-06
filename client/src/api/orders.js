import api from "./axiosInstance";

export const getOrders = (page, limit, status, search) => api.get('/orders', {
    params: { page, limit, status, search }
}).then(r => r.data);

export const getOrderStats = () => api.get('/orders/stats').then(r => r.data);

export const getScheduledOrders = () => api.get('/orders/scheduled').then(r => r.data);

export const getOrderById = (id) => api.get(`/orders/${id}`).then(r => r.data);

export const createOrder = (data) => api.post('/orders', data).then(r => r.data.data);

export const updateOrder = (id, updates) => api.put(`/orders/${id}`, updates).then(r => r.data);

export const getOrderItemsByOrder = (orderId) => api.get(`/order-item/order/${orderId}`).then(r => r.data);

export const createOrderItem = (data) => api.post('/order-item', data).then(r => r.data.data);

export const updateOrderItem = (id, updates) => api.put(`/order-item/${id}`, updates).then(r => r.data);

export const deleteOrderItem = (id) => api.delete(`/order-item/${id}`).then(r => r.data);

export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(r => r.data);