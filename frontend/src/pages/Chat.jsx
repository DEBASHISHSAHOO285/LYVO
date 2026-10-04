import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";

import api from "../services/api";

// ======================================
// CODE BLOCK
// ======================================

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="lyvo-code-wrapper">
      <button
        type="button"
        className="lyvo-code-copy-btn"
        onClick={handleCopy}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
      >
        {copied ? "✓" : "⧉"}
      </button>

      <pre>
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}

// ======================================
// CHAT
// ======================================

function Chat() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [conversations, setConversations] = useState([]);

  // ======================================
  // FILES
  // ======================================

  const [selectedFiles, setSelectedFiles] = useState([]);

  // ======================================
  // PROJECT CONTEXT
  // ======================================

  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project");

  // ======================================
  // AUTO SCROLL
  // ======================================

  const messagesEndRef = useRef(null);

  // ======================================
  // LOAD CONVERSATIONS
  //
  // Refresh /chat = fresh conversation
  // ======================================

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setHistoryLoading(true);

        const response = await api.get(
          "/chat/conversations"
        );

        const conversationList =
          response.conversations || [];

        setConversations(conversationList);

        // Always start fresh
        setMessages([]);
        setConversationId(null);
        setSelectedFiles([]);
      } catch (error) {
        console.error(
          "Failed to load chat history:",
          error
        );

        setMessages([]);
        setConversationId(null);
        setSelectedFiles([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadConversations();
  }, []);

  // ======================================
  // PROJECT DEBUG
  // ======================================

  useEffect(() => {
    console.log(
      "LYVO Project ID:",
      projectId || "No project selected"
    );
  }, [projectId]);

  // ======================================
  // AUTO SCROLL
  // ======================================

  useEffect(() => {
    if (historyLoading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    historyLoading,
    isLoading,
  ]);

  // ======================================
  // NEW CHAT
  // ======================================

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setSelectedFiles([]);
    setIsLoading(false);
  };

  // ======================================
  // OPEN EXISTING CONVERSATION
  // ======================================

  const handleSelectConversation = async (
    selectedConversationId
  ) => {
    if (
      selectedConversationId === conversationId ||
      isLoading
    ) {
      return;
    }

    try {
      setIsLoading(false);
      setHistoryLoading(true);

      setConversationId(selectedConversationId);

      setSelectedFiles([]);

      const response = await api.get(
        `/chat/conversations/${selectedConversationId}/messages`
      );

      const savedMessages =
        response.messages || [];

      setMessages(
        savedMessages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to load selected conversation:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // ======================================
  // UPLOAD SELECTED FILES
  // ======================================

  const uploadSelectedFiles = async (
    files,
    currentConversationId
  ) => {
    if (
      !files ||
      files.length === 0 ||
      !currentConversationId
    ) {
      return [];
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append(
      "conversationId",
      String(currentConversationId)
    );

    const response = await api.upload(
      "/files/upload",
      formData
    );

    return response.files || [];
  };

  // ======================================
  // SEND MESSAGE
  //
  // IMPORTANT:
  // message + selectedMode + files
  // ======================================

  const handleSendMessage = async (
    message,
    selectedMode = "quick"
  ) => {
    if (
      !message.trim() ||
      isLoading
    ) {
      return;
    }

    try {
      setIsLoading(true);

      let currentConversationId =
        conversationId;

      // Keep a local copy because ChatInput
      // clears its files after calling onSend.
      const filesToUpload = [...selectedFiles];

      // ====================================
      // CREATE CONVERSATION
      // ====================================

      if (!currentConversationId) {
        const conversationResponse =
          await api.post(
            "/chat/conversations",
            {
              title: message.slice(0, 40),

              mode: selectedMode,

              workspaceId: projectId
                ? Number(projectId)
                : null,
            }
          );

        currentConversationId =
          conversationResponse
            .conversation.id;

        setConversationId(
          currentConversationId
        );

        // Add new conversation
        // to sidebar
        setConversations(
          (currentConversations) => [
            conversationResponse.conversation,
            ...currentConversations,
          ]
        );
      }

      // ====================================
      // UPLOAD FILES
      // ====================================

      let uploadedFiles = [];

      if (filesToUpload.length > 0) {
        uploadedFiles =
          await uploadSelectedFiles(
            filesToUpload,
            currentConversationId
          );

        console.log(
          "LYVO uploaded files:",
          uploadedFiles
        );
      }

      // Clear parent file state
      setSelectedFiles([]);

      // ====================================
      // SEND TO LYVO AI
      // ====================================

      const response = await api.post(
        "/chat/send",
        {
          conversationId:
            currentConversationId,

          content: message.trim(),

          // IMPORTANT
          mode: selectedMode,

          workspaceId: projectId
            ? Number(projectId)
            : null,

          // Uploaded file metadata
          files: uploadedFiles,
        }
      );

      const userMessage =
        response.data.userMessage;

      const assistantMessage =
        response.data.assistantMessage;

      // ====================================
      // UPDATE CHAT UI
      // ====================================

      setMessages(
        (currentMessages) => [
          ...currentMessages,

          {
            id: userMessage.id,
            role: "user",
            content:
              userMessage.content,
            files: uploadedFiles,
          },

          {
            id: assistantMessage.id,
            role: "assistant",
            content:
              assistantMessage.content,
          },
        ]
      );

      // ====================================
      // UPDATE CONVERSATION ORDER
      // ====================================

      setConversations(
        (currentConversations) => {
          const updatedConversations =
            currentConversations.map(
              (conversation) =>
                conversation.id ===
                currentConversationId
                  ? {
                      ...conversation,

                      updated_at:
                        new Date().toISOString(),

                      // Keep current mode
                      mode: selectedMode,
                    }
                  : conversation
            );

          return updatedConversations.sort(
            (a, b) => {
              return (
                new Date(b.updated_at) -
                new Date(a.updated_at)
              );
            }
          );
        }
      );
    } catch (error) {
      console.error(
        "Chat request failed:",
        error
      );

      setMessages(
        (currentMessages) => [
          ...currentMessages,

          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              error.message ||
              "Sorry, I couldn't process your request.",
          },
        ]
      );
    } finally {
      setSelectedFiles([]);
      setIsLoading(false);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <main className="lyvo-chat-page">
      {/* ==================================
          SIDEBAR
         ================================== */}

      <ChatSidebar
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={
          conversationId
        }
        onSelectConversation={
          handleSelectConversation
        }
      />

      {/* ==================================
          MAIN
         ================================== */}

      <section className="lyvo-chat-main">
        <ChatHeader />

        <div className="lyvo-chat-content">
          {/* =================================
              LOADING
             ================================= */}

          {historyLoading ? (
            <div className="lyvo-chat-welcome">
              <div className="lyvo-chat-welcome-icon">
                ✦
              </div>

              <h1>
                Loading your{" "}
                <span className="lyvo-gradient-text">
                  workspace...
                </span>
              </h1>

              <p>
                Preparing a fresh LYVO
                conversation.
              </p>
            </div>
          ) : messages.length === 0 ? (
            /* ===============================
               EMPTY CHAT
               =============================== */

            <div className="lyvo-chat-welcome">
              <div className="lyvo-chat-welcome-icon">
                ✦
              </div>

              <h1>
                What can I help you{" "}
                <span className="lyvo-gradient-text">
                  build?
                </span>
              </h1>

              <p>
                Ask LYVO to think, create,
                analyze, plan, or build
                something with you.
              </p>

              {/* =============================
                  SUGGESTIONS
                 ============================= */}

              <div className="lyvo-suggestion-grid">
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Build a website",
                      "build"
                    )
                  }
                >
                  <span>◈</span>
                  Build a website
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Analyze an idea",
                      "deep-think"
                    )
                  }
                >
                  <span>⌁</span>
                  Analyze an idea
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Explain something",
                      "teach"
                    )
                  }
                >
                  <span>✦</span>
                  Explain something
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Create an image",
                      "image"
                    )
                  }
                >
                  <span>◇</span>
                  Create an image
                </button>
              </div>
            </div>
          ) : (
            /* ===============================
               MESSAGE LIST
               =============================== */

            <div className="lyvo-message-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`lyvo-message ${
                    message.role === "user"
                      ? "lyvo-message-user"
                      : "lyvo-message-assistant"
                  }`}
                >
                  <div className="lyvo-message-avatar">
                    {message.role === "user"
                      ? "D"
                      : "✦"}
                  </div>

                  <div className="lyvo-message-content">
                    {message.role ===
                    "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[
                          remarkGfm,
                        ]}
                        components={{
                          code({
                            inline,
                            className,
                            children,
                          }) {
                            // Inline code
                            if (inline) {
                              return (
                                <code
                                  className={
                                    className
                                  }
                                >
                                  {children}
                                </code>
                              );
                            }

                            // Code block
                            return (
                              <CodeBlock
                                className={
                                  className
                                }
                              >
                                {children}
                              </CodeBlock>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <>
                        <p>
                          {message.content}
                        </p>

                        {/* Uploaded files */}
                        {message.files &&
                          message.files.length >
                            0 && (
                            <div className="lyvo-message-files">
                              {message.files.map(
                                (file) => (
                                  <div
                                    key={file.id}
                                    className="lyvo-message-file"
                                  >
                                    <span>
                                      {file.fileType ===
                                      "image"
                                        ? "🖼️"
                                        : "📎"}
                                    </span>

                                    <span>
                                      {
                                        file.originalName
                                      }
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* =============================
                  AI THINKING
                 ============================= */}

              {isLoading && (
                <div className="lyvo-message lyvo-message-assistant">
                  <div className="lyvo-message-avatar lyvo-thinking-avatar">
                    ✦
                  </div>

                  <div className="lyvo-thinking-content">
                    <div className="lyvo-thinking-label">
                      LYVO is thinking
                    </div>

                    <div className="lyvo-thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================
                  AUTO SCROLL
                 ============================= */}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* =================================
            CHAT INPUT
           ================================= */}

        <ChatInput
          onSend={handleSendMessage}
          onFilesChange={setSelectedFiles}
          disabled={
            isLoading ||
            historyLoading
          }
        />
      </section>
    </main>
  );
}

export default Chat;