type UnauthorizedListener = () => void;

let runtimeAccessToken: string | null = null;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export const tokenStore = {
  getToken: (): string | null => runtimeAccessToken,

  setToken: (token: string | null): void => {
    runtimeAccessToken = token;
  },

  clearToken: (): void => {
    runtimeAccessToken = null;
  },

  subscribeUnauthorized: (listener: UnauthorizedListener): (() => void) => {
    unauthorizedListeners.add(listener);
    return () => {
      unauthorizedListeners.delete(listener);
    };
  },

  notifyUnauthorized: (): void => {
    runtimeAccessToken = null;
    unauthorizedListeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Prevent listener errors from breaking other subscribers
      }
    });
  },
};
