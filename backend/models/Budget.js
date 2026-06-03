const mongoose = require("mongoose");

const categoryBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Health",
        "Entertainment",
        "Bills",
        "Education",
        "Other",
      ],
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    overallMonthlyBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryBudgets: {
      type: [categoryBudgetSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
