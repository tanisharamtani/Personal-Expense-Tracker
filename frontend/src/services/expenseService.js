import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const expenseService = {
  getExpenses(filters = {}) {
    return http.get(endpoints.expenses.base, filters);
  },
  getExpense(id) {
    return http.get(endpoints.expenses.byId(id));
  },
  createExpense(expenseData) {
    return http.post(endpoints.expenses.base, expenseData);
  },
  updateExpense(id, expenseData) {
    return http.patch(endpoints.expenses.byId(id), expenseData);
  },
  deleteExpense(id) {
    return http.delete(endpoints.expenses.byId(id));
  },
};
