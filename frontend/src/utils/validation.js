import { EXPENSE_CATEGORIES } from "../constants/categories";

const isPositiveNumber = (value) => Number(value) > 0;

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

export const validateSignup = ({ fullName, email, password }) => {
  const errors = validateLogin({ email, password });
  if (!fullName?.trim()) errors.fullName = "Full name is required";
  if (password && password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
};

export const validateExpense = ({ title, amount, category, date }) => {
  const errors = {};
  if (!title?.trim()) errors.title = "Expense title is required";
  if (!isPositiveNumber(amount)) errors.amount = "Amount must be greater than 0";
  if (!EXPENSE_CATEGORIES.includes(category)) errors.category = "Choose a valid category";
  if (!date) errors.date = "Expense date is required";
  return errors;
};

export const validateBudget = ({ overallMonthlyBudget, categoryBudgets = [] }) => {
  const errors = {};
  if (Number(overallMonthlyBudget) < 0) errors.overallMonthlyBudget = "Monthly budget cannot be negative";

  const invalidCategoryBudget = categoryBudgets.find((budget) => Number(budget.limit) < 0);
  if (invalidCategoryBudget) errors.categoryBudgets = "Category budgets cannot be negative";

  return errors;
};

export const validateSavingsGoal = ({ title, targetAmount, savedAmount = 0, targetDate }) => {
  const errors = {};
  if (!title?.trim()) errors.title = "Goal title is required";
  if (!isPositiveNumber(targetAmount)) errors.targetAmount = "Target amount must be greater than 0";
  if (Number(savedAmount) < 0) errors.savedAmount = "Saved amount cannot be negative";
  if (Number(savedAmount) > Number(targetAmount)) errors.savedAmount = "Saved amount cannot exceed target";
  if (!targetDate) errors.targetDate = "Target date is required";
  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
