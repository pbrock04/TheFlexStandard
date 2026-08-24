-- Migration: 0002_optional_leads.sql
-- Optional contact capture after completing the 7-Day Foundation.

CREATE TABLE IF NOT EXISTS optional_leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT '7-day-completion',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_optional_leads_created_at
  ON optional_leads(created_at);
