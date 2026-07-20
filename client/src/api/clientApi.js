import axios from "axios";

const clientApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://ada-mumf.onrender.com/',
    headers: {
        'Content-Type': 'application/json'
    }
});

clientApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('client_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('client_token');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default clientApi;
