const getMonthWindow = (month, year) => {
  const now = new Date();
  const selectedMonth = Number(month) || now.getMonth() + 1;
  const selectedYear = Number(year) || now.getFullYear();

  return {
    month: selectedMonth,
    year: selectedYear,
    start: new Date(selectedYear, selectedMonth - 1, 1),
    end: new Date(selectedYear, selectedMonth, 1),
  };
};

const getPreviousMonthWindow = (month, year) => {
  const date = new Date(year, month - 2, 1);
  return getMonthWindow(date.getMonth() + 1, date.getFullYear());
};

module.exports = { getMonthWindow, getPreviousMonthWindow };
