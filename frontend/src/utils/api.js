import axios from 'axios';

const API = 'https://srv-d7kmh4km0tmc73aodc70.onrender.com/api'; 

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("unauthorized, redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default api;