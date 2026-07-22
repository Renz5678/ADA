import axios from "axios";

const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

api.interceptors.request.use((config) => {
    return config;
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        if (error.response && error.response.status >= 500) {
            console.error(
                `%c [API Error - ${error.response.status}] `, 'background: red; color: white; font-weight: bold;', 
                error.response.data?.message || error.message
            );
            if (error.response.data?.error) {
                console.error(`Error Type: ${error.response.data.error}`);
            }
        }
        return Promise.reject(error);
    }
);

export default api;