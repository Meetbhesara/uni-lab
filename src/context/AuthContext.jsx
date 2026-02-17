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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const register = async (name, email, password, contact) => {
        try {
            await api.post('/auth/register', { name, email, password, phone: contact });
            // After register, usually we ask to login, or auto-login.
            // Prompt says: "first reegister user and then login thea in the regiter form email,password ,contact no must be then redireted to login"
            // So we strictly just return success here.
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
