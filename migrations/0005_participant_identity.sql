-- Advertising-readiness participant identity and progression state.
-- Additive only: production remains untouched until this branch is approved and deployed.

CREATE TABLE IF NOT EXISTS participants (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  lead_source TEXT NOT NULL DEFAULT 'website',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_participants_created_at
  ON participants(created_at);

CREATE TABLE IF NOT EXISTS participant_tiers (
  user_id TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',
  current_day INTEGER NOT NULL DEFAULT 0,
  unlocked_at INTEGER,
  completed_at INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, tier_id),
  FOREIGN KEY (user_id) REFERENCES participants(user_id)
);

CREATE INDEX IF NOT EXISTS idx_participant_tiers_status
  ON participant_tiers(tier_id, status);
