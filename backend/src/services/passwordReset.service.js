const crypto = require("crypto");

const db = require("../../database/database");
const { generateOTP, hashOTP } = require("../utils/otp");

const OTP_EXPIRY_MINUTES = 10;

function createPasswordResetToken(userId) {
  const otp = generateOTP();
  const tokenHash = hashOTP(otp);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  ).toISOString();

  const transaction = db.transaction(() => {
    // Invalidate any previous unused OTPs
    db.prepare(
      `
      UPDATE password_reset_tokens
      SET used_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
        AND used_at IS NULL
      `
    ).run(userId);

    const result = db
      .prepare(
        `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
        `
      )
      .run(userId, tokenHash, expiresAt);

    return result.lastInsertRowid;
  });

  const tokenId = transaction();

  return {
    tokenId,
    otp,
    expiresAt,
  };
}

function verifyPasswordResetToken(userId, otp) {
  const tokenHash = hashOTP(otp);

  const token = db
    .prepare(
      `
      SELECT
        id,
        user_id,
        token_hash,
        expires_at,
        used_at,
        attempts
      FROM password_reset_tokens
      WHERE user_id = ?
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `
    )
    .get(userId);

  if (!token) {
    return {
      valid: false,
      message: "Invalid or expired OTP.",
    };
  }

  if (token.attempts >= 5) {
    return {
      valid: false,
      message: "Too many OTP attempts. Please request a new OTP.",
    };
  }

  if (new Date(token.expires_at) <= new Date()) {
    return {
      valid: false,
      message: "OTP has expired. Please request a new OTP.",
    };
  }

  if (
    !crypto.timingSafeEqual(
      Buffer.from(token.token_hash, "hex"),
      Buffer.from(tokenHash, "hex")
    )
  ) {
    db.prepare(
      `
      UPDATE password_reset_tokens
      SET attempts = attempts + 1
      WHERE id = ?
      `
    ).run(token.id);

    return {
      valid: false,
      message: "Invalid OTP.",
    };
  }

  return {
    valid: true,
    tokenId: token.id,
  };
}

function markPasswordResetTokenUsed(tokenId) {
  db.prepare(
    `
    UPDATE password_reset_tokens
    SET used_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `
  ).run(tokenId);
}

module.exports = {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markPasswordResetTokenUsed,
};