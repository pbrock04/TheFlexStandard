-- Migration: 0003_mastery_v1.sql
-- Description: 28-Day Mastery V1 data foundation

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS mastery_profiles (
  user_id TEXT PRIMARY KEY,
  primary_goal TEXT,
  daily_time_minutes INTEGER,
  preferred_activity TEXT,
  available_equipment TEXT,
  preferred_days TEXT,
  consistency_obstacle TEXT,
  non_fitness_focus TEXT,
  current_day INTEGER NOT NULL DEFAULT 1,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mastery_daily_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  mastery_day INTEGER NOT NULL CHECK (mastery_day BETWEEN 1 AND 28),
  action_key TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('focus','learn','execute','excel','flex_plus','mission','reflection','comeback','event')),
  completed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, mastery_day, action_key)
);

CREATE INDEX IF NOT EXISTS idx_mastery_daily_actions_user_day
  ON mastery_daily_actions(user_id, mastery_day);

CREATE TABLE IF NOT EXISTS mastery_xp_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_key TEXT NOT NULL,
  xp INTEGER NOT NULL CHECK (xp > 0),
  mastery_day INTEGER CHECK (mastery_day BETWEEN 1 AND 28),
  metadata_json TEXT,
  awarded_at INTEGER NOT NULL,
  UNIQUE(user_id, source_type, source_key)
);

CREATE INDEX IF NOT EXISTS idx_mastery_xp_user
  ON mastery_xp_ledger(user_id, awarded_at);

CREATE TABLE IF NOT EXISTS mastery_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  metadata_json TEXT,
  UNIQUE(user_id, achievement_key)
);

CREATE TABLE IF NOT EXISTS mastery_weekly_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  checkpoint_day INTEGER NOT NULL CHECK (checkpoint_day IN (7,14,21,28)),
  what_worked TEXT,
  obstacle TEXT,
  adjustment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, checkpoint_day)
);

CREATE TABLE IF NOT EXISTS mastery_personal_standards (
  user_id TEXT PRIMARY KEY,
  movement_days_per_week INTEGER,
  minimum_movement_minutes INTEGER,
  strength_days_per_week INTEGER,
  recovery_days TEXT,
  daily_standard TEXT,
  comeback_rule TEXT,
  longer_term_goal TEXT,
  locked_at INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mastery_proof_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mastery_day INTEGER CHECK (mastery_day BETWEEN 1 AND 28),
  mission_key TEXT NOT NULL,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  caption TEXT,
  proof_xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (proof_xp_awarded IN (0,1)),
  spotlight_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (spotlight_opt_in IN (0,1)),
  moderation_status TEXT NOT NULL DEFAULT 'private' CHECK (moderation_status IN ('private','pending','approved','rejected','withdrawn')),
  public_use_consent_at INTEGER,
  submitted_at INTEGER NOT NULL,
  moderated_at INTEGER,
  UNIQUE(user_id, mission_key)
);

CREATE INDEX IF NOT EXISTS idx_mastery_proof_moderation
  ON mastery_proof_submissions(moderation_status, submitted_at);

CREATE TABLE IF NOT EXISTS mastery_events (
  event_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  bonus_xp INTEGER NOT NULL DEFAULT 0 CHECK (bonus_xp >= 0),
  proof_eligible INTEGER NOT NULL DEFAULT 0 CHECK (proof_eligible IN (0,1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mastery_event_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  proof_submission_id TEXT,
  completed_at INTEGER NOT NULL,
  UNIQUE(event_key, user_id),
  FOREIGN KEY(event_key) REFERENCES mastery_events(event_key),
  FOREIGN KEY(proof_submission_id) REFERENCES mastery_proof_submissions(id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_event_entries_user
  ON mastery_event_entries(user_id, completed_at);
