const bcrypt = require("bcryptjs");
const db = require("../../database/database");

const getCurrentUser = (req, res) => {
  try {
    const userId = req.user.userId;

    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          avatar_url,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        `
      )
      .get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile.",
    });
  }
};

const updateProfile = (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      name,
      email,
      avatar_url,
    } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    const cleanAvatar =
      typeof avatar_url === "string"
        ? avatar_url.trim()
        : "";

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const existingUser = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        `
      )
      .get(cleanEmail, userId);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use.",
      });
    }

    db.prepare(
      `
      UPDATE users
      SET
        name = ?,
        email = ?,
        avatar_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
    ).run(
      cleanName,
      cleanEmail,
      cleanAvatar || null,
      userId
    );

    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          email,
          avatar_url,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        `
      )
      .get(userId);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

const changePassword = (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters.",
      });
    }

    const user = db
      .prepare(
        `
        SELECT
          id,
          password_hash
        FROM users
        WHERE id = ?
        `
      )
      .get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches = bcrypt.compareSync(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const newPasswordHash = bcrypt.hashSync(
      newPassword,
      12
    );

    db.prepare(
      `
      UPDATE users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
    ).run(newPasswordHash, userId);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  changePassword,
};