CREATE TABLE IF NOT EXISTS mastery_purchases (
  checkout_session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  payment_intent_id TEXT,
  price_id TEXT NOT NULL,
  amount_total INTEGER,
  currency TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  access_granted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mastery_purchases_user_id
  ON mastery_purchases(user_id);

CREATE INDEX IF NOT EXISTS idx_mastery_purchases_payment_status
  ON mastery_purchases(payment_status);
