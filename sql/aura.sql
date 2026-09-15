-- Aura AI database schema (MySQL 8+)
-- Apply via: npm run db:init

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(64) PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(120) NOT NULL,
  last_name     VARCHAR(120) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(120) NOT NULL DEFAULT 'Founder / Operator',
  company       VARCHAR(255) NULL,
  website       VARCHAR(255) NULL,
  team_size     VARCHAR(64) NULL,
  plan          VARCHAR(64) DEFAULT 'starter',
  provider      VARCHAR(32) NOT NULL DEFAULT 'email',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_provider CHECK (provider IN ('email', 'google', 'github', 'microsoft'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id          VARCHAR(64) PRIMARY KEY,
  user_id     VARCHAR(64) NOT NULL,
  token       VARCHAR(128) NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessions_token (token),
  KEY idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_voices (
  user_id     VARCHAR(64) PRIMARY KEY,
  sample      TEXT NOT NULL,
  trained     TINYINT(1) NOT NULL DEFAULT 0,
  traits_json TEXT NOT NULL,
  cadence     TEXT NOT NULL,
  speaker     VARCHAR(64) NOT NULL DEFAULT 'aria',
  trained_at  DATETIME NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_brand_voices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  status     VARCHAR(32) NOT NULL DEFAULT 'Drafting',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_collections_user (user_id),
  CONSTRAINT fk_collections_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_collections_status CHECK (status IN ('Drafting', 'Review', 'Ready', 'Publishing'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collection_documents (
  id            VARCHAR(64) PRIMARY KEY,
  collection_id VARCHAR(64) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'Draft',
  words         INT NOT NULL DEFAULT 0,
  template      VARCHAR(120) NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_documents_collection (collection_id),
  CONSTRAINT fk_documents_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT chk_documents_status CHECK (status IN ('Draft', 'Review', 'Ready', 'Published'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS images (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL,
  prompt     TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_images_user (user_id),
  CONSTRAINT fk_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drafts (
  user_id       VARCHAR(64) PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  template      VARCHAR(120) NULL,
  sections_json MEDIUMTEXT NOT NULL,
  collection_id VARCHAR(64) NULL,
  document_id   VARCHAR(64) NULL,
  voice_applied TINYINT(1) NOT NULL DEFAULT 0,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_drafts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    VARCHAR(64) NOT NULL,
  role       VARCHAR(32) NOT NULL,
  content    MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_chat_user (user_id),
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_chat_role CHECK (role IN ('user', 'assistant', 'system'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
