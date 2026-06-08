import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";
import { tokenStorage } from "../api/tokenStorage";

const persistSession = (payload) => {
  const token = payload?.token || payload?.accessToken;
  if (token) {
    tokenStorage.set(token);
  }
  return payload;
};

export const authService = {
  async signup(formData) {
    return persistSession(await http.post(endpoints.auth.register, formData));
  },
  async login(credentials) {
    return persistSession(await http.post(endpoints.auth.login, credentials));
  },
  forgotPassword(email) {
    return http.post(endpoints.auth.forgotPassword, { email });
  },
  resetPassword(token, password) {
    return http.post(endpoints.auth.resetPassword(token), { password });
  },
  getCurrentUser() {
    return http.get(endpoints.auth.me);
  },
  async logout() {
    try {
      await http.post(endpoints.auth.logout);
    } finally {
      tokenStorage.clear();
    }
  },
};
