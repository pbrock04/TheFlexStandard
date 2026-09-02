CREATE TABLE IF NOT EXISTS milestone_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, event_name)
);

CREATE INDEX IF NOT EXISTS idx_milestone_events_event_name
  ON milestone_events(event_name);

CREATE INDEX IF NOT EXISTS idx_milestone_events_completed_at
  ON milestone_events(completed_at);
