const TOKEN_KEY = "pet_auth_token";

export const tokenStorage = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
