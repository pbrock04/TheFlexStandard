CREATE TABLE IF NOT EXISTS lifecycle_email_outbox (
  outbox_id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  email_key TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  sent_at INTEGER,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES participants(user_id)
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_outbox_status_created
  ON lifecycle_email_outbox(status, created_at);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_outbox_user
  ON lifecycle_email_outbox(user_id, created_at);
