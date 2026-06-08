import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const dashboardService = {
  getSummary(filters = {}) {
    return http.get(endpoints.dashboard.summary, filters);
  },
};
