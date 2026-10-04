const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "LYVO Image API is working 🎨",
  });
});

module.exports = router;