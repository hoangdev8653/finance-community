-- Finance Community database schema reference (PostgreSQL).
-- Column definitions follow apps/api/src/database/schema; selected migration-only constraints are included.
-- The migration history and Drizzle declarations contain some nullability/constraint drift.
-- Migrations 0011 enforce NOT NULL on categories.domain_id, posts.domain_id, and posts.category_id.
-- Contains 34 application tables, including daily platform and post view aggregates.
-- Reference only, not a migration runner. Compare with the live DB before applying anywhere.

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email varchar(255) NOT NULL CONSTRAINT uq_users_email UNIQUE,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE',
  provider varchar(30) NOT NULL DEFAULT 'LOCAL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL CONSTRAINT uq_roles_name UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL CONSTRAINT uq_domains_code UNIQUE,
  slug varchar(80) NOT NULL CONSTRAINT uq_domains_slug UNIQUE,
  name varchar(120) NOT NULL,
  name_vi varchar(120),
  name_en varchar(120),
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_promoted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  cloudinary_public_id varchar(255) NOT NULL CONSTRAINT uq_media_cloudinary_public_id UNIQUE,
  secure_url varchar(500) NOT NULL,
  resource_type varchar(20) NOT NULL,
  format varchar(20),
  width integer,
  height integer,
  file_size integer,
  content_hash varchar(64),
  purpose varchar(20) NOT NULL DEFAULT 'content',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_content_hash
  ON media(content_hash) WHERE content_hash IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(120) NOT NULL,
  scope varchar(20) NOT NULL CONSTRAINT chk_categories_scope CHECK (scope IN ('COMMUNITY', 'SERIES')),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_vi varchar(100),
  name_en varchar(100),
  content_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_promoted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_categories_scope_slug UNIQUE (scope, slug),
  CONSTRAINT uq_categories_scope_name UNIQUE (scope, name),
  CONSTRAINT chk_categories_content_types CHECK (content_types <@ '["COMMUNITY", "SERIES"]'::jsonb)
);
CREATE INDEX IF NOT EXISTS idx_categories_domain_id ON categories(domain_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL CONSTRAINT uq_profiles_user_id UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username varchar(50) NOT NULL CONSTRAINT uq_profiles_username UNIQUE,
  display_name varchar(100),
  avatar_media_id uuid,
  avatar_url varchar(2048),
  bio text,
  reputation_score integer NOT NULL DEFAULT 0,
  badge varchar(50) NOT NULL DEFAULT 'MEMBER',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL CONSTRAINT uq_auth_credentials_user_id UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  password_hash varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL CONSTRAINT uq_tags_name UNIQUE,
  slug varchar(120) NOT NULL CONSTRAINT uq_tags_slug UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content_type varchar(20) NOT NULL CONSTRAINT chk_posts_content_type CHECK (content_type IN ('COMMUNITY', 'SERIES')),
  title varchar(300) NOT NULL,
  slug varchar(350) NOT NULL,
  body text,
  cover_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE SET NULL,
  status varchar(20) NOT NULL DEFAULT 'DRAFT',
  editorial_status varchar(20) NOT NULL DEFAULT 'DRAFT' CONSTRAINT chk_posts_editorial_status CHECK (editorial_status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'NEEDS_UPDATE', 'ARCHIVED')),
  moderation_status varchar(20) NOT NULL DEFAULT 'UNREVIEWED',
  moderated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  moderation_reason text,
  meta_title varchar(70),
  meta_description varchar(160),
  view_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_posts_content_type_slug UNIQUE (content_type, slug)
);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_domain_id ON posts(domain_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_domain_category_status ON posts(domain_id, category_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_learning_editorial_status ON posts(content_type, editorial_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  name varchar(120) NOT NULL,
  slug varchar(140) NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_topics_domain_slug UNIQUE (domain_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_topics_domain_id ON topics(domain_id);
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON topics(category_id);

CREATE TABLE IF NOT EXISTS post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
  CONSTRAINT uq_post_tags_post_tag UNIQUE (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT uq_post_media_post_media UNIQUE (post_id, media_id)
);

CREATE TABLE IF NOT EXISTS post_topics (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_topics PRIMARY KEY (post_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_post_topics_topic_id ON post_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_post_id ON post_topics(post_id);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  parent_id uuid REFERENCES comments(id) ON DELETE SET NULL,
  body text NOT NULL,
  media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  status varchar(20) NOT NULL DEFAULT 'VISIBLE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_status_created_at ON comments(status, created_at);

CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type varchar(20) NOT NULL DEFAULT 'LIKE',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_post_reactions_user_post UNIQUE (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);

CREATE TABLE IF NOT EXISTS comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type varchar(20) NOT NULL DEFAULT 'LIKE',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_comment_reactions_user_comment UNIQUE (user_id, comment_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_post_bookmarks_user_post UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(30) NOT NULL,
  title varchar(255) NOT NULL,
  message text,
  reference_post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  reference_comment_id uuid REFERENCES comments(id) ON DELETE SET NULL,
  reference_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reported_post_id uuid REFERENCES posts(id) ON DELETE RESTRICT,
  reported_comment_id uuid REFERENCES comments(id) ON DELETE RESTRICT,
  reported_user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  reason varchar(100) NOT NULL,
  description text,
  status varchar(20) NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  report_id uuid REFERENCES reports(id) ON DELETE SET NULL,
  action_type varchar(30) NOT NULL CONSTRAINT chk_moderation_actions_action_type CHECK (action_type IN ('WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS', 'APPROVE_POST', 'BAN_POST')),
  target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  entity_type varchar(50) NOT NULL,
  entity_id varchar(100),
  metadata jsonb,
  ip_address varchar(45),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(300) NOT NULL,
  slug varchar(320) NOT NULL UNIQUE,
  description text,
  estimated_duration_minutes integer CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0),
  learning_outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  hero_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  hero_alt_text varchar(250),
  outcomes_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  outcomes_alt_text varchar(250),
  cta_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  cta_alt_text varchar(250),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED')),
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_series_domain_category ON learning_series(domain_id, category_id);

CREATE TABLE IF NOT EXISTS learning_series_posts (
  series_id uuid NOT NULL REFERENCES learning_series(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  lesson_order integer NOT NULL CHECK (lesson_order > 0),
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_learning_series_posts PRIMARY KEY (series_id, post_id),
  CONSTRAINT uq_learning_series_order UNIQUE (series_id, lesson_order)
);

CREATE TABLE IF NOT EXISTS learning_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title varchar(300) NOT NULL,
  url varchar(1000) NOT NULL,
  publisher varchar(200),
  source_type varchar(30) NOT NULL DEFAULT 'REFERENCE',
  checked_at timestamptz,
  is_public boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_sources_post_id ON learning_sources(post_id);

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_quizzes_post_id UNIQUE (post_id)
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  completed_at timestamptz,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_learning_progress PRIMARY KEY (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash varchar(64) NOT NULL,
  family uuid NOT NULL,
  is_revoked boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family);

CREATE TABLE IF NOT EXISTS page_views_daily (
  day date PRIMARY KEY,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_views_daily (
  day date PRIMARY KEY,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
