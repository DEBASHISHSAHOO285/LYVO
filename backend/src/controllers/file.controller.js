const path = require("path");
const fs = require("fs");

const db = require("../../database/database");
const { uploadDirectory } = require("../config/upload");

// =========================================
// UPLOAD FILES
// =========================================

const uploadFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded.",
      });
    }

    const conversationId = req.body.conversationId
      ? Number(req.body.conversationId)
      : null;

    // If conversationId is provided, verify ownership
    if (conversationId) {
      const conversation = db
        .prepare(
          `
          SELECT id
          FROM conversations
          WHERE id = ? AND user_id = ?
        `
        )
        .get(conversationId, req.user.userId);

      if (!conversation) {
        // Delete uploaded files because conversation is invalid
        for (const file of req.files) {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }

        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }
    }

    const insertFile = db.prepare(`
      INSERT INTO files (
        user_id,
        conversation_id,
        original_name,
        stored_name,
        file_path,
        file_url,
        mime_type,
        file_size,
        file_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const uploadedFiles = [];

    const getFileType = (mimeType) => {
      if (mimeType.startsWith("image/")) {
        return "image";
      }

      if (
        mimeType === "application/pdf" ||
        mimeType.includes("word") ||
        mimeType.includes("document") ||
        mimeType === "text/plain" ||
        mimeType === "text/csv" ||
        mimeType === "text/markdown" ||
        mimeType === "application/json" ||
        mimeType.includes("sheet") ||
        mimeType.includes("excel")
      ) {
        return "document";
      }

      return "other";
    };

    for (const file of req.files) {
      const fileType = getFileType(file.mimetype);

      const relativePath = path
        .relative(process.cwd(), file.path)
        .replace(/\\/g, "/");

      const result = insertFile.run(
        req.user.userId,
        conversationId,
        file.originalname,
        file.filename,
        relativePath,
        null,
        file.mimetype,
        file.size,
        fileType
      );

      uploadedFiles.push({
        id: result.lastInsertRowid,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileType,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully.",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);

    // Cleanup files if database operation fails
    if (req.files) {
      for (const file of req.files) {
        try {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError);
        }
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload files.",
    });
  }
};

// =========================================
// GET USER FILES
// =========================================

const getUserFiles = (req, res) => {
  try {
    const files = db
      .prepare(
        `
        SELECT
          id,
          conversation_id,
          original_name,
          stored_name,
          mime_type,
          file_size,
          file_type,
          created_at
        FROM files
        WHERE user_id = ?
        ORDER BY created_at DESC
      `
      )
      .all(req.user.userId);

    return res.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch files.",
    });
  }
};

// =========================================
// DELETE FILE
// =========================================

const deleteFile = (req, res) => {
  try {
    const fileId = Number(req.params.id);

    if (!Number.isInteger(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID.",
      });
    }

    const file = db
      .prepare(
        `
        SELECT *
        FROM files
        WHERE id = ? AND user_id = ?
      `
      )
      .get(fileId, req.user.userId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    // Delete physical file
    const physicalPath = path.resolve(process.cwd(), file.file_path);

    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    // Delete database record
    db.prepare(
      `
      DELETE FROM files
      WHERE id = ? AND user_id = ?
    `
    ).run(fileId, req.user.userId);

    return res.json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    console.error("Delete file error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete file.",
    });
  }
};

module.exports = {
  uploadFiles,
  getUserFiles,
  deleteFile,
};