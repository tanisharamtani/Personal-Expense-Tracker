const Expense = require("../../backend/models/Expense");
const Budget = require("../../backend/models/Budget");
const asyncHandler = require("../utils/asyncHandler");
const { getMonthWindow } = require("../utils/dateHelpers");
const { getCategoryTotals, getMonthlyAverage, getBudgetStatus } = require("../utils/financeHelpers");

const groupByMonth = (expenses) => {
  const grouped = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    grouped[key] = (grouped[key] || 0) + expense.amount;
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
};

const groupByWeekday = (expenses) => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = weekdays.map((day) => ({ day, amount: 0 }));

  expenses.forEach((expense) => {
    grouped[new Date(expense.date).getDay()].amount += expense.amount;
  });

  return grouped;
};

const getAnalytics = asyncHandler(async (req, res) => {
  const { month, year, start, end } = getMonthWindow(req.query.month, req.query.year);
  const allExpenses = await Expense.find({ user: req.user._id }).sort({ date: 1 });
  const selectedExpenses = allExpenses.filter((expense) => {
    const date = new Date(expense.date);
    return date >= start && date < end;
  });

  const categoryTotals = getCategoryTotals(selectedExpenses);
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || null;
  const totalSpent = selectedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budget = await Budget.findOne({ user: req.user._id, month, year });

  res.json({
    data: {
      month,
      year,
      totalSpent,
      averageMonthlySpending: getMonthlyAverage(allExpenses),
      weeklySpending: groupByWeekday(selectedExpenses),
      monthlySpending: groupByMonth(allExpenses),
      categoryDistribution: Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
      })),
      topSpendingCategory: topCategoryEntry
        ? { category: topCategoryEntry[0], amount: topCategoryEntry[1] }
        : null,
      budgetUtilization: {
        budget: budget?.overallMonthlyBudget || req.user.monthlyBudget || 0,
        spent: totalSpent,
        status: getBudgetStatus(totalSpent, budget?.overallMonthlyBudget || req.user.monthlyBudget || 0),
      },
      savingsTrend: groupByMonth(allExpenses).map((item) => ({
        month: item.month,
        estimatedSavings: Math.max((req.user.monthlyIncome || 0) - item.amount, 0),
      })),
    },
  });
});

module.exports = { getAnalytics };
