-- Migration: 0001_generalized_challenges.sql
-- Description: Minimal schema for challenge_progress matching active Worker endpoints

CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id TEXT PRIMARY KEY,
  challenge_tier TEXT NOT NULL DEFAULT '7-day-kickstart',
  current_day INTEGER NOT NULL DEFAULT 1,
  started_at INTEGER NOT NULL,
  last_checkin_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_tier ON challenge_progress(challenge_tier);