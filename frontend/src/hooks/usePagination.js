import { useMemo, useState } from "react";

export const usePagination = (items, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage: () => goToPage(page + 1),
    previousPage: () => goToPage(page - 1),
  };
};
