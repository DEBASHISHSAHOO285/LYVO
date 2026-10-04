const db = require("../../database/database");

/* =========================
   GET USER MEMORIES
========================= */
const getMemories = (req, res) => {
  try {
    const userId = req.user.userId;

    const memories = db
      .prepare(
        `
        SELECT
          id,
          key,
          value,
          category,
          importance,
          created_at,
          updated_at
        FROM memories
        WHERE user_id = ?
        ORDER BY importance DESC, updated_at DESC, id DESC
        `
      )
      .all(userId);

    return res.status(200).json({
      success: true,
      memories,
    });
  } catch (error) {
    console.error("Get memories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch memories.",
    });
  }
};


/* =========================
   CREATE MEMORY
========================= */
const createMemory = (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      key,
      value,
      category = "general",
      importance = 1,
    } = req.body;

    /* ---------- VALIDATION ---------- */

    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        message: "Memory key is required.",
      });
    }

    if (!value || !value.trim()) {
      return res.status(400).json({
        success: false,
        message: "Memory value is required.",
      });
    }

    const cleanKey = key.trim();
    const cleanValue = value.trim();
    const cleanCategory =
      typeof category === "string" && category.trim()
        ? category.trim()
        : "general";

    let cleanImportance = Number(importance);

    if (!Number.isInteger(cleanImportance)) {
      cleanImportance = 1;
    }

    /* Keep importance between 1 and 5 */
    cleanImportance = Math.min(
      5,
      Math.max(1, cleanImportance)
    );

    /* ---------- INSERT ---------- */

    const result = db
      .prepare(
        `
        INSERT INTO memories (
          user_id,
          key,
          value,
          category,
          importance
        )
        VALUES (?, ?, ?, ?, ?)
        `
      )
      .run(
        userId,
        cleanKey,
        cleanValue,
        cleanCategory,
        cleanImportance
      );

    /* ---------- FETCH CREATED MEMORY ---------- */

    const memory = db
      .prepare(
        `
        SELECT
          id,
          key,
          value,
          category,
          importance,
          created_at,
          updated_at
        FROM memories
        WHERE id = ? AND user_id = ?
        `
      )
      .get(result.lastInsertRowid, userId);

    return res.status(201).json({
      success: true,
      message: "Memory created successfully.",
      memory,
    });
  } catch (error) {
    console.error("Create memory error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create memory.",
    });
  }
};


module.exports = {
  getMemories,
  createMemory,
};