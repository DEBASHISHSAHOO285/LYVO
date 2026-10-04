const db = require("../../database/database");

// ======================================
// CREATE PROJECT
// ======================================

const createProject = (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data is missing.",
      });
    }

    const result = db
      .prepare(
        `
        INSERT INTO workspaces (
          user_id,
          name,
          description,
          icon
        )
        VALUES (?, ?, ?, ?)
        `
      )
      .run(
        userId,
        name.trim(),
        description?.trim() || null,
        icon || "◇"
      );

    const project = db
      .prepare(
        `
        SELECT
          id,
          user_id,
          name,
          description,
          icon,
          created_at,
          updated_at
        FROM workspaces
        WHERE id = ? AND user_id = ?
        `
      )
      .get(result.lastInsertRowid, userId);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};


// ======================================
// GET ALL PROJECTS
// ======================================

const getProjects = (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data is missing.",
      });
    }

    const projects = db
      .prepare(
        `
        SELECT
          id,
          user_id,
          name,
          description,
          icon,
          created_at,
          updated_at
        FROM workspaces
        WHERE user_id = ?
        ORDER BY updated_at DESC, id DESC
        `
      )
      .all(userId);

    return res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load projects",
    });
  }
};


// ======================================
// GET SINGLE PROJECT
// ======================================

const getProjectById = (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data is missing.",
      });
    }

    const project = db
      .prepare(
        `
        SELECT
          id,
          user_id,
          name,
          description,
          icon,
          created_at,
          updated_at
        FROM workspaces
        WHERE id = ? AND user_id = ?
        `
      )
      .get(projectId, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load project",
    });
  }
};


// ======================================
// UPDATE PROJECT
// ======================================

const updateProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, icon } = req.body;

    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data is missing.",
      });
    }

    const existingProject = db
      .prepare(
        `
        SELECT id
        FROM workspaces
        WHERE id = ? AND user_id = ?
        `
      )
      .get(projectId, userId);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    db.prepare(
      `
      UPDATE workspaces
      SET
        name = ?,
        description = ?,
        icon = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
      `
    ).run(
      name.trim(),
      description?.trim() || null,
      icon || "◇",
      projectId,
      userId
    );

    const project = db
      .prepare(
        `
        SELECT
          id,
          user_id,
          name,
          description,
          icon,
          created_at,
          updated_at
        FROM workspaces
        WHERE id = ? AND user_id = ?
        `
      )
      .get(projectId, userId);

    return res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};


// ======================================
// DELETE PROJECT
// ======================================

const deleteProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication data is missing.",
      });
    }

    const result = db
      .prepare(
        `
        DELETE FROM workspaces
        WHERE id = ? AND user_id = ?
        `
      )
      .run(projectId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};


// ======================================
// EXPORT
// ======================================

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};