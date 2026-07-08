import api from './axiosInstance';

export const getMe = () => api.get('/user-details').then(r => r.data);
export const updateBusinessName = (data) => api.patch('/user-details/business-name', data).then(r => r.data);