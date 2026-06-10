const express = require("express");
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/savingsGoalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getGoals).post(protect, createGoal);
router.route("/:id").patch(protect, updateGoal).delete(protect, deleteGoal);

module.exports = router;
