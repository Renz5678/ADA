import api from './axiosInstance';

export const globalSearch = (query) => {
    return api.get(`/search?q=${encodeURIComponent(query)}`).then(r => r.data);
};
