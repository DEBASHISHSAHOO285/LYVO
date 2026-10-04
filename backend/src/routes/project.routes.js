const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

// Create project
router.post(
  "/",
  authenticateToken,
  createProject
);

// Get all projects
router.get(
  "/",
  authenticateToken,
  getProjects
);

// Get single project
router.get(
  "/:projectId",
  authenticateToken,
  getProjectById
);

// Update project
router.put(
  "/:projectId",
  authenticateToken,
  updateProject
);

// Delete project
router.delete(
  "/:projectId",
  authenticateToken,
  deleteProject
);

module.exports = router;