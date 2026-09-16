-- =============================================================
--  001_init.sql  —  DevCenterPoint CMS schema
--
--  Conventions applied throughout:
--    · InnoDB + utf8mb4_unicode_ci everywhere (emoji and non-Latin
--      client names both appear in practice).
--    · Every content table carries `status` so the CMS can draft,
--      preview and publish without a second "revisions" table.
--    · `sort_order` is explicit rather than relying on insertion
--      order, so drag-to-reorder survives a database dump.
--    · Timestamps are UTC (the pool sets timezone: 'Z').
--    · Slugs are UNIQUE — the router depends on it for 404s.
-- =============================================================


-- -------------------------------------------------------------
--  AUTH & SYSTEM
-- -------------------------------------------------------------

-- Named `users` (not `admin_users`) so adding Editor accounts later
-- is a data change, not a schema change.
CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  email          VARCHAR(190)    NOT NULL,
  password_hash  VARCHAR(255)    NOT NULL,
  display_name   VARCHAR(120)    NOT NULL,
  role           ENUM('owner','admin','editor') NOT NULL DEFAULT 'editor',
  last_login_at  DATETIME        NULL,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME        NULL,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session store. express-mysql-session manages this table itself,
-- but we declare it so a fresh clone has it before first login.
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128) NOT NULL,
  expires     INT UNSIGNED NOT NULL,
  data        MEDIUMTEXT   NULL,
  PRIMARY KEY (session_id),
  KEY idx_sessions_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Key/value settings. JSON values keep this flexible without
