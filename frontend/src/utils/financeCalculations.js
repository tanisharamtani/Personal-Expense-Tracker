import { BUDGET_STATUS, EXPENSE_CATEGORIES } from "../constants/categories";

export const toCurrencyNumber = (value) => Number(value || 0);

export const getPercentage = (value, total) => {
  if (!total || Number(total) <= 0) return 0;
  return Math.min(Math.round((Number(value || 0) / Number(total)) * 100), 100);
};

export const getBudgetStatus = (spent, limit) => {
  if (!limit || Number(limit) <= 0) return BUDGET_STATUS.WITHIN;
  const percentage = (Number(spent || 0) / Number(limit)) * 100;
  if (percentage >= 100) return BUDGET_STATUS.EXCEEDED;
  if (percentage >= 80) return BUDGET_STATUS.NEAR;
  return BUDGET_STATUS.WITHIN;
};

export const getBudgetProgress = (spent, limit) => ({
  spent: toCurrencyNumber(spent),
  limit: toCurrencyNumber(limit),
  remaining: Math.max(toCurrencyNumber(limit) - toCurrencyNumber(spent), 0),
  percentage: getPercentage(spent, limit),
  status: getBudgetStatus(spent, limit),
});

export const getCategoryTotals = (expenses = []) =>
  EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + toCurrencyNumber(expense.amount), 0),
  }));

export const getCategoryBudgetProgress = (expenses = [], categoryBudgets = []) => {
  const totals = getCategoryTotals(expenses);

  return totals.map(({ category, total }) => {
    const categoryBudget = categoryBudgets.find((budget) => budget.category === category);
    return {
      category,
      ...getBudgetProgress(total, categoryBudget?.limit || 0),
    };
  });
};

export const getSavingsGoalProgress = (goal) => {
  const targetAmount = toCurrencyNumber(goal?.targetAmount);
  const savedAmount = toCurrencyNumber(goal?.savedAmount);
  const remainingAmount = Math.max(targetAmount - savedAmount, 0);

  return {
    targetAmount,
    savedAmount,
    remainingAmount,
    percentage: getPercentage(savedAmount, targetAmount),
    isCompleted: savedAmount >= targetAmount && targetAmount > 0,
  };
};

export const getMonthlyAverage = (expenses = []) => {
  const totalsByMonth = expenses.reduce((acc, expense) => {
    const key = expense.date ? new Date(expense.date).toISOString().slice(0, 7) : "unknown";
    acc[key] = (acc[key] || 0) + toCurrencyNumber(expense.amount);
    return acc;
  }, {});

  const totals = Object.values(totalsByMonth);
  if (!totals.length) return 0;
  return Math.round(totals.reduce((sum, total) => sum + total, 0) / totals.length);
};

export const getFutureSavingsProjection = ({ monthlyIncome = 0, averageMonthlySpending = 0, currentSavings = 0, months = 6 }) => {
  const monthlySavings = Math.max(toCurrencyNumber(monthlyIncome) - toCurrencyNumber(averageMonthlySpending), 0);

  return Array.from({ length: months }, (_, index) => ({
    month: index + 1,
    projectedSavings: toCurrencyNumber(currentSavings) + monthlySavings * (index + 1),
  }));
};
