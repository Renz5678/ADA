import api from './axiosInstance';

export const getMe = () => api.get('/user-details').then(r => r.data);
export const updateBusinessName = (data) => api.patch('/user-details/business-name', data).then(r => r.data);

export const getProfile = () => api.get('/profile').then(r => r.data);
export const updateProfile = (data) => api.put('/profile', data).then(r => r.data);
export const uploadProfileImages = (formData) => api.post('/profile/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);