-- schema churn for every new toggle the CMS grows.
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key   VARCHAR(120) NOT NULL,
  setting_value TEXT         NULL,
  value_type    ENUM('text','html','json','bool','number') NOT NULL DEFAULT 'text',
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media library. `alt_text` is NOT NULL deliberately — it forces the
-- upload form to ask, which is the only reliable way to keep
-- accessibility from being skipped under deadline.
CREATE TABLE IF NOT EXISTS media (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  filename     VARCHAR(255)  NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path         VARCHAR(500)  NOT NULL,
  mime_type    VARCHAR(120)  NOT NULL,
  size_bytes   INT UNSIGNED  NOT NULL,
  width        INT UNSIGNED  NULL,
  height       INT UNSIGNED  NULL,
  alt_text     VARCHAR(500)  NOT NULL DEFAULT '',
  caption      VARCHAR(500)  NULL,
  folder       VARCHAR(120)  NOT NULL DEFAULT 'general',
  uploaded_by  INT UNSIGNED  NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_folder (folder),
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Editable navigation. Lets the client restructure the menu without
-- a deploy, and lets footer/menu locations share one table.
CREATE TABLE IF NOT EXISTS nav_items (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  location    ENUM('primary','footer','legal') NOT NULL DEFAULT 'primary',
  label       VARCHAR(120) NOT NULL,
  url         VARCHAR(500) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  is_external TINYINT(1)   NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_nav_location (location, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 301 redirects. The single most important SEO hedge for an MPA —
-- any URL change becomes a managed row instead of a broken link.
CREATE TABLE IF NOT EXISTS redirects (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_path  VARCHAR(500) NOT NULL,
  to_path    VARCHAR(500) NOT NULL,
  status_code SMALLINT    NOT NULL DEFAULT 301,
  hits       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_redirect_from (from_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact enquiries. The current site has only `mailto:` links, so
-- every enquiry that isn't sent from a configured mail client is
-- lost. This table is the fix.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(190) NOT NULL,
  email        VARCHAR(190) NOT NULL,
  company      VARCHAR(190) NULL,
  phone        VARCHAR(60)  NULL,
  enquiry_type ENUM('review','sprint','delivery','partnership','other') NOT NULL DEFAULT 'other',
  budget_range VARCHAR(60)  NULL,
  message      TEXT         NOT NULL,
  source_path  VARCHAR(500) NULL,
  ip_hash      CHAR(64)     NULL,     -- hashed, never stored raw
  user_agent   VARCHAR(500) NULL,
  is_read      TINYINT(1)   NOT NULL DEFAULT 0,
  is_archived  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_submissions_status (is_read, is_archived, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Append-only audit trail. Cheap to write, and the first thing you
-- want when asking "who changed the pricing page?".
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NULL,
  action      VARCHAR(60)  NOT NULL,
  entity_type VARCHAR(60)  NOT NULL,
  entity_id   INT UNSIGNED NULL,
  summary     VARCHAR(500) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  SERVICES  —  "What we do" (the six disciplines)
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS services (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug           VARCHAR(190) NOT NULL,
  title          VARCHAR(190) NOT NULL,
  tagline        VARCHAR(300) NULL,
  summary        TEXT         NULL,
  body           MEDIUMTEXT   NULL,   -- markdown
  icon_key       VARCHAR(60)  NULL,   -- maps to an inline SVG in the view
  sort_order     INT          NOT NULL DEFAULT 0,
  status         ENUM('draft','published') NOT NULL DEFAULT 'draft',
  is_featured    TINYINT(1)   NOT NULL DEFAULT 0,
  seo_title      VARCHAR(190) NULL,
  seo_description VARCHAR(320) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at   DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_slug (slug),
  KEY idx_services_status_order (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deliverables per service ("API design", "load testing"…). Stored
-- as rows rather than a comma-separated column so they are filterable.
CREATE TABLE IF NOT EXISTS service_deliverables (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id  INT UNSIGNED NOT NULL,
  label       VARCHAR(190) NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_deliverables_service (service_id, sort_order),
  CONSTRAINT fk_deliverables_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  CASE STUDIES  —  the core deliverable of this phase
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_studies (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(190) NOT NULL,
  title         VARCHAR(190) NOT NULL,
  client_name   VARCHAR(190) NOT NULL,
  -- Client may be under NDA; the view shows `client_label` instead.
  client_visibility ENUM('named','anonymised','nda') NOT NULL DEFAULT 'named',
  client_label  VARCHAR(190) NULL,     -- e.g. "A Nordic logistics operator"
  sector        VARCHAR(120) NULL,
  engagement    ENUM('review','sprint','delivery','partnership') NOT NULL DEFAULT 'delivery',
  year          SMALLINT     NULL,
  duration      VARCHAR(60)  NULL,     -- "14 weeks" — a string, not a number
  team_size     TINYINT UNSIGNED NULL,

  -- The narrative spine. Markdown, rendered and sanitised server-side.
  summary       VARCHAR(500) NOT NULL,    -- card + meta description
  context       MEDIUMTEXT   NULL,        -- the situation we inherited
  challenge     MEDIUMTEXT   NULL,        -- the hard part
  approach      MEDIUMTEXT   NULL,        -- what we actually did
  outcome       MEDIUMTEXT   NULL,        -- measurable result

  -- An honest quote carries more weight than a superlative.
  quote         TEXT         NULL,
  quote_attribution VARCHAR(190) NULL,

  cover_media_id INT UNSIGNED NULL,
  cover_alt     VARCHAR(500) NULL,

  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order    INT          NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',

  seo_title     VARCHAR(190) NULL,
  seo_description VARCHAR(320) NULL,

  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at  DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_case_studies_slug (slug),
  KEY idx_case_studies_status (status, is_featured, sort_order),
  CONSTRAINT fk_case_cover FOREIGN KEY (cover_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The results. These render as the big numerals on a case study and
-- are the difference between a portfolio and a claim.
CREATE TABLE IF NOT EXISTS case_study_metrics (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id INT UNSIGNED NOT NULL,
  label         VARCHAR(120) NOT NULL,
  value         VARCHAR(60)  NOT NULL,   -- "72", "3.4"
  unit          VARCHAR(30)  NULL,       -- "%", "ms", "×"
  prefix        VARCHAR(10)  NULL,
  note          VARCHAR(255) NULL,       -- "measured over 30 days"
  sort_order    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_metrics_case (case_study_id, sort_order),
  CONSTRAINT fk_metrics_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_images (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id INT UNSIGNED NOT NULL,
  media_id      INT UNSIGNED NOT NULL,
  caption       VARCHAR(500) NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_cs_images (case_study_id, sort_order),
  CONSTRAINT fk_cs_images_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_images_media FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_tech (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id INT UNSIGNED NOT NULL,
  label         VARCHAR(120) NOT NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_cs_tech (case_study_id, sort_order),
  CONSTRAINT fk_cs_tech_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Which disciplines a project exercised. Powers "related work".
CREATE TABLE IF NOT EXISTS case_study_services (
  case_study_id INT UNSIGNED NOT NULL,
  service_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (case_study_id, service_id),
  KEY idx_cs_services_service (service_id),
  CONSTRAINT fk_cs_services_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_services_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  HOME PAGE SECTIONS  —  drives the 8 storytelling chapters
-- -------------------------------------------------------------

-- The homepage is a sequence of typed blocks. `block_type` selects
-- which view partial renders it, and `content` holds that partial's
-- fields as JSON. This keeps the chapter order editable without
-- adding a table per chapter.
CREATE TABLE IF NOT EXISTS home_sections (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  section_key VARCHAR(60)  NOT NULL,   -- stable id: 'hero', 'cost-curve', …
  scene       VARCHAR(30)  NOT NULL DEFAULT 'shards',  -- maps to the 3D shapeState
  eyebrow     VARCHAR(190) NULL,
  heading     VARCHAR(300) NULL,
  -- Headings support one italic serif phrase; `heading_emphasis`
  -- marks which substring the view wraps in <em>.
  heading_emphasis VARCHAR(190) NULL,
  lede        TEXT         NULL,
  content     JSON         NULL,       -- block-specific fields
  sort_order  INT          NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_home_section_key (section_key),
  KEY idx_home_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  INSIGHTS  —  articles
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS posts (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(190) NOT NULL,
  title         VARCHAR(190) NOT NULL,
  excerpt       VARCHAR(500) NULL,
  body          MEDIUMTEXT   NULL,     -- markdown
  cover_media_id INT UNSIGNED NULL,
  author_id     INT UNSIGNED NULL,
  reading_time  SMALLINT UNSIGNED NULL, -- minutes; computed on save
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  seo_title     VARCHAR(190) NULL,
  seo_description VARCHAR(320) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at  DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_posts_slug (slug),
  KEY idx_posts_status (status, published_at),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_posts_cover FOREIGN KEY (cover_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug  VARCHAR(120) NOT NULL,
  label VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT UNSIGNED NOT NULL,
  tag_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  KEY idx_post_tags_tag (tag_id),
  CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  TEAM · TESTIMONIALS · FAQ
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS team_members (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(190) NOT NULL,
  role        VARCHAR(190) NOT NULL,
  bio         TEXT         NULL,
  photo_media_id INT UNSIGNED NULL,
  location    VARCHAR(120) NULL,
  email       VARCHAR(190) NULL,
  links       JSON         NULL,   -- [{label, url}]
  sort_order  INT          NOT NULL DEFAULT 0,
  status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_team_status_order (status, sort_order),
  CONSTRAINT fk_team_photo FOREIGN KEY (photo_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quote         TEXT         NOT NULL,
  attribution   VARCHAR(190) NOT NULL,
  role          VARCHAR(190) NULL,
  company       VARCHAR(190) NULL,
  avatar_media_id INT UNSIGNED NULL,
  -- Optional link to the project the quote describes.
  case_study_id INT UNSIGNED NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_testimonials_status (status, sort_order),
  CONSTRAINT fk_testimonials_case FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE SET NULL,
  CONSTRAINT fk_testimonials_avatar FOREIGN KEY (avatar_media_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question    VARCHAR(300) NOT NULL,
  answer      TEXT         NOT NULL,
  category    VARCHAR(120) NOT NULL DEFAULT 'general',
  sort_order  INT          NOT NULL DEFAULT 0,
  status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  PRIMARY KEY (id),
  KEY idx_faqs_status (status, category, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  STATIC PAGES  —  about, legal, and anything else
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pages (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(190) NOT NULL,
  title         VARCHAR(190) NOT NULL,
  heading       VARCHAR(300) NULL,
  lede          TEXT         NULL,
  body          MEDIUMTEXT   NULL,
  template      VARCHAR(60)  NOT NULL DEFAULT 'standard',
  show_in_nav   TINYINT(1)   NOT NULL DEFAULT 0,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  seo_title     VARCHAR(190) NULL,
  seo_description VARCHAR(320) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
