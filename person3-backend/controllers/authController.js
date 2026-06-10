const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../../backend/models/User");
const PasswordResetToken = require("../../backend/models/PasswordResetToken");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const userResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  monthlyIncome: user.monthlyIncome,
  monthlyBudget: user.monthlyBudget,
  currency: user.currency,
  theme: user.theme,
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, monthlyIncome, monthlyBudget, currency } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Full name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    monthlyIncome,
    monthlyBudget,
    currency,
  });

  res.status(201).json({
    user: userResponse(user),
    token: generateToken(user._id),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: userResponse(user),
    token: generateToken(user._id),
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "If the email exists, a reset token has been created" });
  }

  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");

  await PasswordResetToken.deleteMany({ user: user._id });
  await PasswordResetToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  res.json({
    message: "Password reset token generated",
    resetToken: plainToken,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetRecord = await PasswordResetToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  const user = await User.findById(resetRecord.user);
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  await resetRecord.deleteOne();

  res.json({ message: "Password reset successful" });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logoutUser,
};
