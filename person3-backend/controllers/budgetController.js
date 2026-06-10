const Budget = require("../../backend/models/Budget");
const Expense = require("../../backend/models/Expense");
const asyncHandler = require("../utils/asyncHandler");
const { getMonthWindow } = require("../utils/dateHelpers");
const { getBudgetStatus, getCategoryTotals } = require("../utils/financeHelpers");

const attachBudgetUsage = async (budget, userId) => {
  const { start, end } = getMonthWindow(budget.month, budget.year);
  const expenses = await Expense.find({ user: userId, date: { $gte: start, $lt: end } });
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = getCategoryTotals(expenses);

  return {
    ...budget.toObject(),
    totalSpent,
    remainingBudget: Math.max(budget.overallMonthlyBudget - totalSpent, 0),
    status: getBudgetStatus(totalSpent, budget.overallMonthlyBudget),
    categoryProgress: budget.categoryBudgets.map((item) => {
      const spent = categoryTotals[item.category] || 0;
      return {
        category: item.category,
        limit: item.limit,
        spent,
        remaining: Math.max(item.limit - spent, 0),
        percentage: item.limit ? Math.min(Math.round((spent / item.limit) * 100), 100) : 0,
        status: getBudgetStatus(spent, item.limit),
      };
    }),
  };
};

const getBudgets = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.month) query.month = Number(req.query.month);
  if (req.query.year) query.year = Number(req.query.year);

  const budgets = await Budget.find(query).sort({ year: -1, month: -1 });
  res.json({ budgets, data: budgets });
});

const getCurrentBudget = asyncHandler(async (req, res) => {
  const { month, year } = getMonthWindow(req.query.month, req.query.year);
  const budget = await Budget.findOne({ user: req.user._id, month, year });

  if (!budget) {
    return res.json({ budget: null, data: null });
  }

  const budgetWithUsage = await attachBudgetUsage(budget, req.user._id);
  res.json({ budget: budgetWithUsage, data: budgetWithUsage });
});

const saveBudget = asyncHandler(async (req, res) => {
  const { month, year } = getMonthWindow(req.body.month, req.body.year);
  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, month, year },
    {
      user: req.user._id,
      month,
      year,
      overallMonthlyBudget: req.body.overallMonthlyBudget,
      categoryBudgets: req.body.categoryBudgets || [],
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ budget });
});

const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  ["month", "year", "overallMonthlyBudget", "categoryBudgets"].forEach((field) => {
    if (req.body[field] !== undefined) budget[field] = req.body[field];
  });

  const updatedBudget = await budget.save();
  res.json({ budget: updatedBudget });
});

const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    res.status(404);
    throw new Error("Budget not found");
  }

  await budget.deleteOne();
  res.json({ message: "Budget deleted successfully", id: req.params.id });
});

module.exports = {
  getBudgets,
  getCurrentBudget,
  saveBudget,
  updateBudget,
  deleteBudget,
};
