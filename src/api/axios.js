import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5001/api'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
