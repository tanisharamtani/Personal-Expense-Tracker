const bcrypt = require("bcryptjs");
const User = require("../../backend/models/User");
const asyncHandler = require("../utils/asyncHandler");

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "fullName",
    "phone",
    "profileImage",
    "monthlyIncome",
    "monthlyBudget",
    "currency",
    "theme",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  const updatedUser = await req.user.save();
  res.json({ user: updatedUser });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
});

module.exports = { updateProfile, changePassword };
