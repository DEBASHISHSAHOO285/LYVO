import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Projects() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] =
    useState("");

  const [selectedIcon, setSelectedIcon] =
    useState("◇");

  const [editingProjectId, setEditingProjectId] =
    useState(null);

  const projectIcons = [
    "◇",
    "✦",
    "◈",
    "⌁",
    "⚡",
    "🚀",
    "💡",
    "🎯",
  ];

  /* ======================================
     LOAD PROJECTS
  ====================================== */

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = localStorage.getItem("lyvo-token");

        console.log(
          "LYVO token:",
          token ? "EXISTS" : "MISSING"
        );

        const response = await api.get("/projects");

        console.log(
          "Projects API response:",
          response
        );

        if (response.success) {
          setProjects(response.projects || []);
        }
      } catch (error) {
        console.error(
          "Load projects error:",
          error
        );
      }
    };

    loadProjects();
  }, []);

  /* ======================================
     OPEN NEW PROJECT MODAL
  ====================================== */

  const handleOpenModal = () => {
    setEditingProjectId(null);

    setProjectName("");
    setProjectDescription("");
    setSelectedIcon("◇");

    setShowModal(true);
  };

  /* ======================================
     OPEN EDIT PROJECT MODAL
  ====================================== */

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);

    setProjectName(project.name || "");
    setProjectDescription(project.description || "");
    setSelectedIcon(project.icon || "◇");

    setShowModal(true);
  };

  /* ======================================
     CLOSE MODAL
  ====================================== */

  const handleCloseModal = () => {
    setShowModal(false);

    setEditingProjectId(null);

    setProjectName("");
    setProjectDescription("");
    setSelectedIcon("◇");
  };

  /* ======================================
     CREATE / UPDATE PROJECT
  ====================================== */

  const handleSaveProject = async (event) => {
    event.preventDefault();

    if (!projectName.trim()) return;

    try {
      /* ======================================
         UPDATE EXISTING PROJECT
      ====================================== */

      if (editingProjectId) {
        const response = await api.put(
          `/projects/${editingProjectId}`,
          {
            name: projectName.trim(),
            description: projectDescription.trim(),
            icon: selectedIcon,
          }
        );

        console.log(
          "Update project API response:",
          response
        );

        if (response.success) {
          setProjects((currentProjects) =>
            currentProjects.map((project) =>
              project.id === editingProjectId
                ? response.project
                : project
            )
          );

          handleCloseModal();
        }

        return;
      }

      /* ======================================
         CREATE NEW PROJECT
      ====================================== */

      const response = await api.post("/projects", {
        name: projectName.trim(),
        description: projectDescription.trim(),
        icon: selectedIcon,
      });

      console.log(
        "Create project API response:",
        response
      );

      if (response.success) {
        setProjects((currentProjects) => [
          response.project,
          ...currentProjects,
        ]);

        handleCloseModal();
      }
    } catch (error) {
      console.error(
        "Save project error:",
        error
      );

      alert(
        error.message ||
          "Failed to save project. Please try again."
      );
    }
  };

  /* ======================================
     DELETE PROJECT
  ====================================== */

  const handleDeleteProject = async (projectId) => {
    const project = projects.find(
      (item) => item.id === projectId
    );

    if (!project) return;

    const confirmed = window.confirm(
      `Delete "${project.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(
        `/projects/${projectId}`
      );

      console.log(
        "Delete project API response:",
        response
      );

      if (response.success) {
        setProjects((currentProjects) =>
          currentProjects.filter(
            (item) => item.id !== projectId
          )
        );
      }
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete project. Please try again."
      );
    }
  };

  return (
    <main className="lyvo-projects-page">

      {/* ======================================
          PROJECTS TOP BAR
      ====================================== */}

      <header className="lyvo-projects-topbar">

        <div className="lyvo-projects-topbar-title">

          <span className="lyvo-projects-topbar-icon">
            ✦
          </span>

          <div>
            <h2>Projects</h2>

            <span>
              Organize your AI workspace
            </span>
          </div>

        </div>

        <div className="lyvo-projects-topbar-actions">

          {/* THEME TOGGLE */}

          <button
            type="button"
            className="lyvo-project-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          {/* USER AVATAR */}

          <div
            className="lyvo-project-user-avatar"
            title="Account"
          >
            D
          </div>

        </div>

      </header>


      {/* ======================================
          PROJECTS MAIN
      ====================================== */}

      <section className="lyvo-projects-main">

        {/* ======================================
            PROJECTS HEADER
        ====================================== */}

        <div className="lyvo-projects-header">

          <div>

            <div className="lyvo-projects-eyebrow">
              <span>✦</span>
              WORKSPACE
            </div>

            <h1>
              Your{" "}
              <span className="lyvo-gradient-text">
                Projects
              </span>
            </h1>

            <p>
              Organize your ideas, conversations, and
              AI-powered work in one place.
            </p>

          </div>

          <button
            type="button"
            className="lyvo-project-new-btn"
            onClick={handleOpenModal}
          >
            <span>+</span>
            New Project
          </button>

        </div>


        {/* ======================================
            PROJECT CONTENT
        ====================================== */}

        {projects.length === 0 ? (

          <div className="lyvo-projects-empty">

            <div className="lyvo-projects-empty-icon">
              ◇
            </div>

            <h2>
              Start your first project
            </h2>

            <p>
              Create a project to keep your AI
              conversations, ideas, and work organized.
            </p>

            <button
              type="button"
              className="lyvo-project-empty-btn"
              onClick={handleOpenModal}
            >
              <span>+</span>
              Create your first project
            </button>

          </div>

        ) : (

          <div className="lyvo-project-grid">

            {projects.map((project) => (

              <article
  key={project.id}
  className="lyvo-project-card"
  onClick={() =>
    navigate(`/projects/${project.id}`)
  }
>

                {/* EDIT */}

                <button
                  type="button"
                  className="lyvo-project-edit-btn"
                  onClick={(event) => {
  event.stopPropagation();
  handleEditProject(project);
}}
                  aria-label={`Edit ${project.name}`}
                  title="Edit project"
                >
                  ✎
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  className="lyvo-project-delete-btn"
                  onClick={(event) => {
  event.stopPropagation();
  handleDeleteProject(project.id);
}}
                  aria-label={`Delete ${project.name}`}
                  title="Delete project"
                >
                  ×
                </button>

                {/* PROJECT ICON */}

                <div className="lyvo-project-card-icon">
                  {project.icon || "◇"}
                </div>

                {/* PROJECT NAME */}

                <h3>
                  {project.name}
                </h3>

                {/* PROJECT DESCRIPTION */}

                <p>
                  {project.description ||
                    "No description yet."}
                </p>

                {/* PROJECT FOOTER */}

                <div className="lyvo-project-card-footer">

                  <span>
                    Created just now
                  </span>

                  <span>
                    →
                  </span>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* ======================================
          PROJECT MODAL
      ====================================== */}

      {showModal && (

        <div
          className="lyvo-project-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget
            ) {
              handleCloseModal();
            }

          }}
        >

          <div
            className="lyvo-project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >

            {/* ======================================
                MODAL HEADER
            ====================================== */}

            <div className="lyvo-project-modal-header">

              <div>

                <div className="lyvo-project-modal-icon">
                  ✦
                </div>

                <div>

                  <h2 id="project-modal-title">

                    {editingProjectId
                      ? "Edit project"
                      : "Create a new project"}

                  </h2>

                  <p>

                    {editingProjectId
                      ? "Update your project details."
                      : "Give your project a name and organize your work."}

                  </p>

                </div>

              </div>

              <button
                type="button"
                className="lyvo-project-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* ======================================
                PROJECT FORM
            ====================================== */}

            <form
              className="lyvo-project-form"
              onSubmit={handleSaveProject}
            >

              {/* PROJECT NAME */}

              <div className="lyvo-project-field">

                <label htmlFor="project-name">
                  Project name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. AI Portfolio"
                  autoFocus
                  maxLength={80}
                />

              </div>


              {/* PROJECT DESCRIPTION */}

              <div className="lyvo-project-field">

                <label htmlFor="project-description">

                  Description

                  <span>
                    Optional
                  </span>

                </label>

                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(
                      event.target.value
                    )
                  }
                  placeholder="What are you building?"
                  rows={4}
                  maxLength={300}
                />

                <div className="lyvo-project-character-count">
                  {projectDescription.length}/300
                </div>

              </div>


              {/* PROJECT ICON */}

              <div className="lyvo-project-field">

                <label>
                  Project icon
                </label>

                <div className="lyvo-project-icon-picker">

                  {projectIcons.map((icon) => (

                    <button
                      key={icon}
                      type="button"
                      className={`lyvo-project-icon-option ${
                        selectedIcon === icon
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedIcon(icon)
                      }
                      aria-label={`Select ${icon} icon`}
                    >
                      {icon}
                    </button>

                  ))}

                </div>

              </div>


              {/* ======================================
                  MODAL ACTIONS
              ====================================== */}

              <div className="lyvo-project-modal-actions">

                <button
                  type="button"
                  className="lyvo-project-cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="lyvo-project-create-btn"
                  disabled={!projectName.trim()}
                >

                  <span>
                    {editingProjectId
                      ? "✓"
                      : "+"}
                  </span>

                  {editingProjectId
                    ? "Save Changes"
                    : "Create Project"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

export default Projects;