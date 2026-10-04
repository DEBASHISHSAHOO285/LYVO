CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    avatar_url TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    icon TEXT DEFAULT '✦',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    workspace_id INTEGER,

    title TEXT NOT NULL DEFAULT 'New Conversation',

    mode TEXT NOT NULL DEFAULT 'quick',

    model TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    conversation_id INTEGER NOT NULL,

    role TEXT NOT NULL,

    content TEXT NOT NULL,

    model TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    key TEXT NOT NULL,

    value TEXT NOT NULL,

    category TEXT DEFAULT 'general',

    importance INTEGER DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS image_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    conversation_id INTEGER,

    prompt TEXT NOT NULL,

    revised_prompt TEXT,

    image_url TEXT,

    provider TEXT,

    model TEXT,

    width INTEGER,

    height INTEGER,

    status TEXT DEFAULT 'completed',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id
ON workspaces(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
ON conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_workspace_id
ON conversations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_memories_user_id
ON memories(user_id);

CREATE INDEX IF NOT EXISTS idx_image_generations_user_id
ON image_generations(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME,

    attempts INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================
-- CHAT FILES / ATTACHMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    conversation_id INTEGER,

    original_name TEXT NOT NULL,

    stored_name TEXT NOT NULL,

    file_path TEXT NOT NULL,

    file_url TEXT,

    mime_type TEXT NOT NULL,

    file_size INTEGER NOT NULL,

    file_type TEXT NOT NULL DEFAULT 'document',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_files_user_id
ON files(user_id);

CREATE INDEX IF NOT EXISTS idx_files_conversation_id
ON files(conversation_id);

CREATE INDEX IF NOT EXISTS idx_files_created_at
ON files(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
ON password_reset_tokens(token_hash);