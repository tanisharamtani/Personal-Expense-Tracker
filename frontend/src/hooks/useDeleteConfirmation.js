import { useState } from "react";

export const useDeleteConfirmation = () => {
  const [itemToDelete, setItemToDelete] = useState(null);

  return {
    itemToDelete,
    isDeleteOpen: Boolean(itemToDelete),
    openDeleteConfirmation: setItemToDelete,
    closeDeleteConfirmation: () => setItemToDelete(null),
  };
};
