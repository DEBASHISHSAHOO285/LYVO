import { useEffect, useRef, useState } from "react";

const MODES = [
  {
    id: "quick",
    icon: "✦",
    label: "Quick",
    description: "Fast answers for everyday tasks",
  },
  {
    id: "deep-think",
    icon: "🧠",
    label: "Deep Think",
    description: "Structured reasoning and analysis",
  },
  {
    id: "build",
    icon: "💻",
    label: "Build Mode",
    description: "Build software, websites and projects",
  },
  {
    id: "teach",
    icon: "📚",
    label: "Teach Mode",
    description: "Learn concepts step by step",
  },
  {
    id: "debate",
    icon: "⚔️",
    label: "AI Debate",
    description: "Explore multiple perspectives",
  },
  {
    id: "decision",
    icon: "🎯",
    label: "Decision Mode",
    description: "Compare options and trade-offs",
  },
  {
    id: "creative",
    icon: "✨",
    label: "Creative",
    description: "Ideas, writing and creative work",
  },
  {
    id: "image",
    icon: "🎨",
    label: "Image Studio",
    description: "Create visual concepts and prompts",
  },
];

function ChatInput({
  onSend,
  onFilesChange,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState("quick");

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const attachMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const textareaRef = useRef(null);

  const currentMode =
    MODES.find((mode) => mode.id === selectedMode) || MODES[0];

  // =========================================
  // CLOSE MENUS WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target)
      ) {
        setShowAttachMenu(false);
      }

      if (
        modeMenuRef.current &&
        !modeMenuRef.current.contains(event.target)
      ) {
        setShowModeMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =========================================
  // AUTO RESIZE TEXTAREA
  // =========================================

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      150
    )}px`;
  }, [message]);

  // =========================================
  // SEND
  // =========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled) {
      return;
    }

    onSend(trimmedMessage, selectedMode);

    setMessage("");
    setSelectedFiles([]);

    if (onFilesChange) {
      onFilesChange([]);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // =========================================
  // KEYBOARD
  // =========================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // =========================================
  // FILE SELECT
  // =========================================

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setSelectedFiles((currentFiles) => {
      const updatedFiles = [...currentFiles, ...files];

      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      return updatedFiles;
    });

    setShowAttachMenu(false);

    // Allows selecting the same file again later
    event.target.value = "";
  };

  // =========================================
  // REMOVE FILE
  // =========================================

  const removeFile = (index) => {
    setSelectedFiles((currentFiles) => {
      const updatedFiles = currentFiles.filter(
        (_, fileIndex) => fileIndex !== index
      );

      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }

      return updatedFiles;
    });
  };

  // =========================================
  // SELECT MODE
  // =========================================

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    setShowModeMenu(false);
  };

  return (
    <div className="lyvo-chat-input-wrapper">
      {/* =====================================
          SELECTED FILES
         ===================================== */}

      {selectedFiles.length > 0 && (
        <div className="lyvo-selected-files">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="lyvo-selected-file"
            >
              <span className="lyvo-selected-file-icon">
                {file.type.startsWith("image/")
                  ? "🖼️"
                  : "📎"}
              </span>

              <span className="lyvo-selected-file-name">
                {file.name}
              </span>

              <button
                type="button"
                onClick={() => removeFile(index)}
                title="Remove file"
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =====================================
          MAIN INPUT
         ===================================== */}

      <form
        className="lyvo-chat-input-box"
        onSubmit={handleSubmit}
      >
        {/* ===================================
            PLUS / ATTACH
           =================================== */}

        <div
          className="lyvo-input-menu-wrapper"
          ref={attachMenuRef}
        >
          <button
            type="button"
            className={`lyvo-input-action ${
              showAttachMenu
                ? "lyvo-input-action-active"
                : ""
            }`}
            onClick={() => {
              setShowAttachMenu(
                (current) => !current
              );

              setShowModeMenu(false);
            }}
            disabled={disabled}
            aria-label="Attach"
            title="Attach"
          >
            +
          </button>

          {showAttachMenu && (
            <div className="lyvo-input-menu lyvo-attach-menu">
              <div className="lyvo-input-menu-title">
                Add to LYVO
              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <span className="lyvo-menu-icon">
                  📎
                </span>

                <span>
                  <strong>
                    Upload file
                  </strong>

                  <small>
                    PDF, DOCX, TXT and more
                  </small>
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  imageInputRef.current?.click()
                }
              >
                <span className="lyvo-menu-icon">
                  🖼️
                </span>

                <span>
                  <strong>
                    Upload image
                  </strong>

                  <small>
                    PNG, JPG, WEBP and more
                  </small>
                </span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFilesSelected}
            accept="
              .pdf,
              .doc,
              .docx,
              .txt,
              .csv,
              .json,
              .md,
              .xlsx,
              .xls
            "
          />

          <input
            ref={imageInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFilesSelected}
            accept="
              image/png,
              image/jpeg,
              image/webp,
              image/gif
            "
          />
        </div>

        {/* ===================================
            TEXTAREA
           =================================== */}

        <textarea
          ref={textareaRef}
          className="lyvo-chat-textarea"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask LYVO anything..."
          disabled={disabled}
          rows={1}
        />

        {/* ===================================
            RIGHT ACTIONS
           =================================== */}

        <div className="lyvo-input-actions">
          {/* =================================
              MODE SELECTOR
             ================================= */}

          <div
            className="lyvo-input-menu-wrapper"
            ref={modeMenuRef}
          >
            <button
              type="button"
              className={`lyvo-input-action lyvo-mode-btn ${
                showModeMenu
                  ? "lyvo-input-action-active"
                  : ""
              }`}
              onClick={() => {
                setShowModeMenu(
                  (current) => !current
                );

                setShowAttachMenu(false);
              }}
              disabled={disabled}
              aria-label="Choose AI mode"
              title={`Mode: ${currentMode.label}`}
            >
              {currentMode.icon}
            </button>

            {showModeMenu && (
              <div className="lyvo-input-menu lyvo-mode-menu">
                <div className="lyvo-input-menu-title">
                  LYVO Mode
                </div>

                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={
                      selectedMode === mode.id
                        ? "lyvo-mode-option-selected"
                        : ""
                    }
                    onClick={() =>
                      handleModeSelect(mode.id)
                    }
                  >
                    <span className="lyvo-menu-icon">
                      {mode.icon}
                    </span>

                    <span className="lyvo-mode-info">
                      <strong>
                        {mode.label}
                      </strong>

                      <small>
                        {mode.description}
                      </small>
                    </span>

                    {selectedMode === mode.id && (
                      <span className="lyvo-mode-check">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================
              SEND
             ================================= */}

          <button
            type="submit"
            className="lyvo-send-btn"
            disabled={
              disabled || !message.trim()
            }
            aria-label="Send message"
            title="Send message"
          >
            ↑
          </button>
        </div>
      </form>

      {/* =====================================
          ACTIVE MODE
         ===================================== */}

      {selectedMode !== "quick" && (
        <div className="lyvo-active-mode">
          <span>
            {currentMode.icon}
          </span>

          <span>
            {currentMode.label}
          </span>

          <button
            type="button"
            onClick={() =>
              setSelectedMode("quick")
            }
            aria-label="Switch to Quick mode"
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================
          DISCLAIMER
         ===================================== */}

      <p className="lyvo-input-hint">
        LYVO can make mistakes. Check important
        information.
      </p>
    </div>
  );
}

export default ChatInput;