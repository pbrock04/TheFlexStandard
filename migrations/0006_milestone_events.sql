-- Migration: 0006_milestone_events.sql
-- Purpose: durable, idempotent completion milestones for the free FLEX path.

CREATE TABLE IF NOT EXISTS milestone_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, event_name)
);
