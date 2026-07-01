import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const getCoordinates = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ latitude: null, longitude: null });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Location access denied or failed:", error);
                resolve({ latitude: null, longitude: null });
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dynamic daily logout check (12:00 AM reset)
    useEffect(() => {
        const checkSessionExpiry = () => {
            const token = localStorage.getItem('token');
            const lastLoginStr = localStorage.getItem('lastLoginAt');
            if (!token || !lastLoginStr) return;

            const lastLogin = new Date(parseInt(lastLoginStr));
            const todayMidnight = new Date().setHours(0, 0, 0, 0);

            // If last login was before the most recent midnight, logout
            if (lastLogin.getTime() < todayMidnight) {
                console.log("Session expired for the day. Automatic logout triggered.");
                logout();
            }
        };

        checkSessionExpiry();
        // Periodically refresh the check every hour to catch midnight crossovers
        const interval = setInterval(checkSessionExpiry, 3600000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check local storage for token/user on load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            refreshUser(); // Background sync on load
        } else {
            setLoading(false);
        }
    }, []);

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to sync latest user data', err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { latitude, longitude } = await getCoordinates();
            const response = await api.post('/auth/login', { email, password, latitude, longitude });
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



            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('lastLoginAt', Date.now().toString());
            setUser(userObj);
            return { success: true };
        } catch (error) {
            console.error("Login Error", error);
            return { success: false, message: error.response?.data?.msg || error.response?.data?.message || 'Login failed' };
        }
    };

    const phoneLogin = async (phone) => {
        try {
            const response = await api.post('/auth/phone-login', { phone });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastLoginAt', Date.now().toString());
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
            localStorage.setItem('lastLoginAt', Date.now().toString());
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
                localStorage.setItem('lastLoginAt', Date.now().toString());
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
        localStorage.removeItem('lastLoginAt');
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
            const { latitude, longitude } = await getCoordinates();
            const response = await api.post('/auth/send-admin-otp', { email, latitude, longitude });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to send OTP', status: error.response?.status };
        }
    };

    const verifyAdminOtp = async (email, otp) => {
        try {
            const { latitude, longitude } = await getCoordinates();
            const response = await api.post('/auth/verify-admin-otp', { email, otp, latitude, longitude });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastLoginAt', Date.now().toString());
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'OTP verification failed' };
        }
    };

    const createAdmin = async (name, email, phone, permissions) => {
        try {
            const response = await api.post('/auth/create-admin', { name, email, phone, permissions });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to create admin' };
        }
    };

    const setup2FA = async (email) => {
        try {
            const response = await api.post('/auth/setup-2fa', { email });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to setup 2FA' };
        }
    };

    const verifyEnable2FA = async (email, token) => {
        try {
            const response = await api.post('/auth/verify-enable-2fa', { email, token });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Verification failed' };
        }
    };

    const login2FA = async (email, token) => {
        try {
            const { latitude, longitude } = await getCoordinates();
            const response = await api.post('/auth/login-2fa', { email, token, latitude, longitude });
            const { token: authToken, user: userData } = response.data;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastLoginAt', Date.now().toString());
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || '2FA Login failed' };
        }
    };

    // Reset 2FA — admin proves identity via WhatsApp OTP, backend clears the TOTP secret
    const resetWithBackup = async (email, backupCode) => {
        try {
            const response = await api.post('/auth/reset-with-backup', { email, backupCode });
            return { success: true, ...response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'Failed to reset 2FA' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, phoneLogin, phoneRegister, sendOtp, verifyOtp, sendAdminOtp, verifyAdminOtp, createAdmin, setup2FA, verifyEnable2FA, login2FA, resetWithBackup, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
