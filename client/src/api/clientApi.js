import axios from "axios";

const clientApi = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

clientApi.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

clientApi.interceptors.request.use((config) => {
    return config;
});

clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default clientApi;
