import axios from 'axios';
import toast from 'react-hot-toast';

const FORCE_LOGOUT_CODES = ['token_expired', 'invalid_access_token'];
let isRedirecting = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error.response?.status;
    const code = error.response?.data?.detail?.code;

    if (status === 401) {
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'auth_permissions=; path=/; max-age=0';
      document.cookie = 'auth_modules=; path=/; max-age=0';
      window.location.href = '/login';
    }

    if (status === 403 && FORCE_LOGOUT_CODES.includes(code)) {
      if (isRedirecting) return Promise.reject(error);
      isRedirecting = true;

      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'auth_permissions=; path=/; max-age=0';
      document.cookie = 'auth_modules=; path=/; max-age=0';

      toast.error('Sessão inválida, por favor entre novamente no sistema.');

      setTimeout(() => {
        window.location.href = '/login';
        isRedirecting = false;
      }, 1600);
    }

    return Promise.reject(error);
  }
);

// Used only for browser-side calls to endpoints that lack CORS headers on errors.
// Requests are routed through the Next.js proxy API route (server-to-server).
const proxyApi = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

proxyApi.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export { api, proxyApi };
