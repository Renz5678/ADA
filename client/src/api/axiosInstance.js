import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://ada-mumf.onrender.com/'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login-freelancer') {
                window.location.href = '/login-freelancer';
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