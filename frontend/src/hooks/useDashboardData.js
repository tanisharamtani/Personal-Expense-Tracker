import { useCallback, useEffect, useMemo, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import {
  getBudgetProgress,
  getCategoryBudgetProgress,
  getFutureSavingsProjection,
  getMonthlyAverage,
  getSavingsGoalProgress,
  toCurrencyNumber,
} from "../utils/financeCalculations";
import {
  mapCategoryBreakdown,
  mapLastSevenDaysSpending,
  mapMonthlySpendingComparison,
} from "../utils/chartMappers";

export const useDashboardData = (filters = {}) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await dashboardService.getSummary(filters);
      setSummary(payload?.data || payload);
      return payload;
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const mapped = useMemo(() => {
    const expenses = summary?.expenses || summary?.recentExpenses || [];
    const budget = summary?.budget || {};
    const goals = summary?.savingsGoals || [];
    const totalExpensesThisMonth =
      summary?.totalExpensesThisMonth ?? expenses.reduce((sum, expense) => sum + toCurrencyNumber(expense.amount), 0);
    const monthlyIncome = summary?.monthlyIncome || summary?.user?.monthlyIncome || 0;
    const totalBalance = toCurrencyNumber(monthlyIncome) - toCurrencyNumber(totalExpensesThisMonth);
    const averageMonthlySpending = summary?.averageMonthlySpending || getMonthlyAverage(expenses);

    return {
      raw: summary,
      totalBalance,
      totalExpensesThisMonth,
      averageMonthlySpending,
      recentExpenses: summary?.recentExpenses || expenses.slice(0, 5),
      budgetProgress: getBudgetProgress(totalExpensesThisMonth, budget.overallMonthlyBudget),
      categoryProgress: getCategoryBudgetProgress(expenses, budget.categoryBudgets || []),
      savingsGoals: goals.map((goal) => ({ ...goal, progress: getSavingsGoalProgress(goal) })),
      lastSevenDaysChart: summary?.lastSevenDaysChart || mapLastSevenDaysSpending(expenses),
      categoryBreakdownChart: summary?.categoryBreakdownChart || mapCategoryBreakdown(expenses),
      monthlyComparisonChart: summary?.monthlyComparisonChart || mapMonthlySpendingComparison(expenses),
      futureSavingsProjection:
        summary?.futureSavingsProjection ||
        getFutureSavingsProjection({
          monthlyIncome,
          averageMonthlySpending,
          currentSavings: summary?.currentSavings || 0,
        }),
    };
  }, [summary]);

  return {
    ...mapped,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
