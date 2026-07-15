import axios from 'axios';
import FormData from 'form-data';

const api = axios.create({});

const form = new FormData();
form.append('test', '123');

api.interceptors.request.use(config => {
    console.log("FormData headers:");
    console.log(config.headers);
    return config;
});
api.post('http://localhost:3002/', form).catch(() => {});

const api2 = axios.create({});
api2.interceptors.request.use(config => {
    console.log("JSON headers:");
    console.log(config.headers);
    return config;
});
api2.post('http://localhost:3002/', { test: 123 }).catch(() => {});
