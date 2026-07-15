import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const api = axios.create({
    headers: { 'Content-Type': 'application/json' }
});

const form = new FormData();
form.append('test', '123');

console.log("Without headers:");
console.log(api.getUri({ data: form, method: 'POST', url: '/' }));
// We need an interceptor to view the final headers
api.interceptors.request.use(config => {
    console.log(config.headers);
    return config;
});
api.post('http://localhost:3002/', form).catch(() => {});
