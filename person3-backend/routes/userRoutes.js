const express = require("express");
const { updateProfile, changePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, changePassword);

module.exports = router;
