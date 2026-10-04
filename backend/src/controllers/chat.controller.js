    const db = require("../../database/database");

    const {
    generateAIResponse,
    } = require("../services/ai.service");

    /* ======================================
    CREATE CONVERSATION
    ====================================== */

    function createConversation(req, res) {
    try {
        const userId = req.user.userId;

        const {
        title = "New Conversation",
        mode = "quick",
        model = null,
        workspaceId = null,
        } = req.body;

        const allowedModes = [
        "quick",
        "deep-think",
        "build",
        "teach",
        "debate",
        "decision",
        "creative",
        "image",
        ];

        if (!allowedModes.includes(mode)) {
        return res.status(400).json({
            success: false,
            message: "Invalid conversation mode.",
        });
        }

        if (
        workspaceId !== null &&
        (!Number.isInteger(Number(workspaceId)) ||
            Number(workspaceId) <= 0)
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid workspace ID.",
        });
        }

        /* ======================================
        VERIFY WORKSPACE OWNERSHIP
        ====================================== */

        if (workspaceId !== null) {
        const workspace = db
            .prepare(
            `
            SELECT id
            FROM workspaces
            WHERE id = ? AND user_id = ?
            `
            )
            .get(Number(workspaceId), userId);

        if (!workspace) {
            return res.status(404).json({
            success: false,
            message: "Project not found.",
            });
        }
        }

        const result = db
        .prepare(
            `
            INSERT INTO conversations (
            user_id,
            workspace_id,
            title,
            mode,
            model
            )
            VALUES (?, ?, ?, ?, ?)
            `
        )
        .run(
            userId,
            workspaceId !== null
            ? Number(workspaceId)
            : null,
            String(title).trim() || "New Conversation",
            mode,
            model
        );

        const conversation = db
        .prepare(
            `
            SELECT
            id,
            user_id,
            workspace_id,
            title,
            mode,
            model,
            created_at,
            updated_at
            FROM conversations
            WHERE id = ?
            AND user_id = ?
            `
        )
        .get(result.lastInsertRowid, userId);

        return res.status(201).json({
        success: true,
        message: "Conversation created successfully.",
        conversation,
        });
    } catch (error) {
        console.error("Create conversation error:", error);

        return res.status(500).json({
        success: false,
        message: "Unable to create conversation.",
        });
    }
    }

    /* ======================================
    GET USER CONVERSATIONS
    ====================================== */

    function getConversations(req, res) {
    try {
        const userId = req.user.userId;

        const conversations = db
        .prepare(
            `
            SELECT
            id,
            workspace_id,
            title,
            mode,
            model,
            created_at,
            updated_at
            FROM conversations
            WHERE user_id = ?
            ORDER BY updated_at DESC, id DESC
            `
        )
        .all(userId);

        return res.status(200).json({
        success: true,
        conversations,
        });
    } catch (error) {
        console.error("Get conversations error:", error);

        return res.status(500).json({
        success: false,
        message: "Unable to fetch conversations.",
        });
    }
    }

    /* ======================================
    CREATE MESSAGE
    ====================================== */

    function createMessage(req, res) {
    try {
        const userId = req.user.userId;

        const {
        conversationId,
        content,
        mode,
        workspaceId,
        } = req.body;

        /* ======================================
        VERIFY WORKSPACE
        ====================================== */

        if (workspaceId) {
        const workspace = db
            .prepare(
            `
            SELECT id
            FROM workspaces
            WHERE id = ? AND user_id = ?
            `
            )
            .get(Number(workspaceId), userId);

        if (!workspace) {
            return res.status(404).json({
            success: false,
            message: "Project not found.",
            });
        }

        db.prepare(
            `
            UPDATE conversations
            SET workspace_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            `
        ).run(
            Number(workspaceId),
            Number(conversationId),
            userId
        );
        }

        if (!conversationId) {
        return res.status(400).json({
            success: false,
            message: "Conversation ID is required.",
        });
        }

        if (
        typeof content !== "string" ||
        !content.trim()
        ) {
        return res.status(400).json({
            success: false,
            message: "Message content is required.",
        });
        }

        const role = req.body.role || "user";
        const model = req.body.model || null;

        const allowedRoles = [
        "user",
        "assistant",
        "system",
        ];

        if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid message role.",
        });
        }

        const conversation = db
        .prepare(
            `
            SELECT id
            FROM conversations
            WHERE id = ?
            AND user_id = ?
            `
        )
        .get(Number(conversationId), userId);

        if (!conversation) {
        return res.status(404).json({
            success: false,
            message: "Conversation not found.",
        });
        }

        const result = db
        .prepare(
            `
            INSERT INTO messages (
            conversation_id,
            role,
            content,
            model
            )
            VALUES (?, ?, ?, ?)
            `
        )
        .run(
            Number(conversationId),
            role,
            content.trim(),
            model
        );

        db.prepare(
        `
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
            AND user_id = ?
        `
        ).run(
        Number(conversationId),
        userId
        );

        const message = db
        .prepare(
            `
            SELECT
            id,
            conversation_id,
            role,
            content,
            model,
            created_at
            FROM messages
            WHERE id = ?
            `
        )
        .get(result.lastInsertRowid);

        return res.status(201).json({
        success: true,
        message: "Message saved successfully.",
        data: message,
        });
    } catch (error) {
        console.error("Create message error:", error);

        return res.status(500).json({
        success: false,
        message: "Unable to save message.",
        });
    }
    }

    /* ======================================
    GET CONVERSATION MESSAGES
    ====================================== */

    function getMessages(req, res) {
    try {
        const userId = req.user.userId;

        const conversationId = Number(
        req.params.conversationId
        );

        if (
        !Number.isInteger(conversationId) ||
        conversationId <= 0
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid conversation ID.",
        });
        }

        const conversation = db
        .prepare(
            `
            SELECT id
            FROM conversations
            WHERE id = ?
            AND user_id = ?
            `
        )
        .get(conversationId, userId);

        if (!conversation) {
        return res.status(404).json({
            success: false,
            message: "Conversation not found.",
        });
        }

        const messages = db
        .prepare(
            `
            SELECT
            id,
            conversation_id,
            role,
            content,
            model,
            created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC, id ASC
            `
        )
        .all(conversationId);

        return res.status(200).json({
        success: true,
        conversationId,
        messages,
        });
    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
        success: false,
        message: "Unable to fetch conversation messages.",
        });
    }
    }

    /* ======================================
    SEND MESSAGE TO AI
    ====================================== */

    async function sendMessageToAI(req, res) {
  try {
    const userId = req.user.userId;

    const {
      conversationId,
      content,
      mode = "quick",
      model = null,
      workspaceId = null,
      files = [],
    } = req.body;

    // --------------------------------------
    // Validate request
    // --------------------------------------

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required.",
      });
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message content is required.",
      });
    }

    // --------------------------------------
    // Validate files array
    // --------------------------------------

    if (!Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        message: "Files must be an array.",
      });
    }

    // --------------------------------------
    // Verify conversation ownership
    // --------------------------------------

    const conversation = db
      .prepare(
        `
        SELECT
          id,
          workspace_id,
          title,
          mode,
          model
        FROM conversations
        WHERE id = ?
          AND user_id = ?
      `
      )
      .get(
        Number(conversationId),
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    // --------------------------------------
    // Verify + attach project/workspace
    // --------------------------------------

    if (workspaceId !== null) {
      if (
        !Number.isInteger(Number(workspaceId)) ||
        Number(workspaceId) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid workspace ID.",
        });
      }

      const workspace = db
        .prepare(
          `
          SELECT id
          FROM workspaces
          WHERE id = ? AND user_id = ?
        `
        )
        .get(
          Number(workspaceId),
          userId
        );

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      // Attach this conversation to the project.
      db.prepare(
        `
        UPDATE conversations
        SET
          workspace_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND user_id = ?
      `
      ).run(
        Number(workspaceId),
        Number(conversationId),
        userId
      );

      conversation.workspace_id =
        Number(workspaceId);
    }

    // --------------------------------------
    // Get attached files
    // --------------------------------------

    let attachments = [];

    if (files.length > 0) {
      const fileIds = files
        .map((file) => {
          if (
            typeof file === "object" &&
            file !== null
          ) {
            return Number(file.id);
          }

          return Number(file);
        })
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        );

      if (fileIds.length > 0) {
        const placeholders = fileIds
          .map(() => "?")
          .join(", ");

        attachments = db
          .prepare(
            `
            SELECT
              id,
              user_id,
              conversation_id,
              original_name,
              stored_name,
              file_path,
              mime_type,
              file_size,
              file_type
            FROM files
            WHERE user_id = ?
              AND conversation_id = ?
              AND id IN (${placeholders})
            ORDER BY id ASC
          `
          )
          .all(
            userId,
            Number(conversationId),
            ...fileIds
          );
      }
    }

    // --------------------------------------
    // Save user message
    // --------------------------------------

    const userMessageResult = db
      .prepare(
        `
        INSERT INTO messages (
          conversation_id,
          role,
          content,
          model
        )
        VALUES (?, 'user', ?, ?)
      `
      )
      .run(
        Number(conversationId),
        content.trim(),
        model
      );

    // --------------------------------------
    // Get conversation history
    // --------------------------------------

    const history = db
      .prepare(
        `
        SELECT
          role,
          content
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC, id ASC
      `
      )
      .all(Number(conversationId));

    // --------------------------------------
    // Convert file paths to absolute paths
    // --------------------------------------

    const path = require("path");

    const aiAttachments = attachments.map(
      (file) => ({
        id: file.id,
        originalName:
          file.original_name,
        mimeType: file.mime_type,
        fileType: file.file_type,
        filePath: path.resolve(
          process.cwd(),
          file.file_path
        ),
      })
    );

    // --------------------------------------
    // Generate AI response
    // --------------------------------------

    const aiResponse =
      await generateAIResponse({
        messages: history,
        mode:
          conversation.mode || mode,
        model:
          model || conversation.model,
        attachments: aiAttachments,
      });

    // --------------------------------------
    // Save AI response
    // --------------------------------------

    const assistantMessageResult =
      db
        .prepare(
          `
          INSERT INTO messages (
            conversation_id,
            role,
            content,
            model
          )
          VALUES (?, 'assistant', ?, ?)
        `
        )
        .run(
          Number(conversationId),
          aiResponse.content,
          aiResponse.model
        );

    // --------------------------------------
    // Update conversation
    // --------------------------------------

    db.prepare(
      `
      UPDATE conversations
      SET
        updated_at = CURRENT_TIMESTAMP,
        model = COALESCE(?, model)
      WHERE id = ?
        AND user_id = ?
    `
    ).run(
      aiResponse.model,
      Number(conversationId),
      userId
    );

    // --------------------------------------
    // Fetch saved user message
    // --------------------------------------

    const userMessage = db
      .prepare(
        `
        SELECT
          id,
          conversation_id,
          role,
          content,
          model,
          created_at
        FROM messages
        WHERE id = ?
      `
      )
      .get(
        userMessageResult.lastInsertRowid
      );

    // --------------------------------------
    // Fetch saved assistant message
    // --------------------------------------

    const assistantMessage = db
      .prepare(
        `
        SELECT
          id,
          conversation_id,
          role,
          content,
          model,
          created_at
        FROM messages
        WHERE id = ?
      `
      )
      .get(
        assistantMessageResult.lastInsertRowid
      );

    // --------------------------------------
    // Return response
    // --------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "AI response generated successfully.",

      data: {
        userMessage,
        assistantMessage,

        files: attachments.map(
          (file) => ({
            id: file.id,
            originalName:
              file.original_name,
            mimeType: file.mime_type,
            fileType: file.file_type,
            fileSize: file.file_size,
          })
        ),

        model: aiResponse.model,
        mode: aiResponse.mode,
        usage: aiResponse.usage,
      },
    });
  } catch (error) {
    console.error(
      "Send message to AI error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate AI response.",
    });
  }
}

    /* ======================================
    EXPORT CONTROLLERS
    ====================================== */

    module.exports = {
    createConversation,
    getConversations,
    createMessage,
    getMessages,
    sendMessageToAI,
    };