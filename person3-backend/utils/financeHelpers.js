const getCategoryTotals = (expenses) => {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
};

const getBudgetStatus = (spent, limit) => {
  if (!limit) return "within";
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "near";
  return "within";
};

const getLastSevenDaysChart = (expenses) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date,
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      amount: 0,
    };
  });

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const match = days.find((day) => day.date.toDateString() === expenseDate.toDateString());
    if (match) match.amount += expense.amount;
  });

  return days.map(({ label, amount }) => ({ label, amount }));
};

const getMonthlyAverage = (expenses) => {
  if (!expenses.length) return 0;
  const monthKeys = new Set(expenses.map((expense) => {
    const date = new Date(expense.date);
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }));
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return Math.round(total / Math.max(monthKeys.size, 1));
};

module.exports = {
  getCategoryTotals,
  getBudgetStatus,
  getLastSevenDaysChart,
  getMonthlyAverage,
};
