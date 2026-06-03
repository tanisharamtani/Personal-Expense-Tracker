const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: 0,
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required"],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    icon: {
      type: String,
      default: "Other",
    },
  },
  {
    timestamps: true,
  }
);

savingsGoalSchema.virtual("remainingAmount").get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

savingsGoalSchema.virtual("completionPercentage").get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(Math.round((this.savedAmount / this.targetAmount) * 100), 100);
});

savingsGoalSchema.set("toJSON", { virtuals: true });
savingsGoalSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
