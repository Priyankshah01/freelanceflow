// src/config/api.js
//
// The ONE place that decides which backend the app talks to.
//
// 1. VITE_API_URL (set it in Vercel → Project → Settings → Environment Variables)
// 2. Running on localhost → the local backend on port 5000
// 3. Otherwise → the default Render backend below
//
// Older names (VITE_API_BASE_URL, VITE_BACKEND_URL) still work.

const DEFAULT_PROD_API = 'https://freelanceflow-backend-01k4.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

const env = import.meta.env || {};
const fromEnv =
  env.VITE_API_URL || env.VITE_API_BASE_URL || env.VITE_BACKEND_URL || '';

const isLocalhost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

export const API_BASE_URL = (fromEnv || (isLocalhost ? LOCAL_API : DEFAULT_PROD_API)).replace(/\/+$/, '');
