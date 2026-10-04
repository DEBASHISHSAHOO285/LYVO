const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../database/database");

const {
  createPasswordResetToken,
  verifyPasswordResetToken,
} = require("../services/passwordReset.service");

const {
  sendPasswordResetOTP,
} = require("../services/email.service");

// ======================================
// REGISTER USER
// ======================================

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check existing user
    const existingUser = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = db
      .prepare(
        `
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
        `
      )
      .run(cleanName, normalizedEmail, passwordHash);

    // Get created user
    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          avatar_url,
          created_at
        FROM users
        WHERE id = ?
        `
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

// ======================================
// LOGIN USER
// ======================================

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          password_hash,
          avatar_url
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
}

// ======================================
// FORGOT PASSWORD
// ======================================

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Validate email
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = db
      .prepare(
        `
        SELECT
          id,
          email
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    /*
      Always return the same response whether
      the account exists or not.

      This prevents email/account enumeration.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset code has been sent.",
      });
    }

    /*
      Create a new password reset token + OTP.
    */
    const resetToken = createPasswordResetToken(user.id);

    /*
      Send OTP to user's email.

      IMPORTANT:
      OTP is NOT printed in terminal.
    */
    try {
      await sendPasswordResetOTP({
        to: user.email,
        otp: resetToken.otp,
      });
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );

      /*
        If email sending fails, invalidate the newly
        created reset token so it cannot be used.
      */
      db.prepare(
        `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
      ).run(resetToken.tokenId);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send password reset email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request.",
    });
  }
}

// ======================================
// VERIFY PASSWORD RESET OTP
// ======================================

async function verifyResetOTP(req, res) {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOTP = otp.trim();

    // OTP must be exactly 6 digits
    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit code.",
      });
    }

    // Find user
    const user = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Verify OTP
    const result = verifyPasswordResetToken(
      user.id,
      normalizedOTP
    );

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetTokenId: result.tokenId,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
}

// ======================================
// RESET PASSWORD
// ======================================

async function resetPassword(req, res) {
  try {
    const {
      email,
      resetTokenId,
      newPassword,
    } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      (typeof resetTokenId !== "string" &&
        typeof resetTokenId !== "number") ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, reset token and new password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long.",
      });
    }

    // Find user
    const user = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to reset password.",
      });
    }

    // Validate reset token
    const resetToken = db
      .prepare(
        `
        SELECT
          id,
          user_id,
          expires_at,
          used_at
        FROM password_reset_tokens
        WHERE id = ?
          AND user_id = ?
        `
      )
      .get(Number(resetTokenId), user.id);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset session.",
      });
    }

    // Check if token was already used
    if (resetToken.used_at) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset session has already been used.",
      });
    }

    // Check token expiry
    if (new Date(resetToken.expires_at) <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset session has expired.",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    /*
      Update password and mark reset token as used
      inside one SQLite transaction.
    */
    const transaction = db.transaction(() => {
      db.prepare(
        `
        UPDATE users
        SET
          password_hash = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
      ).run(passwordHash, user.id);

      db.prepare(
        `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
      ).run(resetToken.id);
    });

    transaction();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
}

// ======================================
// EXPORT CONTROLLERS
// ======================================

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};