type UnauthorizedListener = () => void;

const TOKEN_KEY = 'finance_community_token';
const REFRESH_TOKEN_KEY = 'finance_community_refresh_token';
let runtimeAccessToken: string | null = null;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export const tokenStore = {
  getToken: (): string | null => {
    if (runtimeAccessToken) return runtimeAccessToken;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          runtimeAccessToken = stored;
          return stored;
        }
      } catch {
        // localStorage not accessible
      }
    }
    return null;
  },

  setToken: (token: string | null): void => {
    runtimeAccessToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        // localStorage not accessible
      }
    }
  },
  getRefreshToken: (): string | null => typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,
  setRefreshToken: (token: string | null): void => { if (typeof window !== 'undefined') { if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token); else localStorage.removeItem(REFRESH_TOKEN_KEY); } },

  clearToken: (): void => {
    runtimeAccessToken = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // localStorage not accessible
      }
    }
  },

  subscribeUnauthorized: (listener: UnauthorizedListener): (() => void) => {
    unauthorizedListeners.add(listener);
    return () => {
      unauthorizedListeners.delete(listener);
    };
  },

  notifyUnauthorized: (): void => {
    runtimeAccessToken = null;
    if (typeof window !== 'undefined') {
      try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch {
        // Ignore
      }
    }
    unauthorizedListeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Prevent listener errors from breaking other subscribers
      }
    });
  },
};
