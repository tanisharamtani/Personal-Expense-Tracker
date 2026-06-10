const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);

module.exports = router;
