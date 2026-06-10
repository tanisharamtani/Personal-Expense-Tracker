const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("../person3-backend/middleware/errorMiddleware");

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PET Backend API is running",
    owner: "Person 3 - Backend",
  });
});

app.use("/api/auth", require("../person3-backend/routes/authRoutes"));
app.use("/api/users", require("../person3-backend/routes/userRoutes"));
app.use("/api/expenses", require("../person3-backend/routes/expenseRoutes"));
app.use("/api/budgets", require("../person3-backend/routes/budgetRoutes"));
app.use("/api/savings-goals", require("../person3-backend/routes/savingsGoalRoutes"));
app.use("/api/dashboard", require("../person3-backend/routes/dashboardRoutes"));
app.use("/api/analytics", require("../person3-backend/routes/analyticsRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Person 3 backend server running on port ${PORT}`);
});
