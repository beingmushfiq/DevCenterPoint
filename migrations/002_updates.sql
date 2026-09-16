-- =============================================================
--  002_updates.sql — Company Updates & Newsfeed Schema
-- =============================================================

CREATE TABLE IF NOT EXISTS updates_entries (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  version_tag    VARCHAR(50)     NULL,
  title          VARCHAR(255)    NOT NULL,
  slug           VARCHAR(140)    NOT NULL,
  category       ENUM('feature','milestone','improvement','security','announcement') NOT NULL DEFAULT 'feature',
  summary        VARCHAR(500)    NOT NULL DEFAULT '',
  body           MEDIUMTEXT      NOT NULL,
  published_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_featured    TINYINT(1)      NOT NULL DEFAULT 0,
  sort_order     INT             NOT NULL DEFAULT 0,
  status         ENUM('draft','published') NOT NULL DEFAULT 'published',
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_updates_slug (slug),
  KEY idx_updates_status (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
