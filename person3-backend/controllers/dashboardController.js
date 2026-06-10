const Budget = require("../../backend/models/Budget");
const Expense = require("../../backend/models/Expense");
const SavingsGoal = require("../../backend/models/SavingsGoal");
const asyncHandler = require("../utils/asyncHandler");
const { getMonthWindow, getPreviousMonthWindow } = require("../utils/dateHelpers");
const {
  getCategoryTotals,
  getLastSevenDaysChart,
  getMonthlyAverage,
} = require("../utils/financeHelpers");

const getDashboardSummary = asyncHandler(async (req, res) => {
  const { month, year, start, end } = getMonthWindow(req.query.month, req.query.year);
  const previous = getPreviousMonthWindow(month, year);

  const [currentExpenses, allExpenses, previousExpenses, budget, savingsGoals] = await Promise.all([
    Expense.find({ user: req.user._id, date: { $gte: start, $lt: end } }).sort({ date: -1 }),
    Expense.find({ user: req.user._id }).sort({ date: -1 }),
    Expense.find({ user: req.user._id, date: { $gte: previous.start, $lt: previous.end } }),
    Budget.findOne({ user: req.user._id, month, year }),
    SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 }),
  ]);

  const totalExpensesThisMonth = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousMonthTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = getCategoryTotals(currentExpenses);
  const monthlyIncome = req.user.monthlyIncome || 0;
  const averageMonthlySpending = getMonthlyAverage(allExpenses);
  const projectedMonthlySavings = Math.max(monthlyIncome - averageMonthlySpending, 0);
  const firstActiveGoal = savingsGoals.find((goal) => goal.status === "active");

  const monthsToGoal = firstActiveGoal && projectedMonthlySavings
    ? Math.ceil(firstActiveGoal.remainingAmount / projectedMonthlySavings)
    : null;

  res.json({
    data: {
      user: req.user,
      month,
      year,
      monthlyIncome,
      totalBalance: monthlyIncome - totalExpensesThisMonth,
      totalExpensesThisMonth,
      averageMonthlySpending,
      budget: budget || { overallMonthlyBudget: req.user.monthlyBudget, categoryBudgets: [] },
      savingsGoals,
      recentExpenses: allExpenses.slice(0, 5),
      expenses: currentExpenses,
      lastSevenDaysChart: getLastSevenDaysChart(allExpenses),
      categoryBreakdownChart: Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount })),
      monthlyComparisonChart: [
        { label: "Previous Month", amount: previousMonthTotal },
        { label: "Current Month", amount: totalExpensesThisMonth },
      ],
      futureSavingsProjection: {
        monthlyIncome,
        averageMonthlySpending,
        projectedMonthlySavings,
        firstGoalTitle: firstActiveGoal?.title || null,
        estimatedGoalCompletionMonths: monthsToGoal,
      },
    },
  });
});

module.exports = { getDashboardSummary };
