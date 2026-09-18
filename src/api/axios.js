import axios from 'axios';

// Use relative /api path so Vite's dev proxy handles it → works on both PC and mobile.
// On mobile, "localhost" points to the phone itself (not the PC), causing API failures.
// A relative path lets Vite route /api → localhost:5001 regardless of the device.
const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api';

const api = axios.create({
    baseURL: baseURL,
});

// Request Interceptor to add Token
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || sessionStorage.getItem('employeeToken') || localStorage.getItem('employeeToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor to handle 401 Unauthorized (e.g., token expired or midnight session reset)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url = error.config?.url || '';
            const isAuthAttempt = url.includes('/verify') || url.includes('/login') || url.includes('/send-otp') || url.includes('/register');
            if (!isAuthAttempt) {
                // Clear all session and local storage tokens upon 401 Unauthorized
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('lastLoginAt');
                sessionStorage.removeItem('employeeToken');
                sessionStorage.removeItem('employeeUser');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastLoginAt');
                localStorage.removeItem('employeeToken');
                localStorage.removeItem('employeeUser');

                // Dispatch global event so active contexts immediately reset and redirect to login
                window.dispatchEvent(new Event('auth-session-expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
