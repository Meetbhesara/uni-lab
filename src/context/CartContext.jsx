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

// Always read fresh from localStorage — avoids stale React state closures
const getSessionId = () => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
        sid = generateSessionId();
        localStorage.setItem('sessionId', sid);
    }
    return sid;
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const prevUserRef = useRef(user);

    // Initial Load
    useEffect(() => {
        const sid = getSessionId();
        fetchCart(sid);
    }, []);

    // Handle Logout / User Change
    useEffect(() => {
        if (prevUserRef.current && !user) {
            // User logged out - fresh session
            const newSession = generateSessionId();
            localStorage.setItem('sessionId', newSession);
            setCart([]);
        }
        prevUserRef.current = user;
    }, [user]);

    const fetchCart = async (sid) => {
        try {
            const sessionId = sid || getSessionId();
            // _t busts browser/CDN cache so we never get a stale 304 response
            const response = await api.get(`/cart/${sessionId}?_t=${Date.now()}`);
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
            console.error('[Cart] fetchCart failed:', error.message);
            setCart([]);
        }
    };

    const addToCart = async (product) => {
        const sessionId = getSessionId(); // always fresh from localStorage
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

        try {
            await api.post('/cart', { sessionId, productId, quantity: newQuantity });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('[Cart] addToCart failed:', error.response?.data || error.message);
            fetchCart(sessionId);
        }
    };

    const removeFromCart = async (itemId) => {
        const sessionId = getSessionId(); // always fresh from localStorage

        // Find item in cart state
        const item = cart.find(i => i._id === itemId || i.id === itemId);
        if (!item) {
            console.warn('[Cart] removeFromCart: item not found for id', itemId, 'cart:', cart);
            return;
        }

        // Extract the actual product MongoDB _id
        const productId =
            item.productId?._id ||
            item.productId?.id ||
            item.product?._id ||
            item.product?.id ||
            (typeof item.productId === 'string' ? item.productId : null) ||
            (typeof item.product === 'string' ? item.product : null);

        console.log('[Cart] removeFromCart → productId:', productId, 'sessionId:', sessionId);

        // Optimistically remove from UI
        setCart(prev => prev.filter(i => i._id !== itemId && i.id !== itemId));

        if (!productId) {
            console.warn('[Cart] removeFromCart: could not extract productId from item', item);
            return;
        }

        try {
            await api.delete(`/cart/item/${productId}?sessionId=${sessionId}`);
            // Sync with server after delete
            await fetchCart(sessionId);
        } catch (error) {
            console.error('[Cart] removeFromCart failed:', error.response?.status, error.response?.data || error.message);
            // Re-sync on failure
            fetchCart(sessionId);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        const sessionId = getSessionId();
        try {
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
            console.error('[Cart] updateQuantity failed:', error.message);
            fetchCart(sessionId);
        }
    };

    const clearCart = async () => {
        const sessionId = getSessionId();
        try {
            await api.delete(`/cart/${sessionId}`);
        } catch (e) {
            // Silently ignore
        }
        setCart([]);
        const newSession = generateSessionId();
        localStorage.setItem('sessionId', newSession);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
