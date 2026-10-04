import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

function ChatHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const userName = user?.name || "User";

  const userInitial = userName
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="lyvo-chat-header">
      <div>
        <p className="lyvo-chat-header-title">AI Workspace</p>

        <span className="lyvo-chat-header-status">
          <span className="lyvo-status-dot"></span>
          LYVO is ready
        </span>
      </div>

      <div className="lyvo-chat-header-actions">
        <button
          className="lyvo-icon-btn"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        <button
          className="lyvo-avatar"
          title={userName}
          aria-label={`Profile of ${userName}`}
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;