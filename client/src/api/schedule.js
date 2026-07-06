import api from "./axiosInstance";

export const getAvailabilities = () => api.get('/schedule').then(r => r.data);
export const createAvailability = (data) => api.post('/schedule', data).then(r => r.data.data);
export const updateAvailability = (id, data) => api.put(`/schedule/${id}`, data).then(r => r.data);
export const deleteAvailability = (id) => api.delete(`/schedule/${id}`).then(r => r.data);
