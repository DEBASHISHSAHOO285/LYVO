const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const workspaceRoutes = require("./routes/workspace.routes");
const imageRoutes = require("./routes/image.routes");
const memoryRoutes = require("./routes/memory.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const fileRoutes = require("./routes/file.routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lyvo-virid.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LYVO Backend is running 🚀",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);

module.exports = app;