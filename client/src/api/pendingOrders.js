import api from './axiosInstance.js';

/**
 * Fetch all pending order requests for the logged-in freelancer.
 */
export const getPendingOrders = () =>
    api.get('/pending-orders').then(r => r.data);

/**
 * Approve a pending order — persists it to the Orders database.
 */
export const approvePendingOrder = (pendingId) =>
    api.post(`/orders/approve/${pendingId}`).then(r => r.data);

/**
 * Decline a pending order — discards it and notifies the client.
 */
export const declinePendingOrder = (pendingId) =>
    api.post(`/orders/decline/${pendingId}`).then(r => r.data);
