const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================================
// UPLOAD DIRECTORY
// =========================================

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/chat"
);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =========================================
// STORAGE
// =========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const baseName = path
      .basename(
        file.originalname,
        extension
      )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 80);

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

// =========================================
// ALLOWED FILE TYPES
// =========================================

const allowedMimeTypes = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",

  // Documents
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "text/plain",

  "text/csv",

  "application/json",

  "text/markdown",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// =========================================
// FILE FILTER
// =========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" is not supported.`
      ),
      false
    );
  }
};

// =========================================
// MULTER
// =========================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    // 10 MB maximum per file
    fileSize: 10 * 1024 * 1024,

    // Maximum 5 files in one request
    files: 5,
  },
});

// =========================================
// EXPORT
// =========================================

module.exports = {
  upload,
  uploadDirectory,
  allowedMimeTypes,
};