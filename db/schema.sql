-- MySQL 8+ Schema for SONIA SPECIALIST — STRATEGY INTELLIGENCE

CREATE TABLE IF NOT EXISTS anonymous_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  first_visit DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_activity DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  visit_count INT NOT NULL DEFAULT 1,
  diagnostic_completed BOOLEAN NOT NULL DEFAULT FALSE,
  contact_clicked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_sessions_last_activity (last_activity DESC)
);

CREATE TABLE IF NOT EXISTS engagement_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  target_id VARCHAR(120),
  target_label VARCHAR(180),
  metadata JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_events_type_created (event_type, created_at DESC),
  INDEX idx_events_session (session_id)
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  question TEXT NOT NULL,
  challenge_category VARCHAR(120),
  answer_summary TEXT NOT NULL,
  recommended_branch VARCHAR(64),
  milestones_returned JSON NOT NULL,
  model_used VARCHAR(80),
  status VARCHAR(32) NOT NULL DEFAULT 'ok',
  error_message TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ai_interactions_created (created_at DESC)
);

CREATE TABLE IF NOT EXISTS diagnostics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  challenge_category VARCHAR(120) NOT NULL,
  selected_answers JSON NOT NULL,
  business_description TEXT,
  ai_analysis TEXT NOT NULL,
  recommended_actions JSON NOT NULL,
  recommended_branches JSON NOT NULL,
  relevant_expertise JSON NOT NULL,
  completion_status VARCHAR(32) NOT NULL DEFAULT 'completed',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_diagnostics_created (created_at DESC)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  company VARCHAR(160),
  business_challenge VARCHAR(180) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  ai_classification VARCHAR(120) NOT NULL DEFAULT 'General Strategy',
  relevant_branch VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'New',
  internal_notes TEXT NOT NULL,
  session_id VARCHAR(64),
  ip_hash VARCHAR(64),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_enquiries_created (created_at DESC),
  INDEX idx_enquiries_status (status)
);

CREATE TABLE IF NOT EXISTS tree_branches (
  id VARCHAR(64) PRIMARY KEY,
  label VARCHAR(80) NOT NULL,
  essence VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  featured_company_id VARCHAR(64) NOT NULL,
  company_ids JSON NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS career_milestones (
  id VARCHAR(64) PRIMARY KEY,
  company VARCHAR(140) NOT NULL,
  chapter_label VARCHAR(140) NOT NULL,
  track VARCHAR(32) NOT NULL DEFAULT 'chronological',
  overall_span VARCHAR(120) NOT NULL,
  roles JSON NOT NULL,
  highlights JSON NOT NULL,
  fruit_outcome TEXT,
  branch_ids JSON NOT NULL,
  is_featured_leaf BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(48) NOT NULL,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  branch_id VARCHAR(64),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS content_revisions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(48) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  action VARCHAR(32) NOT NULL,
  summary TEXT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS admin_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
