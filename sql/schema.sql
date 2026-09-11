-- Aura AI database schema (SQLite)
-- Pure SQL — no Supabase. Apply via: npm run db:init

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Founder / Operator',
  company       TEXT,
  website       TEXT,
  team_size     TEXT,
  plan          TEXT DEFAULT 'starter',
  provider      TEXT NOT NULL DEFAULT 'email'
                CHECK (provider IN ('email', 'google', 'github', 'microsoft')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brand_voices (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sample      TEXT NOT NULL,
  trained     INTEGER NOT NULL DEFAULT 0 CHECK (trained IN (0, 1)),
  traits_json TEXT NOT NULL DEFAULT '[]',
  cadence     TEXT NOT NULL DEFAULT '',
  speaker     TEXT NOT NULL DEFAULT 'aria',
  trained_at  TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collections (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'Drafting'
             CHECK (status IN ('Drafting', 'Review', 'Ready', 'Publishing')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collection_documents (
  id            TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Draft'
                CHECK (status IN ('Draft', 'Review', 'Ready', 'Published')),
  words         INTEGER NOT NULL DEFAULT 0,
  template      TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS images (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt     TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drafts (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  template     TEXT,
  sections_json TEXT NOT NULL DEFAULT '[]',
  collection_id TEXT,
  document_id   TEXT,
  voice_applied INTEGER NOT NULL DEFAULT 0 CHECK (voice_applied IN (0, 1)),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_collection ON collection_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
