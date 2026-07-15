import axios from 'axios';
import FormData from 'form-data';

const api = axios.create({
    headers: { 'Content-Type': 'application/json' }
});

const form = new FormData();
form.append('test', '123');

api.interceptors.request.use(config => {
    console.log(config.headers);
    return config;
});
api.post('http://localhost:3002/', form).catch(() => {});
