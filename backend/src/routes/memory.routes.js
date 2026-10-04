const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");

const {
  getMemories,
  createMemory,
} = require("../controllers/memory.controller");

const router = express.Router();

/* GET USER MEMORIES */
router.get(
  "/",
  authenticateToken,
  getMemories
);

/* CREATE NEW MEMORY */
router.post(
  "/",
  authenticateToken,
  createMemory
);

module.exports = router;