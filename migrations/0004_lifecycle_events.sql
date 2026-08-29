-- Advertising-readiness lifecycle event ledger.
-- Safe by default: additive only, no destructive schema changes.

CREATE TABLE IF NOT EXISTS lifecycle_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  tier_id TEXT,
  lead_source TEXT,
  occurred_at INTEGER NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_events_user_time
  ON lifecycle_events(user_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_lifecycle_events_name_time
  ON lifecycle_events(event_name, occurred_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lifecycle_events_dedupe
  ON lifecycle_events(user_id, event_name, event_id);
