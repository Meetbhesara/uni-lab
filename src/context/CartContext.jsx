import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// Simple UUID generator
const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const prevUserRef = useRef(user);

    // Initial Load
    useEffect(() => {
        let storedSession = localStorage.getItem('sessionId');
        if (!storedSession) {
            storedSession = generateSessionId();
            localStorage.setItem('sessionId', storedSession);
        }
        setSessionId(storedSession);
        fetchCart(storedSession);
    }, []);

    // Handle Logout / User Change
    useEffect(() => {
        // Detect Logout: Previous was user, current is null
        if (prevUserRef.current && !user) {
            // User logged out - refresh session to avoid data leak
            const newSession = generateSessionId();
            localStorage.setItem('sessionId', newSession);
            setSessionId(newSession);
            setCart([]); // Clear UI immediately
        }
        prevUserRef.current = user;
    }, [user]);

    const fetchCart = async (sid) => {
        try {
            if (!sid) return;
            const response = await api.get(`/cart/${sid}`);
            const data = response.data;
            let cartItems = [];

            if (Array.isArray(data)) {
                cartItems = data;
            } else if (data.items) {
                cartItems = data.items;
            } else if (data.products) {
                cartItems = data.products;
            }

            setCart(cartItems);
        } catch (error) {
            console.error("Failed to fetch cart", error);
            setCart([]);
        }
    }

    const addToCart = async (product) => {
        try {
            const productId = product._id || product.id;

            let newQuantity = 1;
            setCart(prev => {
                const existingIndex = prev.findIndex(item => {
                    const itemProdId = item.productId?._id || item.product?._id || item.productId?.id || item.product?.id || item._id || item.id;
                    return itemProdId === productId;
                });

                if (existingIndex > -1) {
                    const newCart = [...prev];
                    const existingItem = newCart[existingIndex];
                    newQuantity = (Number(existingItem.quantity) || 1) + 1;
                    newCart[existingIndex] = { ...existingItem, quantity: newQuantity };
                    return newCart;
                } else {
                    const tempItem = {
                        _id: 'temp-' + Date.now(),
                        product: product,
                        productId: product,
                        name: product.name,
                        images: product.images,
                        photos: product.photos,
                        quantity: 1
                    };
                    return [...prev, tempItem];
                }
            });

            await api.post('/cart', { sessionId, productId, quantity: newQuantity });
            await fetchCart(sessionId);
        } catch (error) {
            console.error("Add to cart failed", error);
            // Revert handled by fetchCart usually, but better to force sync
            fetchCart(sessionId);
        }
    };

    const removeFromCart = async (itemId) => {
        setCart((prev) => prev.filter((item) => item._id !== itemId && item.id !== itemId));
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            // Allow empty string to clear the input field visually
            if (quantity === '') {
                setCart(prev => {
                    const existingIndex = prev.findIndex(item => {
                        const itemProdId = item.productId?._id || item.product?._id || item.productId?.id || item.product?.id || item._id || item.id;
                        return itemProdId === productId;
                    });
                    if (existingIndex > -1) {
                        const newCart = [...prev];
                        newCart[existingIndex] = { ...newCart[existingIndex], quantity: '' };
                        return newCart;
                    }
                    return prev;
                });
                return;
            }

            const parsedQty = parseInt(quantity);
            if (isNaN(parsedQty) || parsedQty < 1) return;

            setCart(prev => {
                const existingIndex = prev.findIndex(item => {
                    const itemProdId = item.productId?._id || item.product?._id || item.productId?.id || item.product?.id || item._id || item.id;
                    return itemProdId === productId;
                });
                if (existingIndex > -1) {
                    const newCart = [...prev];
                    newCart[existingIndex] = { ...newCart[existingIndex], quantity: parsedQty };
                    return newCart;
                }
                return prev;
            });
            await api.post('/cart', { sessionId, productId, quantity: parsedQty });
        } catch (error) {
            console.error("Update quantity failed", error);
            fetchCart(sessionId);
        }
    };

    const clearCart = async () => {
        setCart([]);

        // Force fresh session ID to decouple from old remote cart
        const newSession = generateSessionId();
        localStorage.setItem('sessionId', newSession);
        setSessionId(newSession);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
