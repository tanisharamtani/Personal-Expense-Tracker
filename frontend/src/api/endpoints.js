export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    resetPassword: (token) => `/auth/reset-password/${token}`,
    me: "/auth/me",
    logout: "/auth/logout",
  },
  users: {
    profile: "/users/profile",
    password: "/users/password",
  },
  expenses: {
    base: "/expenses",
    byId: (id) => `/expenses/${id}`,
  },
  budgets: {
    base: "/budgets",
    current: "/budgets/current",
    byId: (id) => `/budgets/${id}`,
  },
  savingsGoals: {
    base: "/savings-goals",
    byId: (id) => `/savings-goals/${id}`,
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  analytics: {
    base: "/analytics",
  },
};
