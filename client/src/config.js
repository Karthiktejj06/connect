const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5007';

// Remove any trailing slashes and remove a trailing /api if it was accidentally included
// This makes the app "self-healing" for common Vercel configuration mistakes
const cleanBaseUrl = rawUrl.replace(/\/+$/, '').replace(/\/api$/, '');

export const API_BASE_URL = cleanBaseUrl;
export const API_URL = `${cleanBaseUrl}/api`;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
