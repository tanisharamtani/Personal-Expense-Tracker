import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const Placeholder = ({ title }) => (
  <main className="pet-shell">
    <h1>{title}</h1>
    <p>Connect this route to the UI page component when it is added.</p>
  </main>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/signup" element={<Placeholder title="Sign Up" />} />
      <Route path="/forgot-password" element={<Placeholder title="Forgot Password" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
        <Route path="/expenses" element={<Placeholder title="Expenses" />} />
        <Route path="/transactions" element={<Placeholder title="Transactions" />} />
        <Route path="/budgets" element={<Placeholder title="Budget Manager" />} />
        <Route path="/savings-goals" element={<Placeholder title="Savings Goals" />} />
        <Route path="/analytics" element={<Placeholder title="Analytics" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
