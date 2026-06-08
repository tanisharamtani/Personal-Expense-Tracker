import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const userService = {
  updateProfile(profileData) {
    return http.patch(endpoints.users.profile, profileData);
  },
  changePassword(passwordData) {
    return http.patch(endpoints.users.password, passwordData);
  },
};
