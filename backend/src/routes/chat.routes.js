const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
  createConversation,
  getConversations,
  createMessage,
  getMessages,
  sendMessageToAI,
} = require("../controllers/chat.controller");

const router = express.Router();

// ======================================
// CREATE CONVERSATION
// ======================================

router.post(
  "/conversations",
  authenticateToken,
  createConversation
);

// ======================================
// GET USER CONVERSATIONS
// ======================================

router.get(
  "/conversations",
  authenticateToken,
  getConversations
);

// ======================================
// CREATE MESSAGE
// ======================================

router.post(
  "/messages",
  authenticateToken,
  createMessage
);

// ======================================
// GET CONVERSATION MESSAGES
// ======================================

router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  getMessages
);

// ======================================
// SEND MESSAGE TO AI
// ======================================

router.post(
  "/send",
  authenticateToken,
  sendMessageToAI
);

// ======================================
// DEVELOPMENT ROUTE TEST
// ======================================

router.get("/test", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "LYVO Chat API is working 💬",
    user: req.user,
  });
});

module.exports = router;