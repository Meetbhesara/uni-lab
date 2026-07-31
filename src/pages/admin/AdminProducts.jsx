import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    FormControl, FormLabel, FormErrorMessage, Input, Textarea, Checkbox, Stack, useToast, Flex,
    Image, Badge, SimpleGrid, Text, InputGroup, InputLeftElement, InputRightElement, Select, Spinner,
    HStack, VStack, Tag, TagLabel, TagCloseButton, Divider, CheckboxGroup
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSettings, FiImage, FiInfo, FiDollarSign, FiPackage, FiSearch, FiPlay, FiLayers, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaLayerGroup } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { hasPermission } from '../../utils/permissions';
import ModulePermissionBar from '../../components/admin/ModulePermissionBar';


const PRODUCT_CATEGORIES = [
    "CEMENT,CONCRETE & AGGREGAT TESTING EQUIPMENT",
    "SOIL TESTING EQUIPMENT",
    "BITUMIN TESTING EQUPMENT",
    "Construction Machinery",
    "SURVEY & MEASURING INSTRUMENT",
    "SAFETY PRODUCTS"
];

const SUBCATEGORIES_STORAGE_KEY = 'admin_product_subcategories';

const AdminProducts = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [searchVal, setSearchVal] = useState('');
    const [loading, setLoading] = useState(true);

    // ── Subcategories (persisted in localStorage) ──────────────────────
    // Structure: { [categoryName]: [ { id, name, productIds: [] } ] }
    const [subcategories, setSubcategories] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SUBCATEGORIES_STORAGE_KEY) || '{}'); }
        catch { return {}; }
    });

    const fetchSubcategories = async () => {
        try {
            const res = await api.get('/products/subcategories');
            if (res.data && res.data.success && res.data.data) {
                setSubcategories(res.data.data);
                localStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(res.data.data));
            }
        } catch (err) {
            console.error('Failed to fetch subcategories from server', err);
        }
    };

    const saveSubcategories = async (next) => {
        setSubcategories(next);
        localStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(next));
        try {
            await api.post('/products/subcategories', { subcategories: next });
        } catch (err) {
            console.error('Failed to save subcategories to server', err);
        }
    };

    // Subcategory Manager modal (create / edit)
    const { isOpen: isSubMgrOpen, onOpen: onSubMgrOpen, onClose: onSubMgrClose } = useDisclosure();
    const [subMgrCategory, setSubMgrCategory] = useState('');   // which parent category
    const [subMgrEditing, setSubMgrEditing] = useState(null);   // existing sub obj or null
    const [subMgrName, setSubMgrName] = useState('');
    const [subMgrSelectedIds, setSubMgrSelectedIds] = useState([]);

    const openSubManager = (categoryName, existingSub = null) => {
        setSubMgrCategory(categoryName);
        setSubMgrEditing(existingSub);
        setSubMgrName(existingSub ? existingSub.name : '');
        setSubMgrSelectedIds(existingSub ? existingSub.productIds : []);
        onSubMgrOpen();
    };

    const saveSubcategory = () => {
        if (!subMgrName.trim()) return;
        const cat = subMgrCategory;
        const existing = subcategories[cat] || [];
        let updated;
        if (subMgrEditing) {
            updated = existing.map(s => s.id === subMgrEditing.id
                ? { ...s, name: subMgrName.trim(), productIds: subMgrSelectedIds }
                : s);
        } else {
            const newSub = { id: Date.now().toString(), name: subMgrName.trim(), productIds: subMgrSelectedIds };
            updated = [...existing, newSub];
        }
        saveSubcategories({ ...subcategories, [cat]: updated });
        onSubMgrClose();
    };

    const deleteSubcategory = (categoryName, subId) => {
        const updated = (subcategories[categoryName] || []).filter(s => s.id !== subId);
        saveSubcategories({ ...subcategories, [categoryName]: updated });
    };

    // Subcategory Delete Confirmation Modal State
    const { isOpen: isSubDeleteOpen, onOpen: onSubDeleteOpen, onClose: onSubDeleteClose } = useDisclosure();
    const [subToDelete, setSubToDelete] = useState(null); // { categoryName, sub }

    const handleSubDeleteClick = (categoryName, sub) => {
        setSubToDelete({ categoryName, sub });
        onSubDeleteOpen();
    };

    const confirmSubDelete = () => {
        if (!subToDelete) return;
        deleteSubcategory(subToDelete.categoryName, subToDelete.sub.id);
        toast({ title: `Subcategory "${subToDelete.sub.name}" Deleted`, status: "success", duration: 3000 });
        onSubDeleteClose();
        setSubToDelete(null);
    };

    // Subcategory Viewer modal (browse products in a subcategory)
    const { isOpen: isSubViewOpen, onOpen: onSubViewOpen, onClose: onSubViewClose } = useDisclosure();
    const [viewingSub, setViewingSub] = useState(null); // { name, productIds, categoryName }

    const openSubViewer = (categoryName, sub) => {
        setViewingSub({ ...sub, categoryName });
        onSubViewOpen();
    };

    // Disable Input Spinners via CSS Check
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Chrome, Safari, Edge, Opera */
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
            }
            /* Firefox */
            input[type=number] {
            -moz-appearance: textfield;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingProduct, setEditingProduct] = useState(null);

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // WhatsApp Modal State
    const { isOpen: isWhatsappOpen, onOpen: onWhatsappOpen, onClose: onWhatsappClose } = useDisclosure();
    const [whatsappProduct, setWhatsappProduct] = useState(null);
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [isWhatsappSending, setIsWhatsappSending] = useState(false);

    const handleWhatsappOpen = (product) => {
        setWhatsappProduct(product);
        setWhatsappPhone('');
        onWhatsappOpen();
    };

    // Global WhatsApp Multiple Product Sending
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [isGlobalWhatsappOpen, setIsGlobalWhatsappOpen] = useState(false);
    const [isGlobalWhatsappSending, setIsGlobalWhatsappSending] = useState(false);
    const [isFetchingUser, setIsFetchingUser] = useState(false);
    const [globalWhatsappForm, setGlobalWhatsappForm] = useState({
        phone: '',
        companyName: '',
        contactPersonName: '',
        email: ''
    });

    const toggleProductSelection = (productId) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) newSet.delete(productId);
            else newSet.add(productId);
            return newSet;
        });
    };

    const handleGlobalWhatsappOpen = () => {
        if (selectedProductIds.size === 0) {
            toast({ title: 'Select products first', status: 'warning' });
            return;
        }
        setGlobalWhatsappForm({ phone: '', companyName: '', contactPersonName: '', email: '' });
        setIsGlobalWhatsappOpen(true);
    };

    const onGlobalWhatsappClose = () => {
        setIsGlobalWhatsappOpen(false);
    };

    const fetchUserDetails = async (phoneNum) => {
        const phone = phoneNum.replace(/\D/g, '');
        if (phone.length === 10) {
            setIsFetchingUser(true);
            try {
                const res = await api.get(`/auth/phone/${phone}`);
                const u = res.data?.user || res.data;
                if (u && (u._id || u.phone)) {
                    setGlobalWhatsappForm(prev => ({
                        ...prev,
                        companyName: u.companyName || prev.companyName,
                        contactPersonName: u.name || u.contactPersonName || prev.contactPersonName,
                        email: u.email || prev.email
                    }));
                }
            } catch (_) {
                // Silent catch
            } finally {
                setIsFetchingUser(false);
            }
        }
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setGlobalWhatsappForm(prev => ({ ...prev, phone: val }));
        if (val.length === 10) {
            fetchUserDetails(val);
        }
    };

    const handleSendGlobalWhatsapp = async () => {
        const phone = globalWhatsappForm.phone.replace(/\D/g, '');
        if (phone.length < 10) {
            toast({ title: "Valid 10-digit phone number required", status: "error" });
            return;
        }
        setIsGlobalWhatsappSending(true);
        try {
            const selectedProducts = products.filter(p => selectedProductIds.has(p._id || p.id));
            await api.post('/whatsapp/send-multiple-products', {
                ...globalWhatsappForm,
                products: selectedProducts
            });
            toast({ title: "Products sent successfully on WhatsApp!", status: "success" });
            setIsGlobalWhatsappOpen(false);
            setSelectedProductIds(new Set());
        } catch (err) {
            toast({ title: "Failed to send", description: err.response?.data?.error || err.message, status: "error" });
        } finally {
            setIsGlobalWhatsappSending(false);
        }
    };

    // Super Admin Check — read from sessionStorage first (auth system stores here), fallback to localStorage
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.isSuperAdmin;
    const canWrite = hasPermission(user, 'products', 'write');
    const canShowStock = hasPermission(user, 'showStock', 'read');
    const canShowSellingPrice = hasPermission(user, 'showSellingPrice', 'read');
    const canShowDealerPrice = hasPermission(user, 'showDealerPrice', 'read');
    const canShowVendors = hasPermission(user, 'showVendors', 'read');


    const getGroupedAndSortedProducts = () => {
        const groups = {};
        PRODUCT_CATEGORIES.forEach(cat => {
            groups[cat] = [];
        });
        groups["Unassigned Categories"] = [];

        products.forEach(p => {
            const cat = p.category;
            if (cat) {
                const found = PRODUCT_CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
                if (found) {
                    groups[found].push(p);
                } else {
                    groups["Unassigned Categories"].push(p);
                }
            } else {
                groups["Unassigned Categories"].push(p);
            }
        });

        // Sort alphabetically by name
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });

        return groups;
    };

    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23f7fafc"/><path d="M55,85 L75,60 L95,85" stroke="%23cbd5e0" stroke-width="4" fill="none"/><circle cx="95" cy="55" r="8" fill="%23cbd5e0"/><rect x="40" y="40" width="70" height="70" rx="8" stroke="%23cbd5e0" stroke-width="4" fill="none"/></svg>';
        // Already absolute (Cloudinary or external)
        if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
        const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
        // Avoid double /api: if base ends with /api AND path starts with /api/
        let cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.slice(4); // strip leading /api
        }
        return `${base}${cleanPath}`;
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        pdf: '',
        sellingPriceStart: '',
        sellingPriceEnd: '',
        dealerPrice: '',
        vendors: [], // Array of { name: '', price: '' }
        details: [], // Array of { key: '', value: '' }
        alternativeNames: [], // Array of strings
        stock: '',
        sizes: [], // Array of { size: '', purchasePrice: '', stock: '' }
        videoLinks: [] // Array of strings
    });

    const [formErrors, setFormErrors] = useState({});

    // Separate state for file handling
    const [existingPhotos, setExistingPhotos] = useState([]); // URLs
    const [newPhotos, setNewPhotos] = useState([]); // File Objects
    const [existingVideos, setExistingVideos] = useState([]); // URLs
    const [newVideos, setNewVideos] = useState([]); // File Objects

    const toast = useToast();

    useEffect(() => {
        fetchProducts();
        fetchSubcategories();
    }, [location.pathname]);

    const fetchProducts = async (search = '') => {
        try {
            setLoading(true);
            setSearchVal(search);
            const res = await api.get(`/products${search ? `?search=${search}` : ''}`);
            setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to fetch products", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (product) => {
        setEditingProduct(product);
        setFormErrors({});

        const parseDetails = (rawDetails) => {
            let dArray = [];
            try {
                let dObj = rawDetails;
                if (typeof dObj === 'string') {
                    try { dObj = JSON.parse(dObj); if (typeof dObj === 'string') dObj = JSON.parse(dObj); } catch (e) { }
                }
                if (Array.isArray(dObj)) {
                    dArray = dObj.map(item => ({ key: item.key || '', value: item.value || '' }));
                } else if (dObj && typeof dObj === 'object') {
                    Object.entries(dObj).forEach(([key, value]) => {
                        if (key && key !== '_id') {
                            const safeValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                            dArray.push({ key, value: safeValue });
                        }
                    });
                }
            } catch (e) {
                console.error('Parse error', e);
            }
            return dArray;
        };

        const applyProduct = (p) => {
            let parsedVendors = [];
            if (Array.isArray(p.vendors) && p.vendors.length > 0) {
                parsedVendors = p.vendors;
            } else if (p.vendor || (p.purchasePrice !== null && p.purchasePrice !== undefined)) {
                // Fallback for legacy single vendor/price
                parsedVendors = [{ name: p.vendor || '', price: p.purchasePrice ?? '' }];
            }

            setFormData({
                name: p.name || '',
                description: p.description || '',
                category: p.category || '',
                pdf: p.pdf || '',
                sellingPriceStart: p.sellingPriceStart ?? '',
                sellingPriceEnd: p.sellingPriceEnd ?? '',
                dealerPrice: p.dealerPrice ?? '',
                vendors: parsedVendors,
                details: parseDetails(p.details),
                alternativeNames: Array.isArray(p.alternativeNames) ? p.alternativeNames : [],
                stock: p.stock ?? '',
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                videoLinks: Array.isArray(p.videoLinks) ? p.videoLinks : []
            });
            setExistingPhotos((p.localImages && p.localImages.length > 0) ? p.localImages : (p.images || p.photos || []));
            setNewPhotos([]);
            setExistingVideos(p.localVideos || []);
            setNewVideos([]);
        };

        // 1. Immediate fill from list data so form opens fast
        applyProduct(product);
        onOpen();

        // 2. Background fetch of full product to ensure all fields (especially nested ones) are fresh from DB
        try {
            const res = await api.get(`/products/${product._id || product.id}`);
            if (res.data) {
                applyProduct(res.data);
            }
        } catch (error) {
            console.error('Background full product fetch failed', error);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        onDeleteOpen();
    };

    const confirmDelete = async () => {
        if (!productToDelete || !canWrite) return;
        setIsDeleting(true);
        try {
            await api.delete(`/products/${productToDelete._id || productToDelete.id}`);
            toast({ title: "Product Deleted", status: "success" });
            fetchProducts();
            onDeleteClose();
        } catch (error) {
            console.error(error);
            toast({ title: "Delete Failed", status: "error" });
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const errors = {};

        // ── Required text fields ──────────────────────────────────
        if (!formData.name?.trim()) errors.name = 'Product Name is required';
        if (!formData.category) errors.category = 'Category is required';

        // ── Selling Price Start ───────────────────────────────────
        if (formData.sellingPriceStart !== '' && formData.sellingPriceStart !== null && Number(formData.sellingPriceStart) < 0) {
            errors.sellingPriceStart = 'Price cannot be negative';
        }

        // ── Stock Validation ──────────────────────────────────────
        if (formData.stock !== '' && formData.stock !== null && Number(formData.stock) < 0) {
            errors.stock = 'Stock cannot be negative';
        }

        // ── Vendors Array Validation ──────────────────────────────
        // But we must enforce non-negative for purchase price IF provided.
        formData.vendors.forEach((v, index) => {
            if (v.price !== '' && v.price !== null && Number(v.price) < 0) {
                errors[`vendor_price_${index}`] = 'Price cannot be negative';
            }
        });

        // ── At least one image ────────────────────────────────────
        if (existingPhotos.length === 0 && newPhotos.length === 0) {
            errors.images = 'At least one product image is required';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!canWrite) {
            toast({ title: "Permission Denied", description: "You do not have write access to modify products.", status: "error", duration: 3000 });
            return;
        }

        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast({
                title: "Validation Failed",
                description: "Please check the highlighted fields",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setIsSubmitting(true);

        // Construct FormData
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description || '');
        data.append('category', formData.category || '');
        data.append('pdf', formData.pdf || '');
        if (formData.sellingPriceStart !== '' && formData.sellingPriceStart !== null) data.append('sellingPriceStart', formData.sellingPriceStart);
        if (formData.sellingPriceEnd !== '' && formData.sellingPriceEnd !== null) data.append('sellingPriceEnd', formData.sellingPriceEnd);

        if (formData.dealerPrice !== '' && formData.dealerPrice !== null) data.append('dealerPrice', formData.dealerPrice);
        data.append('alternativeNames', JSON.stringify(formData.alternativeNames));

        // Filter out empty vendors and append as stringified array
        const validVendors = formData.vendors.filter(v => v.name?.trim() || (v.price !== '' && v.price !== null));
        data.append('vendors', JSON.stringify(validVendors));

        // Filter valid sizes and compute total stock if size variants exist
        const validSizes = (formData.sizes || []).filter(s => s.size?.trim() || s.purchasePrice || s.stock);
        if (validSizes.length > 0) {
            const accumulatedStock = validSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
            data.append('stock', accumulatedStock);
        } else if (formData.stock !== '' && formData.stock !== null) {
            data.append('stock', formData.stock);
        }
        data.append('sizes', JSON.stringify(validSizes));

        // Convert details array back to Object and stringify for transport
        const detailsMap = {};
        const validDetails = formData.details.filter(d => d.key && d.key.trim() !== '');
        validDetails.forEach(d => {
            detailsMap[d.key] = d.value;
        });
        data.append('details', JSON.stringify(detailsMap));

        // Append Existing Photos
        existingPhotos.forEach(photoUrl => {
            data.append('existingPhotos', photoUrl);
        });

        // Append New Files
        newPhotos.forEach(file => {
            data.append('images', file); // Use 'images' field name as per backend
        });

        // Append Existing Videos
        existingVideos.forEach(vidUrl => {
            data.append('existingVideos', vidUrl);
        });

        // Append New Videos
        newVideos.forEach(file => {
            data.append('videos', file);
        });

        data.append('videoLinks', JSON.stringify(formData.videoLinks || []));

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingProduct) {
                await api.put(`/products/${editingProduct._id || editingProduct.id}`, data, config);
                toast({ title: "Product Updated", status: "success", variant: "subtle" });
            } else {
                await api.post('/products', data, config);
                toast({ title: "Product Created", status: "success", variant: "subtle" });
            }
            onClose();
            // Reset
            setEditingProduct(null);
            setFormData({ name: '', description: '', category: '', pdf: '', sellingPriceStart: '', sellingPriceEnd: '', dealerPrice: '', vendors: [], details: [], alternativeNames: [], stock: '', videoLinks: [] });
            setFormErrors({});
            setExistingPhotos([]);
            setNewPhotos([]);
            setExistingVideos([]);
            setNewVideos([]);
            fetchProducts();
        } catch (error) {
            console.error('Submission error:', error);
            const errMsg = error.response?.data?.message || error.response?.data?.msg || error.message || "Unknown error";
            toast({ title: "Operation Failed", description: errMsg, status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Details Helpers
    const addDetailRow = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, { key: '', value: '' }] }));
    };

    const updateDetailRow = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const removeDetailRow = (index) => {
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    // Video Helpers
    const handleVideoFileChange = (e) => {
        if (e.target.files) {
            setNewVideos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewVideo = (index) => {
        setNewVideos(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingVideo = (index) => {
        setExistingVideos(prev => prev.filter((_, i) => i !== index));
    };

    // Photo Helpers
    const handleFileChange = (e) => {
        if (e.target.files) {
            setNewPhotos(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewPhoto = (index) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // WhatsApp Helper
    const handleSendProductWhatsapp = async () => {
        if (!whatsappPhone || whatsappPhone.replace(/\D/g, '').length < 10) {
            return toast({ title: "Valid 10 digit phone number required", status: "warning" });
        }
        setIsWhatsappSending(true);
        try {
            const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
            const imgPath = whatsappProduct?.localImages?.[0] || whatsappProduct?.images?.[0] || whatsappProduct?.photos?.[0];
            let imgUrl = null;
            if (imgPath) {
                if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
                    imgUrl = imgPath;
                } else {
                    let cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
                    if (base.endsWith('/api') && cleanPath.startsWith('/api/')) cleanPath = cleanPath.slice(4);
                    imgUrl = `${base}${cleanPath}`;
                }
            }

            const caption = `🚀 *${whatsappProduct?.name?.toUpperCase()}*\n\n` +
                            `📦 *Category:* ${whatsappProduct?.category || 'General'}\n\n` +
                            `📝 *Description:*\n${whatsappProduct?.description || 'No description provided'}\n\n` +
                            `✅ *Quality Assured by Unique Lab Instrument*`;
            
            await api.post('/whatsapp/send-product', {
                phone: whatsappPhone,
                imageUrl: imgUrl,
                caption: caption
            });
            
            toast({ title: "Product sent on WhatsApp!", status: "success" });
            onWhatsappClose();
        } catch (e) {
            console.error(e);
            toast({ title: "Failed to send", description: e.response?.data?.error || e.message, status: "error" });
        } finally {
            setIsWhatsappSending(false);
        }
    };

    return (
        <Box
            p={{ base: 4, md: 6 }}
            bg="white"
            borderRadius="2xl"
            boxShadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        >
            <ModulePermissionBar moduleGroupKey="productsGroup" />
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={10} direction={{ base: 'column', md: 'row' }} gap={6}>
                <Stack spacing={1}>
                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                        Product Inventory
                    </Text>
                    <Text fontSize="sm" color="gray.500">Manage your industrial product catalog with ease.</Text>
                </Stack>
                <Flex gap={4} direction={{ base: 'column', sm: 'row' }} w={{ base: 'full', sm: 'auto' }} align={{ base: 'stretch', sm: 'center' }}>
                    <InputGroup maxW={{ base: 'full', sm: '300px' }} w="full">
                        <InputLeftElement pointerEvents='none' children={<FiSearch color='gray.300' />} />
                        <Input
                            placeholder='Search products...'
                            value={searchVal}
                            onChange={(e) => fetchProducts(e.target.value)}
                        />
                    </InputGroup>

                    {selectedProductIds.size > 0 && (
                        <Button
                            leftIcon={<FaWhatsapp />}
                            colorScheme="whatsapp"
                            size="md"
                            borderRadius="xl"
                            boxShadow="lg"
                            px={6}
                            w={{ base: 'full', sm: 'auto' }}
                            onClick={handleGlobalWhatsappOpen}
                        >
                            Send ({selectedProductIds.size}) to WhatsApp
                        </Button>
                    )}

                    <Button
                        leftIcon={<FiPlus />}
                        size="md"
                        borderRadius="xl"
                        boxShadow="lg"
                        px={8}
                        w={{ base: 'full', sm: 'auto' }}
                        isDisabled={!canWrite}
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ name: '', description: '', category: '', pdf: '', sellingPriceStart: '', sellingPriceEnd: '', dealerPrice: '', vendors: [], details: [], alternativeNames: [], stock: '', sizes: [], videoLinks: [] });
                            setFormErrors({});
                            setExistingPhotos([]);
                            setNewPhotos([]);
                            onOpen();
                        }}
                    >
                        Add Product
                    </Button>
                </Flex>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Flex>
            ) : (() => {
                const grouped = getGroupedAndSortedProducts();
                const categoriesWithProducts = [
                    ...PRODUCT_CATEGORIES,
                    "Unassigned Categories"
                ].filter(cat => grouped[cat] && grouped[cat].length > 0);

                if (categoriesWithProducts.length === 0) {
                    return (
                        <Flex p={20} flexDir="column" align="center" justify="center" bg="gray.50/50" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Box color="gray.300" mb={4}><FiPackage size={48} /></Box>
                            <Text color="gray.500">No products found in your inventory.</Text>
                        </Flex>
                    );
                }

                return categoriesWithProducts.map(categoryName => {
                    const list = grouped[categoryName];
                    const catSubs = (subcategories[categoryName] || []);

                    // All productIds assigned to any subcategory in this category
                    const subAssignedIds = new Set(catSubs.flatMap(s => s.productIds));

                    // Products NOT in any subcategory — shown as individual rows
                    const standaloneProducts = list.filter(p => !subAssignedIds.has(p._id || p.id));

                    // Total visible rows = standalone products + subcategory rows
                    const totalRows = standaloneProducts.length + catSubs.length;

                    return (
                        <Box key={categoryName} mb={8} bg="white" borderRadius="2xl" border="1px" borderColor="gray.150" boxShadow="sm" overflow="hidden">
                            {/* Category Header */}
                            <Flex bg="gray.50" px={6} py={4} align="center" justify="space-between" borderBottom="1px" borderColor="gray.100" wrap="wrap" gap={3}>
                                <Flex align="center" gap={3}>
                                    <Box p={2} bg="brand.50" color="brand.600" borderRadius="lg">
                                        <FiPackage size={18} />
                                    </Box>
                                    <Text fontWeight="800" fontSize="xs" color="gray.700" letterSpacing="wider">
                                        {categoryName === "Unassigned Categories" ? "UNASSIGNED CATEGORIES" : categoryName.toUpperCase()}
                                    </Text>
                                </Flex>
                                <HStack spacing={2} wrap="wrap" justify="flex-end">
                                    <Badge colorScheme="brand" variant="solid" borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                        {list.length} {list.length === 1 ? 'Product' : 'Products'}
                                    </Badge>
                                    {categoryName !== 'Unassigned Categories' && canWrite && (
                                        <Button
                                            size="xs"
                                            leftIcon={<FaLayerGroup />}
                                            colorScheme="purple"
                                            variant="outline"
                                            borderRadius="full"
                                            onClick={() => openSubManager(categoryName)}
                                        >
                                            + Subcategory
                                        </Button>
                                    )}
                                </HStack>
                            </Flex>

                            <Box overflowX="auto">
                                <Table variant="simple" minW="600px">
                                    <Thead bg="white">
                                        <Tr borderBottom="2px solid" borderBottomColor="gray.50">
                                            <Th width="40px" py={4}></Th>
                                            <Th py={4}>Product Info</Th>
                                            {canShowVendors && <Th py={4}>Vendor</Th>}
                                            {(canShowSellingPrice || canShowDealerPrice || canShowVendors) && <Th py={4}>Pricing</Th>}
                                            <Th py={4}>Videos</Th>
                                            {canShowStock && <Th py={4}>Stock</Th>}
                                            <Th py={4} textAlign="right">Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {/* ── Subcategory rows (appear first, styled with premium highlight) ── */}
                                        {catSubs.map(sub => {
                                            // Find the first assigned product that has a photo/image
                                            const assignedProducts = list.filter(p => sub.productIds.includes(p._id || p.id));
                                            const firstProductWithImage = assignedProducts.find(p => (p.localImages && p.localImages.length > 0) || (p.images && p.images.length > 0) || (p.photos && p.photos.length > 0));
                                            const subImgPath = firstProductWithImage ? (firstProductWithImage.localImages?.[0] || firstProductWithImage.images?.[0] || firstProductWithImage.photos?.[0]) : null;

                                            return (
                                                <Tr
                                                    key={`sub-${sub.id}`}
                                                    bgGradient="linear(to-r, purple.50, indigo.50/40)"
                                                    borderLeft="4px solid"
                                                    borderLeftColor="purple.500"
                                                    _hover={{
                                                        bgGradient: "linear(to-r, purple.100, indigo.100/60)",
                                                        shadow: "inner"
                                                    }}
                                                    transition="all 0.2s ease"
                                                    cursor="pointer"
                                                    onClick={() => openSubViewer(categoryName, sub)}
                                                >
                                                    <Td onClick={(e) => e.stopPropagation()} width="40px" />
                                                    {/* Product Info — shows subcategory thumbnail image & name */}
                                                    <Td py={3}>
                                                        <Flex align="center" gap={3}>
                                                            {subImgPath ? (
                                                                <Image
                                                                    src={getImageUrl(subImgPath)}
                                                                    boxSize="40px"
                                                                    objectFit="contain"
                                                                    borderRadius="md"
                                                                    bg="white"
                                                                    boxShadow="sm"
                                                                    border="1px solid"
                                                                    borderColor="purple.200"
                                                                    fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23f1f5f9'/></svg>"
                                                                />
                                                            ) : (
                                                                <Box
                                                                    p={2.5}
                                                                    bgGradient="linear(to-br, purple.500, indigo.600)"
                                                                    color="white"
                                                                    borderRadius="xl"
                                                                    boxShadow="0 2px 6px rgba(128, 90, 213, 0.3)"
                                                                    flexShrink={0}
                                                                >
                                                                    <FiLayers size={18} />
                                                                </Box>
                                                            )}
                                                            <Stack spacing={0.5}>
                                                                <HStack spacing={2} align="center">
                                                                    <Text fontWeight="800" color="purple.900" fontSize="sm" letterSpacing="tight">
                                                                        {sub.name}
                                                                    </Text>
                                                                    <Badge
                                                                        colorScheme="purple"
                                                                        variant="solid"
                                                                        borderRadius="full"
                                                                        fontSize="10px"
                                                                        px={2.5}
                                                                        py={0.5}
                                                                        fontWeight="extrabold"
                                                                        boxShadow="sm"
                                                                    >
                                                                        {sub.productIds.length} {sub.productIds.length === 1 ? 'PRODUCT' : 'PRODUCTS'}
                                                                    </Badge>
                                                                </HStack>
                                                                <HStack spacing={1} align="center">
                                                                    <Badge variant="outline" colorScheme="purple" fontSize="9px" px={1.5} py={0} borderRadius="md" fontWeight="bold">
                                                                        SUBCATEGORY
                                                                    </Badge>
                                                                    <Text fontSize="10px" color="purple.600" fontWeight="600">
                                                                        • Click to view assigned products
                                                                    </Text>
                                                                </HStack>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>
                                                {/* All data columns empty for subcategory rows */}
                                                {canShowVendors && <Td />}
                                                {(canShowSellingPrice || canShowDealerPrice || canShowVendors) && <Td />}
                                                <Td />
                                                {canShowStock && <Td />}
                                                {/* Actions: Edit subcategory + Delete subcategory */}
                                                <Td textAlign="right" onClick={e => e.stopPropagation()}>
                                                    <Stack direction="row" spacing={1} justify="flex-end">
                                                        <IconButton
                                                            size="sm"
                                                            variant="solid"
                                                            bg="purple.100"
                                                            color="purple.700"
                                                            icon={<FiEdit2 />}
                                                            aria-label="Edit Subcategory"
                                                            title="Edit subcategory"
                                                            _hover={{ color: 'white', bg: 'purple.600' }}
                                                            isDisabled={!canWrite}
                                                            borderRadius="lg"
                                                            onClick={() => openSubManager(categoryName, sub)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            variant="solid"
                                                            bg="red.100"
                                                            color="red.700"
                                                            icon={<FiTrash2 />}
                                                            aria-label="Delete Subcategory"
                                                            title="Delete subcategory"
                                                            _hover={{ color: 'white', bg: 'red.600' }}
                                                            isDisabled={!canWrite}
                                                            borderRadius="lg"
                                                            onClick={() => handleSubDeleteClick(categoryName, sub)}
                                                        />
                                                    </Stack>
                                                </Td>
                                            </Tr>
                                        );
                                    })}

                                        {/* ── Standalone product rows (not in any subcategory) ── */}
                                        {standaloneProducts.map((product) => (
                                            <Tr key={product._id || product.id} _hover={{ bg: 'gray.50/50' }} transition="0.2s">
                                                <Td onClick={(e) => e.stopPropagation()} width="40px">
                                                    <Checkbox
                                                        isChecked={selectedProductIds.has(product._id || product.id)}
                                                        onChange={() => toggleProductSelection(product._id || product.id)}
                                                        colorScheme="green"
                                                        size="lg"
                                                    />
                                                </Td>
                                                <Td>
                                                    <Flex align="center" gap={4}>
                                                        <Image
                                                            src={getImageUrl(product.localImages?.[0] || product.images?.[0] || product.photos?.[0])}
                                                            boxSize="40px"
                                                            objectFit="contain"
                                                            borderRadius="md"
                                                            bg="white"
                                                            boxShadow="sm"
                                                            fallbackSrc='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f7fafc"/><path d="M20,38 L30,28 L40,38" stroke="%23cbd5e0" stroke-width="3" fill="none"/><circle cx="38" cy="24" r="3" fill="%23cbd5e0"/><rect x="15" y="15" width="30" height="30" rx="4" stroke="%23cbd5e0" stroke-width="3" fill="none"/></svg>'
                                                        />
                                                        <Stack spacing={0}>
                                                            <Text fontWeight="700" color="gray.800">{product.name}</Text>
                                                            <Text fontSize="xs" color="blue.500" fontWeight="600" mt={1}>{product.category}</Text>
                                                            <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="200px">
                                                                {product.description || 'No description provided'}
                                                            </Text>
                                                        </Stack>
                                                    </Flex>
                                                </Td>
                                                {canShowVendors && (
                                                    <Td>
                                                        <Flex wrap="wrap" gap={1} maxW="150px">
                                                            {Array.isArray(product.vendors) && product.vendors.length > 0 ? (
                                                                product.vendors.map((v, i) => (
                                                                    <Badge key={i} variant="subtle" colorScheme="blue" borderRadius="full" px={2} fontSize="10px">
                                                                        {v.name || 'N/A'}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <Badge variant="subtle" colorScheme="blue" borderRadius="full" px={3}>
                                                                    {product.vendor || 'N/A'}
                                                                </Badge>
                                                            )}
                                                        </Flex>
                                                    </Td>
                                                )}
                                                {(canShowSellingPrice || canShowDealerPrice || canShowVendors) && (
                                                    <Td>
                                                        <Stack spacing={0}>
                                                            {canShowSellingPrice && <Text fontWeight="bold" color="brand.600">Sell: ₹{product.sellingPriceStart} - {product.sellingPriceEnd || 'N/A'}</Text>}
                                                            {canShowDealerPrice && <Text fontSize="xs" color="blue.500">Dealer: ₹{product.dealerPrice || 'N/A'}</Text>}
                                                            {canShowVendors && (
                                                                <Flex direction="column" gap={1} mt={1}>
                                                                    {Array.isArray(product.vendors) && product.vendors.length > 0 ? (
                                                                        product.vendors.map((v, i) => (
                                                                            <Text key={i} fontSize="xs" color="gray.500">
                                                                                {v.name || 'Unknown'}: ₹{v.price ?? '0'}
                                                                            </Text>
                                                                        ))
                                                                    ) : (
                                                                        <Text fontSize="xs" color="gray.400">Buy: ₹{product.purchasePrice ?? '0'}</Text>
                                                                    )}
                                                                </Flex>
                                                            )}
                                                        </Stack>
                                                    </Td>
                                                )}
                                                <Td>
                                                    {((product.localVideos && product.localVideos.length > 0) || (product.videoLinks && product.videoLinks.length > 0)) ? (
                                                        <Badge colorScheme="purple" borderRadius="md" px={2} py={1} display="inline-flex" alignItems="center" gap={1}>
                                                            <FiPlay size={10} />
                                                            {((product.localVideos?.length || 0) + (product.videoLinks?.length || 0))} Videos
                                                        </Badge>
                                                    ) : (
                                                        <Badge colorScheme="gray" variant="subtle" borderRadius="md" px={2} py={1}>
                                                            None
                                                        </Badge>
                                                    )}
                                                </Td>
                                                {canShowStock && (
                                                    <Td>
                                                        <Badge colorScheme={product.stock > 0 ? "green" : "red"} borderRadius="md" px={2} py={1}>
                                                            {product.stock ?? 0}
                                                        </Badge>
                                                    </Td>
                                                )}
                                                <Td textAlign="right">
                                                    <Stack direction="row" spacing={2} justify="flex-end">
                                                        <IconButton
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<FiEdit2 />}
                                                            aria-label="Edit"
                                                            _hover={{ color: 'brand.500', bg: 'brand.50' }}
                                                            isDisabled={!canWrite}
                                                            onClick={() => handleEdit(product)}
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            variant="ghost"
                                                            icon={<FiTrash2 />}
                                                            colorScheme="red"
                                                            aria-label="Delete"
                                                            _hover={{ color: 'red.500', bg: 'red.50' }}
                                                            isDisabled={!canWrite}
                                                            onClick={() => handleDeleteClick(product)}
                                                        />
                                                    </Stack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    );
                });

            })()}

            {/* Premium Add/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '4xl' }} scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent as="form" onSubmit={handleSubmit} borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                    <ModalHeader p={0}>
                        <Box
                            bgGradient="linear(to-r, brand.600, brand.800)"
                            p={6}
                            color="white"
                        >
                            <Flex align="center" gap={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg">
                                    {editingProduct ? <FiEdit2 /> : <FiPlus />}
                                </Box>
                                <Stack spacing={0}>
                                    <Text fontSize="xl" fontWeight="800">
                                        {editingProduct ? 'Update Product Details' : 'Onboard New Product'}
                                    </Text>
                                    <Text fontSize="xs" color="whiteAlpha.700">Fill in all mandatory technical and commercial parameters.</Text>
                                </Stack>
                            </Flex>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={6} right={6} />

                    <ModalBody p={8} bg="gray.50/30">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                            {/* Left Column: Basic Info & Pricing */}
                            <Stack spacing={6}>
                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" gap={2} mb={4} color="brand.600">
                                        <FiInfo /> <Text fontWeight="700" fontSize="sm">BASIC INFORMATION</Text>
                                    </Flex>
                                    <Stack spacing={4}>
                                        <FormControl isRequired isInvalid={!!formErrors.name}>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">PRODUCT NAME</FormLabel>
                                            <Input
                                                variant="filled"
                                                placeholder="e.g. Centrifugal Pump X1"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, name: e.target.value });
                                                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                                                }}
                                            />
                                            <FormErrorMessage size="xs">{formErrors.name}</FormErrorMessage>
                                        </FormControl>

                                        <FormControl isInvalid={!!formErrors.category}>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">CATEGORY</FormLabel>
                                            <Select
                                                variant="filled"
                                                placeholder="Select Category"
                                                value={formData.category}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, category: e.target.value });
                                                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                                                }}
                                            >
                                                {PRODUCT_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </Select>
                                            <FormErrorMessage size="xs">{formErrors.category}</FormErrorMessage>
                                        </FormControl>

                                        <FormControl>
                                            <Flex justify="space-between" align="center" mb={2}>
                                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500" mb={0}>ALTERNATIVE NAMES</FormLabel>
                                                <Button size="sm" colorScheme="blue" variant="outline" onClick={() => setFormData({ ...formData, alternativeNames: [...formData.alternativeNames, ''] })}>
                                                    + Add Name
                                                </Button>
                                            </Flex>
                                            <Stack spacing={2}>
                                                {formData.alternativeNames.map((altName, index) => (
                                                    <Flex key={index} gap={2}>
                                                        <Input
                                                            size="sm"
                                                            value={altName}
                                                            onChange={(e) => {
                                                                const newAltNames = [...formData.alternativeNames];
                                                                newAltNames[index] = e.target.value;
                                                                setFormData({ ...formData, alternativeNames: newAltNames });
                                                            }}
                                                            placeholder="Alias / Model No."
                                                        />
                                                        <IconButton
                                                            size="sm"
                                                            icon={<FiTrash2 />}
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                const newAltNames = formData.alternativeNames.filter((_, i) => i !== index);
                                                                setFormData({ ...formData, alternativeNames: newAltNames });
                                                            }}
                                                        />
                                                    </Flex>
                                                ))}
                                            </Stack>
                                        </FormControl>

                                        <FormControl isInvalid={!!formErrors.description}>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500">DESCRIPTION</FormLabel>
                                            <Textarea
                                                variant="filled"
                                                rows={4}
                                                placeholder="Key features and applications..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                            <FormErrorMessage size="xs">{formErrors.description}</FormErrorMessage>
                                        </FormControl>

                                        {/* Product Sizes / Variations */}
                                        <Box border="1px dashed" borderColor="purple.200" p={4} borderRadius="xl" bg="purple.50/50" mt={2}>
                                            <Flex justify="space-between" align="center" mb={3}>
                                                <HStack spacing={2} color="purple.700">
                                                    <FiPackage size={16} />
                                                    <Text fontSize="xs" fontWeight="700" letterSpacing="wider">PRODUCT SIZES & STOCK</Text>
                                                </HStack>
                                                <Button
                                                    size="xs"
                                                    colorScheme="purple"
                                                    variant="solid"
                                                    leftIcon={<FiPlus />}
                                                    onClick={() => {
                                                        const newSizes = [...(formData.sizes || []), { size: '', purchasePrice: '', stock: '' }];
                                                        const accumulatedStock = newSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
                                                        setFormData({
                                                            ...formData,
                                                            sizes: newSizes,
                                                            stock: accumulatedStock > 0 ? accumulatedStock : formData.stock
                                                        });
                                                    }}
                                                >
                                                    + Add Size
                                                </Button>
                                            </Flex>

                                            <Stack spacing={3}>
                                                <AnimatePresence>
                                                    {(formData.sizes || []).map((sItem, sIdx) => (
                                                        <motion.div
                                                            key={sIdx}
                                                            initial={{ opacity: 0, y: -8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                        >
                                                            <Flex gap={2} align="flex-end">
                                                                <FormControl flex={1.2}>
                                                                    <FormLabel fontSize="10px" color="gray.600" mb={1} fontWeight="bold">SIZE</FormLabel>
                                                                    <Input
                                                                        size="sm"
                                                                        variant="filled"
                                                                        bg="white"
                                                                        placeholder="e.g. 10mm"
                                                                        value={sItem.size}
                                                                        onChange={(e) => {
                                                                            const nextSizes = [...formData.sizes];
                                                                            nextSizes[sIdx].size = e.target.value;
                                                                            setFormData({ ...formData, sizes: nextSizes });
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormControl flex={1}>
                                                                    <FormLabel fontSize="10px" color="gray.600" mb={1} fontWeight="bold">PURCHASE PRICE</FormLabel>
                                                                    <InputGroup size="sm">
                                                                        <InputLeftElement pointerEvents='none' children={<Text fontSize="xs" color="gray.400">₹</Text>} />
                                                                        <Input
                                                                            type="number"
                                                                            onWheel={(e) => e.target.blur()}
                                                                            min={0}
                                                                            variant="filled"
                                                                            bg="white"
                                                                            placeholder="Price"
                                                                            value={sItem.purchasePrice}
                                                                            onChange={(e) => {
                                                                                const nextSizes = [...formData.sizes];
                                                                                nextSizes[sIdx].purchasePrice = e.target.value;
                                                                                setFormData({ ...formData, sizes: nextSizes });
                                                                            }}
                                                                        />
                                                                    </InputGroup>
                                                                </FormControl>
                                                                <FormControl flex={1}>
                                                                    <FormLabel fontSize="10px" color="gray.600" mb={1} fontWeight="bold">STOCK</FormLabel>
                                                                    <Input
                                                                        type="number"
                                                                        onWheel={(e) => e.target.blur()}
                                                                        min={0}
                                                                        size="sm"
                                                                        variant="filled"
                                                                        bg="white"
                                                                        placeholder="Qty"
                                                                        value={sItem.stock}
                                                                        onChange={(e) => {
                                                                            const nextSizes = [...formData.sizes];
                                                                            nextSizes[sIdx].stock = e.target.value;
                                                                            const accum = nextSizes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
                                                                            setFormData({ ...formData, sizes: nextSizes, stock: accum });
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <IconButton
                                                                    size="sm"
                                                                    icon={<FiTrash2 />}
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        const nextSizes = formData.sizes.filter((_, idx) => idx !== sIdx);
                                                                        const accum = nextSizes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
                                                                        setFormData({ ...formData, sizes: nextSizes, stock: accum });
                                                                    }}
                                                                />
                                                            </Flex>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                                {(!formData.sizes || formData.sizes.length === 0) && (
                                                    <Text fontSize="xs" color="gray.400" textAlign="center">
                                                        No size variations added. Click "+ Add Size" if this product has size options.
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* ISI Removed */}
                                    </Stack>
                                </Box>

                                {(canShowSellingPrice || canShowDealerPrice || canShowStock || canShowVendors) && (
                                    <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                        <Flex align="center" gap={2} mb={4} color="brand.600">
                                            <FiDollarSign /> <Text fontWeight="700" fontSize="sm">COMMERCIALS</Text>
                                        </Flex>
                                        <Stack spacing={4}>
                                            {canShowSellingPrice && (
                                                <SimpleGrid columns={2} spacing={4}>
                                                    <FormControl isInvalid={!!formErrors.sellingPriceStart}>
                                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.500">SELLING PRICE (START)</FormLabel>
                                                        <InputGroup size="md">
                                                            <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                            <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.sellingPriceStart} onChange={(e) => {
                                                                setFormData({ ...formData, sellingPriceStart: e.target.value });
                                                                if (formErrors.sellingPriceStart) setFormErrors({ ...formErrors, sellingPriceStart: '' });
                                                            }} />
                                                        </InputGroup>
                                                        <FormErrorMessage fontSize="10px">{formErrors.sellingPriceStart}</FormErrorMessage>
                                                    </FormControl>
                                                    <FormControl isInvalid={!!formErrors.sellingPriceEnd}>
                                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.500">SELLING PRICE (END)</FormLabel>
                                                        <InputGroup size="md">
                                                            <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                            <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.sellingPriceEnd} onChange={(e) => {
                                                                setFormData({ ...formData, sellingPriceEnd: e.target.value });
                                                                if (formErrors.sellingPriceEnd) setFormErrors({ ...formErrors, sellingPriceEnd: '' });
                                                            }} />
                                                        </InputGroup>
                                                        <FormErrorMessage fontSize="10px">{formErrors.sellingPriceEnd}</FormErrorMessage>
                                                    </FormControl>
                                                </SimpleGrid>
                                            )}
                                            {canShowDealerPrice && (
                                                <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                                                    <FormControl isInvalid={!!formErrors.dealerPrice}>
                                                        <FormLabel fontSize="xs" fontWeight="700" color="gray.500">DEALER PRICE</FormLabel>
                                                        <InputGroup size="md">
                                                            <InputLeftElement pointerEvents='none' children={<Text fontSize="sm" color="gray.400">₹</Text>} />
                                                            <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={formData.dealerPrice} onChange={(e) => {
                                                                setFormData({ ...formData, dealerPrice: e.target.value });
                                                                if (formErrors.dealerPrice) setFormErrors({ ...formErrors, dealerPrice: '' });
                                                            }} />
                                                        </InputGroup>
                                                        <FormErrorMessage fontSize="10px">{formErrors.dealerPrice}</FormErrorMessage>
                                                    </FormControl>
                                                </SimpleGrid>
                                            )}

                                            {canShowStock && (
                                                <FormControl isInvalid={!!formErrors.stock}>
                                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.500">INVENTORY STOCK</FormLabel>
                                                    <InputGroup size="md">
                                                        <InputLeftElement pointerEvents='none' children={<Box as={FiPackage} color="gray.400" />} />
                                                        <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" placeholder="e.g. 10" value={formData.stock} onChange={(e) => {
                                                            setFormData({ ...formData, stock: e.target.value });
                                                            if (formErrors.stock) setFormErrors({ ...formErrors, stock: '' });
                                                        }} />
                                                    </InputGroup>
                                                    <FormErrorMessage fontSize="10px">{formErrors.stock}</FormErrorMessage>
                                                </FormControl>
                                            )}

                                            {canShowVendors && (
                                                <Box border="1px dashed" borderColor="gray.200" p={4} borderRadius="xl" bg="gray.50">
                                                    <Flex justify="space-between" align="center" mb={4}>
                                                        <Text fontSize="sm" fontWeight="bold" color="brand.600">Vendors & Purchase Prices</Text>
                                                        <Button size="sm" colorScheme="brand" variant="outline" onClick={() => {
                                                            setFormData(prev => ({ ...prev, vendors: [...prev.vendors, { name: '', price: '' }] }));
                                                        }}>
                                                        + Add
                                                    </Button>
                                                </Flex>

                                                <Stack spacing={3}>
                                                    <AnimatePresence>
                                                        {formData.vendors.map((v, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                            >
                                                                <Flex gap={3} align="flex-start">
                                                                    <FormControl flex={1}>
                                                                        <FormLabel fontSize="10px" color="gray.500">VENDOR NAME</FormLabel>
                                                                        <Input size="sm" variant="filled" placeholder="Vendor Name" value={v.name} onChange={(e) => {
                                                                            const newVendors = [...formData.vendors];
                                                                            newVendors[index].name = e.target.value;
                                                                            setFormData({ ...formData, vendors: newVendors });
                                                                        }} />
                                                                    </FormControl>
                                                                    <FormControl flex={1} isInvalid={!!formErrors[`vendor_price_${index}`]}>
                                                                        <FormLabel fontSize="10px" color="gray.500">PURCHASE PRICE</FormLabel>
                                                                        <InputGroup size="sm">
                                                                            <InputLeftElement pointerEvents='none' children={<Text fontSize="xs" color="gray.400">₹</Text>} />
                                                                            <Input type="number" onWheel={(e) => e.target.blur()} min={0} variant="filled" value={v.price} onChange={(e) => {
                                                                                const newVendors = [...formData.vendors];
                                                                                newVendors[index].price = e.target.value;
                                                                                setFormData({ ...formData, vendors: newVendors });
                                                                                if (formErrors[`vendor_price_${index}`]) {
                                                                                    setFormErrors(prev => ({ ...prev, [`vendor_price_${index}`]: '' }));
                                                                                }
                                                                            }} />
                                                                        </InputGroup>
                                                                        <FormErrorMessage fontSize="10px">{formErrors[`vendor_price_${index}`]}</FormErrorMessage>
                                                                    </FormControl>
                                                                    <IconButton
                                                                        mt={6}
                                                                        size="sm"
                                                                        icon={<FiTrash2 />}
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            const newVendors = formData.vendors.filter((_, i) => i !== index);
                                                                            setFormData({ ...formData, vendors: newVendors });
                                                                        }}
                                                                    />
                                                                </Flex>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    {formData.vendors.length === 0 && (
                                                        <Text fontSize="xs" color="gray.400" textAlign="center">No vendors added yet.</Text>
                                                    )}
                                                </Stack>
                                            </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>


                            {/* Right Column: Photos & Specs */}
                            <Stack spacing={6}>
                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Flex align="center" gap={2} color={formErrors.images ? "red.500" : "brand.600"}>
                                            <FiImage /> <Text fontWeight="700" fontSize="sm">IMAGE GALLERY</Text>
                                        </Flex>
                                        <Badge colorScheme={formErrors.images ? "red" : "blue"} variant="subtle" borderRadius="md">
                                            {existingPhotos.length + newPhotos.length} IMAGES
                                        </Badge>
                                    </Flex>
                                    {formErrors.images && <Text color="red.500" fontSize="xs" mb={2} fontWeight="bold">{formErrors.images}</Text>}

                                    <SimpleGrid columns={3} spacing={3} mb={4}>
                                        {/* File Upload Box */}
                                        <label style={{ cursor: 'pointer' }}>
                                            <Flex
                                                h="80px"
                                                border="2px dashed"
                                                borderColor="brand.200"
                                                borderRadius="xl"
                                                align="center"
                                                justify="center"
                                                color="brand.500"
                                                _hover={{ bg: 'brand.50', borderColor: 'brand.400' }}
                                                transition="0.2s"
                                            >
                                                <FiUpload size={20} />
                                            </Flex>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        {/* Image Previews */}
                                        <AnimatePresence>
                                            {existingPhotos.map((photo, index) => (
                                                <motion.div
                                                    key={`existing-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Image src={getImageUrl(photo)} h="80px" w="full" objectFit="contain" bg="white" borderRadius="xl" />
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeExistingPhoto(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                            {newPhotos.map((file, index) => (
                                                <motion.div
                                                    key={`new-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Box h="80px" w="full" bg="brand.50" borderRadius="xl" border="1px" borderColor="brand.200" overflow="hidden">
                                                        <Flex h="full" align="center" justify="center" flexDir="column" gap={1}>
                                                            <FiImage size={16} color="brand.500" />
                                                            <Text fontSize="8px" fontWeight="bold" noOfLines={1} px={2} textAlign="center">{file.name}</Text>
                                                        </Flex>
                                                    </Box>
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeNewPhoto(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </SimpleGrid>
                                    {existingPhotos.length + newPhotos.length === 0 && (
                                        <Text fontSize="xs" color="gray.400" textAlign="center" py={4} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                                            No images uploaded. At least 1 is required.
                                        </Text>
                                    )}
                                </Box>

                                {/* Local Videos & Video Links Section */}
                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Flex align="center" gap={2} color="brand.600">
                                            <FiPlay /> <Text fontWeight="700" fontSize="sm">LOCAL VIDEO UPLOADS</Text>
                                        </Flex>
                                        <Badge colorScheme="blue" variant="subtle" borderRadius="md">
                                            {existingVideos.length + newVideos.length} VIDEOS
                                        </Badge>
                                    </Flex>

                                    <SimpleGrid columns={3} spacing={3} mb={4}>
                                        {/* Video Upload Box */}
                                        <label style={{ cursor: 'pointer' }}>
                                            <Flex
                                                h="80px"
                                                border="2px dashed"
                                                borderColor="brand.200"
                                                borderRadius="xl"
                                                align="center"
                                                justify="center"
                                                color="brand.500"
                                                _hover={{ bg: 'brand.50', borderColor: 'brand.400' }}
                                                transition="0.2s"
                                            >
                                                <FiUpload size={20} />
                                            </Flex>
                                            <input
                                                type="file"
                                                multiple
                                                accept="video/*"
                                                onChange={handleVideoFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>

                                        {/* Video Previews */}
                                        <AnimatePresence>
                                            {existingVideos.map((video, index) => (
                                                <motion.div
                                                    key={`existing-video-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Box h="80px" w="full" bg="gray.100" borderRadius="xl" border="1px" borderColor="gray.300" overflow="hidden">
                                                        <Flex h="full" align="center" justify="center" flexDir="column" gap={1}>
                                                            <FiPlay size={16} color="brand.500" />
                                                            <Text fontSize="8px" fontWeight="bold" noOfLines={1} px={2} textAlign="center">
                                                                {video.split('/').pop()}
                                                            </Text>
                                                        </Flex>
                                                    </Box>
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeExistingVideo(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                            {newVideos.map((file, index) => (
                                                <motion.div
                                                    key={`new-video-${index}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <Box h="80px" w="full" bg="brand.50" borderRadius="xl" border="1px" borderColor="brand.200" overflow="hidden">
                                                        <Flex h="full" align="center" justify="center" flexDir="column" gap={1}>
                                                            <FiPlay size={16} color="brand.500" />
                                                            <Text fontSize="8px" fontWeight="bold" noOfLines={1} px={2} textAlign="center">{file.name}</Text>
                                                        </Flex>
                                                    </Box>
                                                    <IconButton
                                                        size="xs"
                                                        position="absolute"
                                                        top={1}
                                                        right={1}
                                                        icon={<FiTrash2 />}
                                                        colorScheme="red"
                                                        borderRadius="full"
                                                        onClick={() => removeNewVideo(index)}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </SimpleGrid>
                                    {existingVideos.length + newVideos.length === 0 && (
                                        <Text fontSize="xs" color="gray.400" textAlign="center" py={4} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                                            No local videos uploaded.
                                        </Text>
                                    )}
                                </Box>

                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <FormControl>
                                        <Flex align="center" justify="space-between" mb={2}>
                                            <FormLabel fontSize="xs" fontWeight="700" color="gray.500" mb={0}>VIDEO LINKS (YOUTUBE, ETC.)</FormLabel>
                                            <Button size="xs" colorScheme="brand" variant="outline" onClick={() => setFormData({ ...formData, videoLinks: [...(formData.videoLinks || []), ''] })}>
                                                + ADD LINK
                                            </Button>
                                        </Flex>
                                        <Stack spacing={2}>
                                            {(formData.videoLinks || []).map((link, index) => (
                                                <Flex key={index} gap={2}>
                                                    <Input
                                                        variant="filled"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                        value={link}
                                                        onChange={(e) => {
                                                            const newLinks = [...formData.videoLinks];
                                                            newLinks[index] = e.target.value;
                                                            setFormData({ ...formData, videoLinks: newLinks });
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="sm"
                                                        colorScheme="red"
                                                        icon={<FiTrash2 />}
                                                        onClick={() => {
                                                            const newLinks = formData.videoLinks.filter((_, i) => i !== index);
                                                            setFormData({ ...formData, videoLinks: newLinks });
                                                        }}
                                                    />
                                                </Flex>
                                            ))}
                                        </Stack>
                                    </FormControl>
                                </Box>

                                <Box bg="white" p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
                                    <Flex align="center" justify="space-between" mb={4}>
                                        <Flex align="center" gap={2} color={formErrors.details ? "red.500" : "brand.600"}>
                                            <FiSettings /> <Text fontWeight="700" fontSize="sm">TECHNICAL DEEP-DIVE</Text>
                                        </Flex>
                                        <Button size="sm" colorScheme="brand" variant="solid" onClick={addDetailRow}>
                                            + ADD SPECIFICATION
                                        </Button>
                                    </Flex>
                                    {formErrors.details && <Text color="red.500" fontSize="xs" mb={3} fontWeight="bold">{formErrors.details}</Text>}

                                    <Stack spacing={3} maxH="300px" overflowY="auto" pr={2}>
                                        <AnimatePresence>
                                            {formData.details.map((detail, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                >
                                                    <Flex gap={2} bg="gray.50" p={2} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                        <Input
                                                            size="sm"
                                                            variant="unstyled"
                                                            placeholder="Prop (e.g. RPM)"
                                                            px={2}
                                                            fontWeight="700"
                                                            value={detail.key}
                                                            onChange={(e) => updateDetailRow(index, 'key', e.target.value)}
                                                        />
                                                        <Box w="1px" bg="gray.200" my={1} />
                                                        <Input
                                                            size="sm"
                                                            variant="unstyled"
                                                            placeholder="Value (e.g. 1500)"
                                                            px={2}
                                                            value={detail.value}
                                                            onChange={(e) => updateDetailRow(index, 'value', e.target.value)}
                                                        />
                                                        <IconButton
                                                            size="xs"
                                                            variant="ghost"
                                                            icon={<FiTrash2 />}
                                                            colorScheme="red"
                                                            onClick={() => removeDetailRow(index)}
                                                        />
                                                    </Flex>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {formData.details.length === 0 && (
                                            <Text fontSize="xs" color="gray.400" textAlign="center" py={8} border="1px dashed" borderColor="gray.200" borderRadius="lg">
                                                Click "ADD SPECIFICATION" to define product attributes.
                                            </Text>
                                        )}
                                    </Stack>
                                </Box>
                                <FormControl>
                                    <FormLabel fontSize="xs" fontWeight="700" color="gray.500">PDF BROCHURE LINK</FormLabel>
                                    <Input variant="filled" placeholder="https://..." value={formData.pdf} onChange={(e) => setFormData({ ...formData, pdf: e.target.value })} />
                                </FormControl>
                            </Stack>
                        </SimpleGrid>
                    </ModalBody>

                    <Box p={8} bg="white" borderTop="1px" borderColor="gray.100">
                        <SimpleGrid columns={2} spacing={4}>
                            <Button variant="outline" size="lg" borderRadius="xl" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                borderRadius="xl"
                                bgGradient="linear(to-r, brand.600, brand.700)"
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                loadingText={editingProduct ? 'Updating...' : 'Initializing...'}
                                isDisabled={isSubmitting || !canWrite}
                            >
                                {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                            </Button>
                        </SimpleGrid>
                    </Box>
                </ModalContent>
            </Modal >

            {/* WhatsApp Modal */}
            <Modal isOpen={isWhatsappOpen} onClose={onWhatsappClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
                <ModalContent borderRadius="xl" boxShadow="2xl">
                    <ModalHeader>Send Product To WhatsApp</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel fontWeight="600">Enter 10-Digit Mobile Number</FormLabel>
                            <Input 
                                placeholder="9876543210" 
                                value={whatsappPhone} 
                                onChange={(e) => setWhatsappPhone(e.target.value)} 
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>Example: 9876543210 (Country code '91' is added automatically)</Text>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onWhatsappClose}>Cancel</Button>
                        <Button 
                            bg="#25D366" 
                            color="white" 
                            _hover={{ bg: "#128C7E" }} 
                            isLoading={isWhatsappSending} 
                            onClick={handleSendProductWhatsapp}
                        >
                            Send Image & Desc
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
                <ModalContent borderRadius="xl" boxShadow="2xl">
                    <ModalHeader color="red.600">Confirm Deletion</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={4}>
                            Are you sure you want to delete <b>{productToDelete?.name}</b>?
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            This action cannot be undone. The product and all its associated data will be permanently removed.
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose} isDisabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete} isLoading={isDeleting}>
                            Delete Product
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Subcategory Deletion Confirmation Modal */}
            <Modal isOpen={isSubDeleteOpen} onClose={onSubDeleteClose} isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
                <ModalContent borderRadius="2xl" boxShadow="2xl" overflow="hidden">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4} bg="red.50/50">
                        <HStack spacing={3}>
                            <Box p={2} bg="red.100" color="red.600" borderRadius="xl">
                                <FiTrash2 size={18} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="800" fontSize="md" color="gray.800">
                                    Delete Subcategory
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    Confirm subcategory removal
                                </Text>
                            </VStack>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton top={4} right={4} />
                    <ModalBody py={6}>
                        <VStack align="start" spacing={3}>
                            <Text color="gray.700" fontSize="sm">
                                Are you sure you want to delete subcategory <Text as="span" fontWeight="extrabold" color="purple.700">"{subToDelete?.sub?.name}"</Text>?
                            </Text>
                            <Box bg="purple.50" p={3.5} borderRadius="xl" border="1px solid" borderColor="purple.100" w="full">
                                <Text fontSize="xs" color="purple.800" fontWeight="600">
                                    💡 <b>Note:</b> Assigned products will <b>not</b> be deleted. They will simply return to the main category view.
                                </Text>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                        <Button variant="ghost" mr={3} borderRadius="xl" onClick={onSubDeleteClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" borderRadius="xl" px={5} onClick={confirmSubDelete}>
                            Yes, Delete Subcategory
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Subcategory Manager Modal (Create / Edit) ── */}
            <Modal isOpen={isSubMgrOpen} onClose={onSubMgrClose} size="2xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" boxShadow="2xl" overflow="hidden">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, purple.600, purple.800)" p={5} color="white">
                            <HStack spacing={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg"><FaLayerGroup /></Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="lg" fontWeight="800">
                                        {subMgrEditing ? 'Edit Subcategory' : 'New Subcategory'}
                                    </Text>
                                    <Text fontSize="xs" color="purple.100">{subMgrCategory}</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={6} bg="gray.50">
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">Subcategory Name</FormLabel>
                                <Input
                                    variant="filled"
                                    placeholder="e.g. Concrete Testers, Soil Samplers..."
                                    value={subMgrName}
                                    onChange={(e) => setSubMgrName(e.target.value)}
                                    bg="white"
                                    fontWeight="600"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                    Select Products ({subMgrSelectedIds.length} selected) — only from "{subMgrCategory}"
                                </FormLabel>
                                <Box maxH="340px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="xl" bg="white" p={3}>
                                    {products
                                        .filter(p => {
                                            if (!subMgrCategory) return false;
                                            const found = PRODUCT_CATEGORIES.find(c => c.toLowerCase() === (p.category || '').toLowerCase());
                                            return found === subMgrCategory;
                                        })
                                        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                        .map(p => {
                                            const isChecked = subMgrSelectedIds.includes(p._id || p.id);
                                            return (
                                                <Flex
                                                    key={p._id || p.id}
                                                    align="center"
                                                    py={2}
                                                    px={3}
                                                    mb={1}
                                                    borderRadius="lg"
                                                    bg={isChecked ? 'purple.50' : 'transparent'}
                                                    border="1px solid"
                                                    borderColor={isChecked ? 'purple.200' : 'transparent'}
                                                    cursor="pointer"
                                                    _hover={{ bg: 'purple.50', borderColor: 'purple.200' }}
                                                    transition="all 0.15s"
                                                    onClick={() => {
                                                        const pid = p._id || p.id;
                                                        setSubMgrSelectedIds(prev =>
                                                            prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
                                                        );
                                                    }}
                                                    gap={3}
                                                >
                                                    <Checkbox
                                                        isChecked={isChecked}
                                                        colorScheme="purple"
                                                        pointerEvents="none"
                                                        borderColor="gray.300"
                                                    />
                                                    <Image
                                                        src={getImageUrl(p.localImages?.[0] || p.images?.[0])}
                                                        boxSize="32px"
                                                        objectFit="contain"
                                                        borderRadius="md"
                                                        bg="gray.100"
                                                        fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='32' height='32' fill='%23f1f5f9'/></svg>"
                                                    />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontSize="sm" fontWeight="700" color={isChecked ? 'purple.800' : 'gray.800'}>{p.name}</Text>
                                                        <Text fontSize="10px" color="gray.400">{p.category}</Text>
                                                    </VStack>
                                                </Flex>
                                            );
                                        })
                                    }
                                </Box>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="white" borderTop="1px solid" borderColor="gray.100">
                        <Button variant="ghost" mr={3} onClick={onSubMgrClose}>Cancel</Button>
                        <Button
                            bgGradient="linear(to-r, purple.600, purple.700)"
                            color="white"
                            _hover={{ bgGradient: 'linear(to-r, purple.700, purple.800)' }}
                            borderRadius="xl"
                            onClick={saveSubcategory}
                            isDisabled={!subMgrName.trim()}
                        >
                            {subMgrEditing ? 'Save Changes' : 'Create Subcategory'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ── Subcategory Viewer Modal (Browse products — full table) ── */}
            <Modal isOpen={isSubViewOpen} onClose={onSubViewClose} size="6xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" boxShadow="2xl" overflow="hidden">
                    <ModalHeader p={0}>
                        <Box bgGradient="linear(to-r, purple.600, purple.800)" p={5} color="white">
                            <HStack spacing={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg"><FiLayers size={20} /></Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="lg" fontWeight="800">{viewingSub?.name}</Text>
                                    <Text fontSize="xs" color="purple.200">{viewingSub?.categoryName} • {viewingSub?.productIds?.length || 0} Products</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </ModalHeader>
                    <ModalCloseButton color="white" top={4} right={4} />
                    <ModalBody p={0} bg="white">
                        {(() => {
                            const subProducts = products.filter(p => viewingSub?.productIds?.includes(p._id || p.id));
                            if (subProducts.length === 0) {
                                return (
                                    <Flex py={16} flexDir="column" align="center" justify="center" color="gray.400">
                                        <FiPackage size={40} />
                                        <Text mt={3} fontWeight="600">No products in this subcategory yet.</Text>
                                        <Button mt={4} size="sm" colorScheme="purple" variant="outline"
                                            onClick={() => { onSubViewClose(); openSubManager(viewingSub?.categoryName, viewingSub); }}>
                                            Edit Subcategory
                                        </Button>
                                    </Flex>
                                );
                            }
                            return (
                                <Box overflowX="auto">
                                    <Table variant="simple" minW="700px">
                                        <Thead bg="gray.50">
                                            <Tr borderBottom="2px solid" borderBottomColor="gray.100">
                                                <Th width="40px" py={4}></Th>
                                                <Th py={4} fontSize="xs" color="gray.500">Product Info</Th>
                                                {canShowVendors && <Th py={4} fontSize="xs" color="gray.500">Vendor</Th>}
                                                {(canShowSellingPrice || canShowDealerPrice || canShowVendors) && <Th py={4} fontSize="xs" color="gray.500">Pricing</Th>}
                                                <Th py={4} fontSize="xs" color="gray.500">Videos</Th>
                                                {canShowStock && <Th py={4} fontSize="xs" color="gray.500">Stock</Th>}
                                                <Th py={4} fontSize="xs" color="gray.500" textAlign="right">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {subProducts.map(product => (
                                                <Tr key={product._id || product.id} _hover={{ bg: 'purple.50' }} transition="0.15s">
                                                    <Td onClick={(e) => e.stopPropagation()} width="40px">
                                                        <Checkbox
                                                            isChecked={selectedProductIds.has(product._id || product.id)}
                                                            onChange={() => toggleProductSelection(product._id || product.id)}
                                                            colorScheme="green"
                                                            size="lg"
                                                        />
                                                    </Td>
                                                    {/* Product Info */}
                                                    <Td>
                                                        <Flex align="center" gap={4}>
                                                            <Image
                                                                src={getImageUrl(product.localImages?.[0] || product.images?.[0] || product.photos?.[0])}
                                                                boxSize="40px"
                                                                objectFit="contain"
                                                                borderRadius="md"
                                                                bg="white"
                                                                boxShadow="sm"
                                                                fallbackSrc='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f7fafc"/></svg>'
                                                            />
                                                            <Stack spacing={0}>
                                                                <Text fontWeight="700" color="gray.800" fontSize="sm">{product.name}</Text>
                                                                <Text fontSize="xs" color="purple.500" fontWeight="600" mt={0.5}>{product.category}</Text>
                                                                <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="220px">
                                                                    {product.description || 'No description'}
                                                                </Text>
                                                            </Stack>
                                                        </Flex>
                                                    </Td>

                                                    {/* Vendor */}
                                                    {canShowVendors && (
                                                        <Td>
                                                            <Flex wrap="wrap" gap={1} maxW="130px">
                                                                {Array.isArray(product.vendors) && product.vendors.length > 0 ? (
                                                                    product.vendors.map((v, i) => (
                                                                        <Badge key={i} variant="subtle" colorScheme="blue" borderRadius="full" px={2} fontSize="10px">{v.name || 'N/A'}</Badge>
                                                                    ))
                                                                ) : (
                                                                    <Badge variant="subtle" colorScheme="blue" borderRadius="full" px={3}>{product.vendor || 'N/A'}</Badge>
                                                                )}
                                                            </Flex>
                                                        </Td>
                                                    )}

                                                    {/* Pricing */}
                                                    {(canShowSellingPrice || canShowDealerPrice || canShowVendors) && (
                                                        <Td>
                                                            <Stack spacing={0}>
                                                                {canShowSellingPrice && <Text fontWeight="bold" color="brand.600" fontSize="sm">Sell: ₹{product.sellingPriceStart} - {product.sellingPriceEnd || 'N/A'}</Text>}
                                                                {canShowDealerPrice && <Text fontSize="xs" color="blue.500">Dealer: ₹{product.dealerPrice || 'N/A'}</Text>}
                                                                {canShowVendors && (
                                                                    Array.isArray(product.vendors) && product.vendors.length > 0 ? (
                                                                        product.vendors.map((v, i) => (
                                                                            <Text key={i} fontSize="xs" color="gray.500">{v.name || 'Unknown'}: ₹{v.price ?? '0'}</Text>
                                                                        ))
                                                                    ) : (
                                                                        <Text fontSize="xs" color="gray.400">Buy: ₹{product.purchasePrice ?? '0'}</Text>
                                                                    )
                                                                )}
                                                            </Stack>
                                                        </Td>
                                                    )}

                                                    {/* Videos */}
                                                    <Td>
                                                        {((product.localVideos && product.localVideos.length > 0) || (product.videoLinks && product.videoLinks.length > 0)) ? (
                                                            <Badge colorScheme="purple" borderRadius="md" px={2} py={1} display="inline-flex" alignItems="center" gap={1}>
                                                                <FiPlay size={10} />
                                                                {((product.localVideos?.length || 0) + (product.videoLinks?.length || 0))} Videos
                                                            </Badge>
                                                        ) : (
                                                            <Badge colorScheme="gray" variant="subtle" borderRadius="md" px={2} py={1}>None</Badge>
                                                        )}
                                                    </Td>

                                                    {/* Stock */}
                                                    {canShowStock && (
                                                        <Td>
                                                            <Badge colorScheme={product.stock > 0 ? "green" : "red"} borderRadius="md" px={2} py={1}>
                                                                {product.stock ?? 0}
                                                            </Badge>
                                                        </Td>
                                                    )}

                                                    {/* Actions */}
                                                    <Td textAlign="right">
                                                        <Stack direction="row" spacing={2} justify="flex-end">
                                                            <IconButton
                                                                size="sm"
                                                                variant="ghost"
                                                                icon={<FiEdit2 />}
                                                                aria-label="Edit Product"
                                                                title="Edit product"
                                                                _hover={{ color: 'brand.500', bg: 'brand.50' }}
                                                                isDisabled={!canWrite}
                                                                onClick={() => { onSubViewClose(); handleEdit(product); }}
                                                            />
                                                            <IconButton
                                                                size="sm"
                                                                variant="ghost"
                                                                icon={<FiTrash2 />}
                                                                colorScheme="red"
                                                                aria-label="Delete Product"
                                                                title="Delete product"
                                                                _hover={{ color: 'red.500', bg: 'red.50' }}
                                                                isDisabled={!canWrite}
                                                                onClick={() => { onSubViewClose(); handleDeleteClick(product); }}
                                                            />
                                                        </Stack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            );
                        })()}
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" justify="space-between">
                        <Text fontSize="xs" color="gray.500" fontWeight="600">{(viewingSub?.productIds?.length || 0)} products in <b>{viewingSub?.name}</b></Text>
                        <HStack>
                            {canWrite && (
                                <Button size="sm" colorScheme="purple" variant="outline" leftIcon={<FiEdit2 />}
                                    onClick={() => { onSubViewClose(); openSubManager(viewingSub?.categoryName, viewingSub); }}>
                                    Edit Subcategory
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={onSubViewClose}>Close</Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Global WhatsApp Modal */}
            <Modal isOpen={isGlobalWhatsappOpen} onClose={onGlobalWhatsappClose} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
                <ModalContent borderRadius="xl" boxShadow="2xl">
                    <ModalHeader bg="green.500" color="white" borderTopRadius="xl">
                        <HStack spacing={2}>
                            <FaWhatsapp size={20} />
                            <Text fontSize="lg" fontWeight="bold">Send Selected Products via WhatsApp</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">
                                You are about to send <b>{selectedProductIds.size} product(s)</b> via WhatsApp.
                            </Text>
                            <FormControl isRequired>
                                <FormLabel fontSize="xs" fontWeight="bold">Mobile Number (10 digits)</FormLabel>
                                <InputGroup>
                                    <Input 
                                        type="tel"
                                        placeholder="10-digit number" 
                                        maxLength={10}
                                        value={globalWhatsappForm.phone}
                                        onChange={handlePhoneChange}
                                    />
                                    {isFetchingUser && (
                                        <InputRightElement>
                                            <Spinner size="sm" color="green.500" />
                                        </InputRightElement>
                                    )}
                                </InputGroup>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Company Name</FormLabel>
                                <Input 
                                    placeholder="Company Name"
                                    value={globalWhatsappForm.companyName}
                                    onChange={e => setGlobalWhatsappForm({...globalWhatsappForm, companyName: e.target.value})}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Contact Person</FormLabel>
                                <Input 
                                    placeholder="Person Name"
                                    value={globalWhatsappForm.contactPersonName}
                                    onChange={e => setGlobalWhatsappForm({...globalWhatsappForm, contactPersonName: e.target.value})}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Email (optional)</FormLabel>
                                <Input 
                                    type="email"
                                    placeholder="Email"
                                    value={globalWhatsappForm.email}
                                    onChange={e => setGlobalWhatsappForm({...globalWhatsappForm, email: e.target.value})}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderBottomRadius="xl">
                        <Button variant="ghost" mr={3} onClick={onGlobalWhatsappClose}>Cancel</Button>
                        <Button 
                            bg="#25D366" 
                            color="white" 
                            _hover={{ bg: "#128C7E" }} 
                            isLoading={isGlobalWhatsappSending} 
                            onClick={handleSendGlobalWhatsapp}
                            leftIcon={<FaWhatsapp />}
                        >
                            Send Now
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Floating Fixed WhatsApp Button on Scroll */}
            <AnimatePresence>
                {selectedProductIds.size > 0 && (
                    <Box
                        position="fixed"
                        bottom="30px"
                        right="30px"
                        zIndex={1000}
                        as={motion.div}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.8 }}
                    >
                        <Button
                            size="lg"
                            bg="#25D366"
                            color="white"
                            _hover={{ bg: "#128C7E", transform: "scale(1.05)" }}
                            _active={{ bg: "#075E54" }}
                            boxShadow="0 10px 25px rgba(37, 211, 102, 0.45)"
                            borderRadius="full"
                            px={8}
                            py={6}
                            fontSize="md"
                            fontWeight="bold"
                            leftIcon={<FaWhatsapp size={24} />}
                            onClick={handleGlobalWhatsappOpen}
                        >
                            Send ({selectedProductIds.size}) to WhatsApp
                        </Button>
                    </Box>
                )}
            </AnimatePresence>
        </Box >
    );
};

export default AdminProducts;

