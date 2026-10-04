import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ProjectWorkspace() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/projects/${projectId}`);

        if (response.success) {
          setProject(response.project);
        } else {
          setError("Project could not be loaded.");
        }
      } catch (error) {
        console.error("Load project error:", error);

        setError(
          error.message || "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  return (
    <main className="lyvo-project-workspace-page">
      <header className="lyvo-project-workspace-topbar">
        <button
          type="button"
          className="lyvo-project-workspace-back"
          onClick={() => navigate("/projects")}
          aria-label="Back to projects"
          title="Back to projects"
        >
          ←
        </button>

        <div className="lyvo-project-workspace-title">
          <div className="lyvo-project-workspace-icon">
            {project?.icon || "✦"}
          </div>

          <div>
            <h2>
              {loading
                ? "Loading project..."
                : project?.name || "Project Workspace"}
            </h2>

            <span>
              {project
                ? `Project #${project.id}`
                : `Project #${projectId}`}
            </span>
          </div>
        </div>
      </header>

      <section className="lyvo-project-workspace-main">
        {loading ? (
          <div className="lyvo-project-workspace-empty">
            <div className="lyvo-project-workspace-empty-icon">
              ◌
            </div>

            <h2>Loading project...</h2>

            <p>
              Please wait while we load your project
              workspace.
            </p>
          </div>
        ) : error ? (
          <div className="lyvo-project-workspace-empty">
            <div className="lyvo-project-workspace-empty-icon">
              !
            </div>

            <h2>Unable to load project</h2>

            <p>{error}</p>

            <button
              type="button"
              className="lyvo-project-workspace-chat-btn"
              onClick={() => navigate("/projects")}
            >
              <span>←</span>
              Back to Projects
            </button>
          </div>
        ) : (
          <>
            <div className="lyvo-project-workspace-hero">
              <div className="lyvo-project-workspace-hero-icon">
                {project?.icon || "✦"}
              </div>

              <div>
                <div className="lyvo-project-workspace-eyebrow">
                  PROJECT WORKSPACE
                </div>

                <h1>
                  {project?.name || "Untitled Project"}
                </h1>

                <p>
                  {project?.description ||
                    "Your conversations, ideas, and AI-powered work will live here."}
                </p>
              </div>
            </div>

            <div className="lyvo-project-workspace-empty">
              <div className="lyvo-project-workspace-empty-icon">
                ◇
              </div>

              <h2>Your workspace is ready</h2>

              <p>
                Start a conversation and build{" "}
                <strong>
                  {project?.name || "your project"}
                </strong>{" "}
                with LYVO AI.
              </p>

              <button
                type="button"
                className="lyvo-project-workspace-chat-btn"
                onClick={() => navigate(`/chat?project=${project.id}`)}
              >
                <span>✦</span>
                Start a conversation
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default ProjectWorkspace;