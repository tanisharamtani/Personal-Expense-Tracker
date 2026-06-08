import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseService } from "../services/expenseService";
import { getVisibleTransactions } from "../utils/transactions";
import { usePagination } from "./usePagination";

const initialFilters = {
  search: "",
  category: "",
  month: "",
};

export const useTransactions = ({ pageSize = 10, fetchOnMount = true } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("date-desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async (apiFilters = {}) => {
    setLoading(true);
    setError("");
    try {
      const payload = await expenseService.getExpenses(apiFilters);
      const nextTransactions = payload?.expenses || payload?.data || payload || [];
      setTransactions(Array.isArray(nextTransactions) ? nextTransactions : []);
      return nextTransactions;
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchOnMount) {
      fetchTransactions();
    }
  }, [fetchOnMount, fetchTransactions]);

  const visibleTransactions = useMemo(
    () => getVisibleTransactions(transactions, filters, sort),
    [filters, sort, transactions]
  );

  const pagination = usePagination(visibleTransactions, pageSize);

  const createTransaction = async (expenseData) => {
    const created = await expenseService.createExpense(expenseData);
    await fetchTransactions();
    return created;
  };

  const updateTransaction = async (id, expenseData) => {
    const updated = await expenseService.updateExpense(id, expenseData);
    await fetchTransactions();
    return updated;
  };

  const deleteTransaction = async (id) => {
    const deleted = await expenseService.deleteExpense(id);
    setTransactions((current) => current.filter((transaction) => transaction._id !== id && transaction.id !== id));
    return deleted;
  };

  return {
    transactions,
    visibleTransactions,
    paginatedTransactions: pagination.paginatedItems,
    filters,
    sort,
    loading,
    error,
    pagination,
    setFilters,
    setSort,
    setTransactions,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
