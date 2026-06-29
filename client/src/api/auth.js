import api from "./axiosInstance";

export const signup = (data) => api.post('auth/register', data);
export const login = (data) => api.post('auth/login', data);
export const verifyOtp = (data) => api.post('auth/verify-otp', data);
export const resendOtp = (data) => api.post('auth/resend-otp', data);
export const forgotPassword = (data) => api.post('auth/reset-password', data); 