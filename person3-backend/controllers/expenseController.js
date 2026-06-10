const Expense = require("../../backend/models/Expense");
const asyncHandler = require("../utils/asyncHandler");

const buildExpenseQuery = (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.category) query.category = filters.category;
  if (filters.search) query.title = { $regex: filters.search, $options: "i" };
  if (filters.month) {
    const [year, month] = String(filters.month).split("-").map(Number);
    if (year && month) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }
  }

  return query;
};

const getExpenses = asyncHandler(async (req, res) => {
  const sortMap = {
    "date-asc": { date: 1 },
    "date-desc": { date: -1 },
    "amount-asc": { amount: 1 },
    "amount-desc": { amount: -1 },
  };

  const expenses = await Expense.find(buildExpenseQuery(req.user._id, req.query))
    .sort(sortMap[req.query.sort] || { date: -1, createdAt: -1 });

  res.json({ expenses, data: expenses });
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({ expense });
});

const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    user: req.user._id,
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
    notes: req.body.notes,
  });

  res.status(201).json({ expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  ["title", "amount", "category", "date", "notes"].forEach((field) => {
    if (req.body[field] !== undefined) expense[field] = req.body[field];
  });

  const updatedExpense = await expense.save();
  res.json({ expense: updatedExpense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  await expense.deleteOne();
  res.json({ message: "Expense deleted successfully", id: req.params.id });
});

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
