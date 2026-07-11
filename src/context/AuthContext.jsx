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

    // ── Dynamic Daily & Midnight Auto-Logout (12:00 AM reset) ──────────────────
    useEffect(() => {
        const checkSessionExpiry = () => {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const lastLoginStr = sessionStorage.getItem('lastLoginAt') || localStorage.getItem('lastLoginAt');
            if (!token || !lastLoginStr) return false;

            const lastLogin = new Date(parseInt(lastLoginStr));
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            // If last login was before today's 12:00 AM midnight, trigger auto logout
            if (lastLogin.getTime() < todayMidnight.getTime()) {
                console.log("Session expired at midnight. Automatic logout triggered, redirecting to Home page.");
                logout();
                return true;
            }
            return false;
        };

        // Check immediately on mount/update
        if (checkSessionExpiry()) return;

        // Schedule exact timeout to trigger precisely at next midnight (12:00:00 AM tonight)
        const scheduleMidnightTimer = () => {
            const now = new Date();
            const nextMidnight = new Date();
            nextMidnight.setHours(24, 0, 0, 0); // exact next midnight
            const msUntilMidnight = nextMidnight.getTime() - now.getTime();

            return setTimeout(() => {
                console.log("Midnight reached! Automatic logout triggered, redirecting to Home page.");
                logout();
            }, msUntilMidnight);
        };

        let midnightTimer = scheduleMidnightTimer();

        // Safety interval check (in case tab sleeps/wakes across midnight)
        const interval = setInterval(() => {
            const expired = checkSessionExpiry();
            if (expired) {
                clearTimeout(midnightTimer);
            } else {
                clearTimeout(midnightTimer);
                midnightTimer = scheduleMidnightTimer();
            }
        }, 15 * 60 * 1000); // Check every 15 minutes

        // Also check whenever user switches back to the tab or wakes up computer
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkSessionExpiry();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for 401 Unauthorized errors from API interceptors
        const handleSessionExpired = () => {
            console.log("401 Unauthorized detected. Triggering auto logout, redirecting to Home page.");
            logout();
        };
        window.addEventListener('auth-session-expired', handleSessionExpired);

        return () => {
            clearTimeout(midnightTimer);
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('auth-session-expired', handleSessionExpired);
        };
    }, [user]);

    useEffect(() => {
        // Check session storage on load (sessionStorage is cleared when browser/window is closed)
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');

        // If sessionStorage is empty but localStorage has token, we require re-login if browser was closed
        // By using sessionStorage primarily for login state, closing the browser forces re-login
        if (sessionStorage.getItem('token')) {
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch (e) {}
            }
            refreshUser(); // Background sync on load
        } else {
            // Browser was closed and re-opened or first visit -> wipe old localStorage sessions to require re-login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user?.isAdmin) return;
        const handleBeforeUnload = () => {
            const currentToken = sessionStorage.getItem('token');
            if (currentToken) {
                const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5001/api';
                try {
                    fetch(`${baseUrl}/auth/logout`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
                        keepalive: true
                    }).catch(() => {});
                } catch (e) {}
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleBeforeUnload);
        };
    }, [user]);

    const refreshUser = async () => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            sessionStorage.setItem('user', JSON.stringify(res.data));
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



            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userObj));
            sessionStorage.setItem('lastLoginAt', Date.now().toString());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
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
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('lastLoginAt', Date.now().toString());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
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
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('lastLoginAt', Date.now().toString());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
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
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.setItem('lastLoginAt', Date.now().toString());
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastLoginAt');
                setUser(userData);
            }
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.response?.data?.msg || 'OTP verification failed' };
        }
    };

    const logout = (options = { redirect: true }) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token && options.redirect !== false) {
            try {
                api.post('/auth/logout').catch(() => {});
            } catch (e) {}
        }
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('lastLoginAt');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastLoginAt');
        if (options.redirect !== false) {
            setUser(null);
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
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
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('lastLoginAt', Date.now().toString());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
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
            sessionStorage.setItem('token', authToken);
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('lastLoginAt', Date.now().toString());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastLoginAt');
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
