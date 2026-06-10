const SavingsGoal = require("../../backend/models/SavingsGoal");
const asyncHandler = require("../utils/asyncHandler");

const getGoals = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.status) query.status = req.query.status;

  const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });
  res.json({ goals, data: goals });
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.create({
    user: req.user._id,
    title: req.body.title,
    targetAmount: req.body.targetAmount,
    savedAmount: req.body.savedAmount,
    targetDate: req.body.targetDate,
    status: req.body.status,
    icon: req.body.icon,
  });

  res.status(201).json({ goal });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error("Savings goal not found");
  }

  ["title", "targetAmount", "savedAmount", "targetDate", "status", "icon"].forEach((field) => {
    if (req.body[field] !== undefined) goal[field] = req.body[field];
  });

  if (goal.savedAmount >= goal.targetAmount) goal.status = "completed";

  const updatedGoal = await goal.save();
  res.json({ goal: updatedGoal });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) {
    res.status(404);
    throw new Error("Savings goal not found");
  }

  await goal.deleteOne();
  res.json({ message: "Savings goal deleted successfully", id: req.params.id });
});

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
