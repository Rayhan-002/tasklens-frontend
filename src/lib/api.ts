import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Converts a possibly-relative media path returned by the Django backend
 * (e.g. "/media/annotation_images/foo.jpg") into an absolute URL using
 * the backend origin derived from NEXT_PUBLIC_API_URL.
 *
 * When the backend serializer is called with request context (the correct
 * setup) it already returns an absolute URL, so this is a no-op for those
 * responses. It acts as a safety net in any environment where the context
 * is missing.
 */
export function resolveMediaUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
  try {
    const origin = new URL(apiBase).origin;
    return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, clear tokens and redirect to login — but NOT for the login endpoint
// itself, where a 401 simply means wrong credentials and must be handled by the caller.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login/');
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !isLoginRequest
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
