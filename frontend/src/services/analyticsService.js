import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const analyticsService = {
  getAnalytics(filters = {}) {
    return http.get(endpoints.analytics.base, filters);
  },
};
