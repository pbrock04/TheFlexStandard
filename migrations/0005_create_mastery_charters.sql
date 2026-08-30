-- Migration 0005: Personal FLEX Charter persistence keyed to mastery_profiles(user_id)
-- Uses integer epoch-millisecond timestamps to match the existing Mastery schema.

CREATE TABLE IF NOT EXISTS mastery_charters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  non_negotiable_1 TEXT NOT NULL,
  non_negotiable_2 TEXT NOT NULL,
  non_negotiable_3 TEXT NOT NULL,
  minimum_floor TEXT NOT NULL,
  normal_standard TEXT NOT NULL,
  comeback_rule TEXT NOT NULL,
  next_30_days TEXT NOT NULL,
  signed_name TEXT NOT NULL,
  charter_version INTEGER NOT NULL DEFAULT 1,
  signed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES mastery_profiles(user_id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_charters_user
  ON mastery_charters(user_id);
