import { endpoints } from "../api/endpoints";
import { http } from "../api/httpClient";

export const savingsGoalService = {
  getGoals(filters = {}) {
    return http.get(endpoints.savingsGoals.base, filters);
  },
  createGoal(goalData) {
    return http.post(endpoints.savingsGoals.base, goalData);
  },
  updateGoal(id, goalData) {
    return http.patch(endpoints.savingsGoals.byId(id), goalData);
  },
  deleteGoal(id) {
    return http.delete(endpoints.savingsGoals.byId(id));
  },
};
