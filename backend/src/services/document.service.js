const fs = require("fs");
const path = require("path");

const mammoth = require("mammoth");
const XLSX = require("xlsx");
const { PDFParse } = require("pdf-parse");

// ======================================
// LIMITS
// ======================================

const MAX_TEXT_PER_FILE = 50000;

// ======================================
// READ TEXT FILE
// ======================================

function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// ======================================
// EXTRACT PDF TEXT
// ======================================

async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return result?.text || "";
  } finally {
    await parser.destroy();
  }
}

// ======================================
// EXTRACT DOCX TEXT
// ======================================

async function extractDocxText(filePath) {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result?.value || "";
}

// ======================================
// EXTRACT EXCEL TEXT
// ======================================

function extractSpreadsheetText(filePath) {
  const workbook = XLSX.readFile(filePath);

  const sections = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const csv = XLSX.utils.sheet_to_csv(
      worksheet,
      {
        blankrows: false,
      }
    );

    if (csv.trim()) {
      sections.push(
        `SHEET: ${sheetName}\n\n${csv}`
      );
    }
  }

  return sections.join("\n\n");
}

// ======================================
// NORMALIZE TEXT
// ======================================

function normalizeExtractedText(text) {
  if (!text) {
    return "";
  }

  return String(text)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

// ======================================
// TRUNCATE TEXT SAFELY
// ======================================

function limitText(text, maxLength = MAX_TEXT_PER_FILE) {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text.slice(0, maxLength) +
    "\n\n[Document text truncated because it is too large.]"
  );
}

// ======================================
// EXTRACT DOCUMENT TEXT
// ======================================

async function extractDocumentText(attachment) {
  if (!attachment) {
    throw new Error(
      "Document attachment is missing."
    );
  }

  if (!attachment.filePath) {
    throw new Error(
      "Document file path is missing."
    );
  }

  const filePath = path.resolve(
    attachment.filePath
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `File not found: ${attachment.originalName || filePath}`
    );
  }

  const extension = path
    .extname(
      attachment.originalName ||
        filePath
    )
    .toLowerCase();

  let text = "";

  // ======================================
  // PDF
  // ======================================

  if (
    extension === ".pdf" ||
    attachment.mimeType === "application/pdf"
  ) {
    text = await extractPdfText(filePath);
  }

  // ======================================
  // DOCX
  // ======================================

  else if (
    extension === ".docx" ||
    attachment.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await extractDocxText(filePath);
  }

  // ======================================
  // DOC
  // ======================================

  else if (
    extension === ".doc" ||
    attachment.mimeType ===
      "application/msword"
  ) {
    return {
      success: false,
      text: "",
      message:
        "Legacy .doc files are uploaded successfully, but text extraction for .doc is not supported yet. Please use .docx.",
    };
  }

  // ======================================
  // EXCEL / XLSX
  // ======================================

  else if (
    extension === ".xlsx" ||
    extension === ".xls" ||
    attachment.mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    attachment.mimeType ===
      "application/vnd.ms-excel"
  ) {
    text = extractSpreadsheetText(filePath);
  }

  // ======================================
  // TXT / CSV / JSON / MD
  // ======================================

  else if (
    extension === ".txt" ||
    extension === ".csv" ||
    extension === ".json" ||
    extension === ".md" ||
    attachment.mimeType === "text/plain" ||
    attachment.mimeType === "text/csv" ||
    attachment.mimeType === "application/json" ||
    attachment.mimeType === "text/markdown"
  ) {
    text = readTextFile(filePath);
  }

  // ======================================
  // UNSUPPORTED
  // ======================================

  else {
    return {
      success: false,
      text: "",
      message:
        "This file type does not currently support text extraction.",
    };
  }

  text = normalizeExtractedText(text);

  text = limitText(text);

  if (!text) {
    return {
      success: false,
      text: "",
      message:
        "No readable text was extracted from this file. If this is a scanned PDF or image-based document, OCR may be required.",
    };
  }

  return {
    success: true,
    text,
    message: "Text extracted successfully.",
  };
}

// ======================================
// EXPORT
// ======================================

module.exports = {
  extractDocumentText,
  MAX_TEXT_PER_FILE,
};