const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5007';

// Aggressively clean the URL: 
// 1. Remove all trailing slashes
// 2. Remove /api/api if it exists
// 3. Remove /api if it's there
const cleanBaseUrl = rawUrl
  .replace(/\/+$/, '')
  .replace(/\/api\/api$/, '')
  .replace(/\/api$/, '');

export const API_BASE_URL = cleanBaseUrl;
export const API_URL = `${cleanBaseUrl}/api`;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
