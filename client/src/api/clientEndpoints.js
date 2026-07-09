import clientApi from "./clientApi.js";
import api from "./axiosInstance.js";

// Client Auth (Uses unauthenticated instance or generic one, but let's use clientApi without token requirement for register/login)
export const registerClient = async (data) => {
    const response = await clientApi.post('/client-auth/register', data);
    return response.data;
};

export const loginClient = async (data) => {
    const response = await clientApi.post('/client-auth/login', data);
    return response.data;
};

export const verifyClientOtp = async (data) => {
    const response = await clientApi.post('/client-auth/verify-otp', data);
    return response.data;
};

export const resendClientOtp = async (data) => {
    const response = await clientApi.post('/client-auth/resend-otp', data);
    return response.data;
};

export const googleLoginClient = async (data) => {
    const response = await clientApi.post('/client-auth/google', data);
    return response.data;
};

// Client Businesses (Directory)
export const getBusinesses = async () => {
    const response = await clientApi.get('/client-businesses');
    return response.data.businesses;
};

// Client Orders
export const getClientOrders = async () => {
    const response = await clientApi.get('/client-orders');
    return response.data.orders;
};

export const createClientOrder = async (data) => {
    const response = await clientApi.post('/client-orders', data);
    return response.data;
};
