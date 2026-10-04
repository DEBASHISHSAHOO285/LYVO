import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ChatSidebar({
  onNewChat,
  conversations = [],
  activeConversationId = null,
  onSelectConversation,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="lyvo-chat-sidebar">
      {/* ======================================
          LOGO
      ====================================== */}

      <div className="lyvo-chat-logo">
        <span className="lyvo-gradient-text">
          LYVO
        </span>
      </div>

      {/* ======================================
          NEW CHAT
      ====================================== */}

      <button
        type="button"
        className="lyvo-btn-primary lyvo-new-chat-btn"
        onClick={onNewChat}
      >
        <span>＋</span>
        New Chat
      </button>

      {/* ======================================
          NAVIGATION
      ====================================== */}

      <div className="lyvo-sidebar-section">
        <p className="lyvo-sidebar-label">
          Workspace
        </p>

        <button
          type="button"
          className="lyvo-sidebar-item active"
        >
          <span>✦</span>
          Chat
        </button>

        <button
          type="button"
          className="lyvo-sidebar-item"
          onClick={() => navigate("/projects")}
        >
          <span>◈</span>
          Projects
        </button>

        <button
  type="button"
  className="lyvo-sidebar-item"
  onClick={() => navigate("/memories")}
>
  <span>⌁</span>
  Memories
</button>
      </div>

      {/* ======================================
          RECENT CHATS
      ====================================== */}

      <div className="lyvo-sidebar-section lyvo-recent-section">
        <p className="lyvo-sidebar-label">
          Recent Chats
        </p>

        {conversations.length === 0 ? (
          <p className="lyvo-sidebar-empty">
            No conversations yet
          </p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={`lyvo-chat-history-item ${
                conversation.id ===
                activeConversationId
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onSelectConversation?.(
                  conversation.id
                )
              }
              title={conversation.title}
            >
              <span className="lyvo-history-icon">
                ✦
              </span>

              <span className="lyvo-history-title">
                {conversation.title ||
                  "New Conversation"}
              </span>
            </button>
          ))
        )}
      </div>

      {/* ======================================
          BOTTOM
      ====================================== */}

      <div className="lyvo-sidebar-bottom">
        <button
  type="button"
  className="lyvo-sidebar-item"
  onClick={() => navigate("/settings")}
>
  <span>⚙</span>
  Settings
</button>

        <button
          type="button"
          className="lyvo-sidebar-item"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default ChatSidebar;