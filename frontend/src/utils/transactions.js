const normalize = (value) => String(value || "").toLowerCase();

export const filterTransactions = (transactions, filters = {}) => {
  const { search = "", category = "", month = "" } = filters;
  const query = normalize(search);

  return transactions.filter((transaction) => {
    const matchesSearch =
      !query ||
      normalize(transaction.title).includes(query) ||
      normalize(transaction.notes).includes(query) ||
      normalize(transaction.category).includes(query);

    const matchesCategory = !category || transaction.category === category;
    const transactionMonth = transaction.date ? new Date(transaction.date).toISOString().slice(0, 7) : "";
    const matchesMonth = !month || transactionMonth === month;

    return matchesSearch && matchesCategory && matchesMonth;
  });
};

export const sortTransactions = (transactions, sort = "date-desc") => {
  const sorted = [...transactions];

  const sorters = {
    "date-desc": (a, b) => new Date(b.date) - new Date(a.date),
    "date-asc": (a, b) => new Date(a.date) - new Date(b.date),
    "amount-desc": (a, b) => Number(b.amount) - Number(a.amount),
    "amount-asc": (a, b) => Number(a.amount) - Number(b.amount),
    "title-asc": (a, b) => String(a.title).localeCompare(String(b.title)),
    "category-asc": (a, b) => String(a.category).localeCompare(String(b.category)),
  };

  return sorted.sort(sorters[sort] || sorters["date-desc"]);
};

export const getVisibleTransactions = (transactions, filters, sort) =>
  sortTransactions(filterTransactions(transactions, filters), sort);
