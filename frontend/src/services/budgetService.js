import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const budgetService = {
  getBudgets(filters = {}) {
    return http.get(endpoints.budgets.base, filters);
  },
  getCurrentBudget(filters = {}) {
    return http.get(endpoints.budgets.current, filters);
  },
  saveBudget(budgetData) {
    return http.post(endpoints.budgets.base, budgetData);
  },
  updateBudget(id, budgetData) {
    return http.patch(endpoints.budgets.byId(id), budgetData);
  },
  deleteBudget(id) {
    return http.delete(endpoints.budgets.byId(id));
  },
};
