-- Migration 0004: Persist individual tier selection per daily Mastery action
-- Express (~10m), Standard (~20m), or eXcel (~30m) is stored on the action row.

ALTER TABLE mastery_daily_actions
ADD COLUMN tier_selected TEXT DEFAULT 'standard'
CHECK (tier_selected IN ('express','standard','excel'));
