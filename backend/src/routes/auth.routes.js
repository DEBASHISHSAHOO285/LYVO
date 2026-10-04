const express = require("express");

const {
  register,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

// ======================================
// REGISTER
// ======================================

router.post("/register", register);

// ======================================
// LOGIN
// ======================================

router.post("/login", login);

// ======================================
// FORGOT PASSWORD
// ======================================

router.post("/forgot-password", forgotPassword);

// ======================================
// VERIFY RESET OTP
// ======================================

router.post("/verify-reset-otp", verifyResetOTP);

// ======================================
// RESET PASSWORD
// ======================================

router.post("/reset-password", resetPassword);

// ======================================
// DEVELOPMENT ROUTE TEST
// ======================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route is working",
  });
});

module.exports = router;