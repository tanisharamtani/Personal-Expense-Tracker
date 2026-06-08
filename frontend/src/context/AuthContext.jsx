import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../api/tokenStorage";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(tokenStorage.get()));
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(tokenStorage.get()));
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    if (!tokenStorage.get()) {
      setIsInitializing(false);
      return null;
    }

    try {
      const payload = await authService.getCurrentUser();
      const currentUser = payload?.user || payload;
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (loadError) {
      tokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setError(loadError.message);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    setError("");
    const payload = await authService.login(credentials);
    const currentUser = payload?.user || payload?.data?.user || payload;
    setUser(currentUser);
    setIsAuthenticated(true);
    return payload;
  }, []);

  const signup = useCallback(async (formData) => {
    setError("");
    const payload = await authService.signup(formData);
    const currentUser = payload?.user || payload?.data?.user || payload;
    setUser(currentUser);
    setIsAuthenticated(true);
    return payload;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      error,
      login,
      signup,
      logout,
      loadUser,
      setUser,
      isInitializing,
      isAuthenticated,
    }),
    [error, isAuthenticated, isInitializing, loadUser, login, logout, signup, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
