/**
 * getImageUrl — converts a backend image path to a usable URL.
 *
 * WHY RELATIVE URLs:
 * - `http://localhost:5001/...` works on PC but FAILS on mobile because
 *   "localhost" on the phone points to the phone itself, not your PC.
 * - Returning a relative path like `/api/uploads/...` lets Vite's dev
 *   server proxy forward it to port 5001 — works on ALL devices.
 * - In production, set VITE_API_BASE_URL to your real server domain.
 */
export const getImageUrl = (path) => {
    if (!path) return null;
    // Already an absolute URL (Cloudinary, external CDN, etc.) → use as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // In production with a real API domain set
    if (import.meta.env.VITE_API_BASE_URL) {
        const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        let cleanPath = path.startsWith('/') ? path : `/${path}`;
        // Avoid double /api prefix
        if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
            cleanPath = cleanPath.slice(4);
        }
        return `${base}${cleanPath}`;
    }

    // Development / no env set → relative path, Vite proxy handles it
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
};

export default getImageUrl;
