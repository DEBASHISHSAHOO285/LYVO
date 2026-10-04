const express = require("express");

const {
  uploadFiles,
  getUserFiles,
  deleteFile,
} = require("../controllers/file.controller");

const { upload } = require("../config/upload");
const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// =========================================
// UPLOAD FILES
// POST /api/files/upload
// =========================================

router.post(
  "/upload",
  authenticateToken,
  upload.array("files", 5),
  uploadFiles
);

// =========================================
// GET USER FILES
// GET /api/files
// =========================================

router.get(
  "/",
  authenticateToken,
  getUserFiles
);

// =========================================
// DELETE FILE
// DELETE /api/files/:id
// =========================================

router.delete(
  "/:id",
  authenticateToken,
  deleteFile
);

module.exports = router;