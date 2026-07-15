import api from './axiosInstance';

export const getProducts = (page, limit, search = '') => {
    let url = '/products';
    const params = new URLSearchParams();
    if (page && limit) {
        params.append('page', page);
        params.append('limit', limit);
    }
    if (search) {
        params.append('search', search);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    return api.get(url).then(r => r.data);
};

export const createProduct = (product) => api.post('/products', product).then(r => r.data);

export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then(r => r.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);