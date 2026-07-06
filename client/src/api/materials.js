import api from "./axiosInstance";

export const getMaterials = (page, limit) => {
    let url = '/materials';
    const params = new URLSearchParams();
    if (page && limit) {
        params.append('page', page);
        params.append('limit', limit);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    return api.get(url).then(r => r.data);
};
export const getMaterialById = (id) => api.get(`/materials/${id}`).then(r => r.data);
export const createMaterial = (data) => api.post('/materials', data).then(r => r.data.data);
export const updateMaterial = (id, updates) => api.put(`/materials/${id}`, updates).then(r => r.data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`).then(r => r.data);
