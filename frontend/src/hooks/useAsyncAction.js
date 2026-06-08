import { useCallback, useState } from "react";

export const useAsyncAction = (asyncFn) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError("");
      try {
        const result = await asyncFn(...args);
        setData(result);
        return result;
      } catch (actionError) {
        setError(actionError.message || "Action failed");
        throw actionError;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { data, error, loading, run, setData, setError };
};
