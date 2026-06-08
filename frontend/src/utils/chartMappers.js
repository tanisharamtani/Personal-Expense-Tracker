import { EXPENSE_CATEGORIES } from "../constants/categories";
import { getCategoryTotals, toCurrencyNumber } from "./financeCalculations";

export const mapLastSevenDaysSpending = (expenses = []) => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      amount: expenses
        .filter((expense) => expense.date && new Date(expense.date).toISOString().slice(0, 10) === key)
        .reduce((sum, expense) => sum + toCurrencyNumber(expense.amount), 0),
    };
  });
};

export const mapCategoryBreakdown = (expenses = []) => {
  const totals = getCategoryTotals(expenses);
  return totals.filter((item) => item.total > 0);
};

export const mapMonthlySpendingComparison = (expenses = []) => {
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const key = expense.date ? new Date(expense.date).toISOString().slice(0, 7) : "Unknown";
    acc[key] = (acc[key] || 0) + toCurrencyNumber(expense.amount);
    return acc;
  }, {});

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
};

export const createEmptyCategoryDataset = () =>
  EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: 0,
  }));
