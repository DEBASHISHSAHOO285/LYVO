const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
  getCurrentUser,
  updateProfile,
  changePassword,
} = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/me",
  authenticateToken,
  getCurrentUser
);

router.put(
  "/me",
  authenticateToken,
  updateProfile
);

router.put(
  "/me/password",
  authenticateToken,
  changePassword
);

module.exports = router;