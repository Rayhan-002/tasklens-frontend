import { create } from 'zustand';

/** Decode a JWT and return true only if it exists and has not expired. */
function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; compare against current time in seconds
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True after hydrate() has run once — prevents premature redirect on mount. */
  hydrated: boolean;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  hydrated: false,

  setTokens: (access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
    set({ accessToken: access, isAuthenticated: true, hydrated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ accessToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const valid = isTokenValid(token);
      if (!valid && token) {
        // Expired or malformed token — clean up storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      set({
        accessToken: valid ? token : null,
        isAuthenticated: valid,
        hydrated: true,
      });
    }
  },
}));
