import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);
  const [formError, setFormError] = useState("");

  const [memoryForm, setMemoryForm] = useState({
    key: "",
    value: "",
    category: "general",
    importance: 1,
  });

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadMemories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/memories");

        if (response.success) {
          setMemories(response.memories || []);
        } else {
          setMemories([]);
          setError("Failed to load memories.");
        }
      } catch (error) {
        console.error("Load memories error:", error);

        setError(
          error.message || "Failed to load memories."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setMemoryForm((current) => ({
      ...current,
      [name]:
        name === "importance"
          ? Number(value)
          : value,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);

    setMemoryForm({
      key: "",
      value: "",
      category: "general",
      importance: 1,
    });
  };

  const handleAddMemory = async (event) => {
  event.preventDefault();

  if (!memoryForm.key.trim()) {
    setFormError("Please enter a memory.");
    return;
  }

  if (!memoryForm.value.trim()) {
    setFormError("Please enter the memory details.");
    return;
  }

  try {
    setSavingMemory(true);
    setFormError("");

    const response = await api.post("/memories", {
      key: memoryForm.key.trim(),
      value: memoryForm.value.trim(),
      category: memoryForm.category,
      importance: memoryForm.importance,
    });

    if (!response.success) {
      throw new Error(
        response.message || "Failed to save memory."
      );
    }

    /* Add newly created memory to the list */
    if (response.memory) {
      setMemories((currentMemories) => [
        response.memory,
        ...currentMemories,
      ]);
    }

    /* Close modal */
    setShowAddModal(false);

    /* Reset form */
    setMemoryForm({
      key: "",
      value: "",
      category: "general",
      importance: 1,
    });
  } catch (error) {
    console.error("Create memory error:", error);

    setFormError(
      error.message || "Failed to save memory."
    );
  } finally {
    setSavingMemory(false);
  }
};

  return (
    <main className="lyvo-memories-page">

      {/* ================= TOP BAR ================= */}
      <header className="lyvo-memories-topbar">
        <button
          type="button"
          className="lyvo-memories-back"
          onClick={() => navigate("/chat")}
          aria-label="Back to chat"
          title="Back to chat"
        >
          ←
        </button>

        <div className="lyvo-memories-title">
          <div className="lyvo-memories-icon">
            ⌁
          </div>

          <div>
            <h2>Memories</h2>
            <span>
              What LYVO remembers about you
            </span>
          </div>
        </div>

        <div className="lyvo-memories-actions">
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

          <div
            className="lyvo-project-user-avatar"
            title="Account"
          >
            D
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <section className="lyvo-memories-main">

        {/* ================= HERO ================= */}
        <div className="lyvo-memories-hero">

          <div className="lyvo-memories-hero-icon">
            ⌁
          </div>

          <div className="lyvo-memories-hero-content">
            <div className="lyvo-memories-eyebrow">
              AI MEMORY
            </div>

            <h1>
              LYVO remembers what matters.
            </h1>

            <p>
              Memories help LYVO understand your
              preferences, goals, and important
              context across conversations.
            </p>
          </div>

          {/* ADD MEMORY BUTTON */}
          <button
            type="button"
            className="lyvo-memories-add-btn"
            onClick={() => {
  setFormError("");
  setShowAddModal(true);
}}
          >
            <span>＋</span>
            Add Memory
          </button>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="lyvo-memories-empty">
            <div className="lyvo-memories-empty-icon">
              ⌁
            </div>

            <h2>
              Loading memories...
            </h2>

            <p>
              LYVO is loading the information it
              has saved about you.
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="lyvo-memories-empty">
            <div className="lyvo-memories-empty-icon">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              type="button"
              className="lyvo-memories-chat-btn"
              onClick={() =>
                window.location.reload()
              }
            >
              <span>↻</span>
              Try again
            </button>
          </div>
        )}

        {/* ================= NO MEMORIES ================= */}
        {!loading &&
          !error &&
          memories.length === 0 && (
            <div className="lyvo-memories-empty">

              <div className="lyvo-memories-empty-icon">
                ✦
              </div>

              <h2>
                No memories yet
              </h2>

              <p>
                As you chat with LYVO, useful
                information can be saved here to
                make future conversations more
                personalized.
              </p>

              <button
                type="button"
                className="lyvo-memories-chat-btn"
                onClick={() =>
                  setShowAddModal(true)
                }
              >
                <span>＋</span>
                Add your first memory
              </button>
            </div>
          )}

        {/* ================= MEMORIES LIST ================= */}
        {!loading &&
          !error &&
          memories.length > 0 && (
            <div className="lyvo-memories-list">

              <div className="lyvo-memories-list-header">
                <div>
                  <div className="lyvo-memories-eyebrow">
                    SAVED MEMORIES
                  </div>

                  <h2>
                    {memories.length}{" "}
                    {memories.length === 1
                      ? "memory"
                      : "memories"}
                  </h2>
                </div>
              </div>

              <div className="lyvo-memories-grid">

                {memories.map((memory) => (
                  <article
                    key={memory.id}
                    className="lyvo-memory-card"
                  >
                    <div className="lyvo-memory-card-top">

                      <div className="lyvo-memory-card-icon">
                        ✦
                      </div>

                      <span className="lyvo-memory-category">
                        {memory.category ||
                          "general"}
                      </span>
                    </div>

                    <div className="lyvo-memory-card-content">

                      <h3>
                        {memory.key ||
                          "Memory"}
                      </h3>

                      <p>
                        {memory.value}
                      </p>

                    </div>

                    <div className="lyvo-memory-card-footer">

                      <span>
                        Importance:{" "}
                        {memory.importance ?? 1}
                      </span>

                      {memory.updated_at && (
                        <span>
                          {new Date(
                            memory.updated_at
                          ).toLocaleDateString()}
                        </span>
                      )}

                    </div>
                  </article>
                ))}

              </div>
            </div>
          )}

      </section>

      {/* ================= ADD MEMORY MODAL ================= */}
      {showAddModal && (
        <div
          className="lyvo-memory-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="lyvo-memory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-memory-title"
          >

            {/* MODAL HEADER */}
            <div className="lyvo-memory-modal-header">

              <div>
                <div className="lyvo-memories-eyebrow">
                  AI MEMORY
                </div>

                <h2 id="add-memory-title">
                  Add a memory
                </h2>

                <p>
                  Save something important for LYVO
                  to remember.
                </p>
              </div>

              <button
                type="button"
                className="lyvo-memory-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form
              className="lyvo-memory-form"
              onSubmit={handleAddMemory}
            >

              {/* KEY */}
              <div className="lyvo-memory-form-group">

                <label htmlFor="memory-key">
                  Memory
                </label>

                <input
                  id="memory-key"
                  name="key"
                  type="text"
                  className="lyvo-input"
                  placeholder="e.g. Career goal"
                  value={memoryForm.key}
                  onChange={handleFormChange}
                  required
                />

              </div>

              {/* VALUE */}
              <div className="lyvo-memory-form-group">

                <label htmlFor="memory-value">
                  Details
                </label>

                <textarea
                  id="memory-value"
                  name="value"
                  className="lyvo-input lyvo-memory-textarea"
                  placeholder="e.g. I want to build a career in Data Science."
                  value={memoryForm.value}
                  onChange={handleFormChange}
                  rows={4}
                  required
                />

              </div>

              {/* CATEGORY */}
              <div className="lyvo-memory-form-row">

                <div className="lyvo-memory-form-group">

                  <label htmlFor="memory-category">
                    Category
                  </label>

                  <select
                    id="memory-category"
                    name="category"
                    className="lyvo-input"
                    value={memoryForm.category}
                    onChange={handleFormChange}
                  >
                    <option value="general">
                      General
                    </option>

                    <option value="preference">
                      Preference
                    </option>

                    <option value="goal">
                      Goal
                    </option>

                    <option value="work">
                      Work
                    </option>

                    <option value="education">
                      Education
                    </option>

                    <option value="personal">
                      Personal
                    </option>
                  </select>

                </div>

                {/* IMPORTANCE */}
                <div className="lyvo-memory-form-group">

                  <label htmlFor="memory-importance">
                    Importance
                  </label>

                  <select
                    id="memory-importance"
                    name="importance"
                    className="lyvo-input"
                    value={memoryForm.importance}
                    onChange={handleFormChange}
                  >
                    <option value={1}>
                      1 — Low
                    </option>

                    <option value={2}>
                      2
                    </option>

                    <option value={3}>
                      3 — Medium
                    </option>

                    <option value={4}>
                      4
                    </option>

                    <option value={5}>
                      5 — High
                    </option>
                  </select>

                </div>

              </div>

              {/* ACTIONS */}
              <div className="lyvo-memory-form-actions">

                <button
                  type="button"
                  className="lyvo-btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>

                <button
  type="submit"
  className="lyvo-btn-primary"
  disabled={savingMemory}
>
  <span>
    {savingMemory ? "..." : "＋"}
  </span>

  {savingMemory
    ? "Saving..."
    : "Save Memory"}
</button>

              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Memories;