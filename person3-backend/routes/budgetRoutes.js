const express = require("express");
const {
  getBudgets,
  getCurrentBudget,
  saveBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getBudgets).post(protect, saveBudget);
router.get("/current", protect, getCurrentBudget);
router.route("/:id").patch(protect, updateBudget).delete(protect, deleteBudget);

module.exports = router;
