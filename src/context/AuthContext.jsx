import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for token/user on load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
            // Technically we should validate the token with /auth/me if that endpoint existed
            // For now, we trust the storage if present
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;

            // Save to storage
            localStorage.setItem('token', token);
            // The API might return user details inside userData or we might need to decode token
            // Assuming response structure based on common practices, but if API doc says "Login to get a JWT token",
            // we might need to decode it or the API returns { token, user }. 
            // Let's assume the API returns { token, user } or we construct the user object from what we have if the API is simple.

            // If the API only returns token, we might need a way to get user info. 
            // For this specific requirement, let's assume the response is { token, user } or { access_token } 
            // and we will store what we can. 

            // Wait, the doc says "Login to get a JWT token". It doesn't explicitly say it returns user object.
            // However, usually it does. If not, we will need to store the email at least.

            // Let's assume standard response: { token: "...", user: { ... } }
            // If not, we'll patch it.
            const userObj = userData || { email };



            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
            return { success: true };
        } catch (error) {
            console.error("Login Error", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const phoneLogin = async (phone) => {
        try {
            const response = await api.post('/auth/phone-login', { phone });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Phone login failed', status: error.response?.status };
        }
    };

    const phoneRegister = async (data) => {
        try {
            const response = await api.post('/auth/phone-register', data);
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Phone registration failed' };
        }
    };

    const sendOtp = async (phone) => {
        try {
            const response = await api.post('/auth/send-otp', { phone });
            return { success: true, ...response.data }; // { success: true, msg: '...' }
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to send OTP', status: error.response?.status };
        }
    };

    const verifyOtp = async (phone, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { phone, otp });
            const { token, user: userData } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'OTP verification failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const register = async (name, email, password, contact) => {
        try {
            await api.post('/auth/register', { name, email, password, phone: contact });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const sendAdminOtp = async (email) => {
        try {
            const response = await api.post('/auth/send-admin-otp', { email });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to send OTP', status: error.response?.status };
        }
    };

    const verifyAdminOtp = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-admin-otp', { email, otp });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'OTP verification failed' };
        }
    };

    const createAdmin = async (name, email, phone) => {
        try {
            const response = await api.post('/auth/create-admin', { name, email, phone });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to create admin' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, phoneLogin, phoneRegister, sendOtp, verifyOtp, sendAdminOtp, verifyAdminOtp, createAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
