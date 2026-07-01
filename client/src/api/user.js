import api from './axiosInstance';

export const getMe = () => api.get('/user-details').then(r => r.data);