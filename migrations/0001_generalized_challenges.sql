PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS challenge_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge_days INTEGER NOT NULL CHECK (challenge_days IN (7, 14, 21, 28)),
  current_day INTEGER NOT NULL DEFAULT 1,
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, challenge_days)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user
  ON challenge_progress (user_id);

CREATE TABLE IF NOT EXISTS challenge_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge_days INTEGER NOT NULL CHECK (challenge_days IN (7, 14, 21, 28)),
  day_number INTEGER NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  checked_in_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, challenge_days, day_number)
);

CREATE INDEX IF NOT EXISTS idx_challenge_checkins_user_challenge
  ON challenge_checkins (user_id, challenge_days);
