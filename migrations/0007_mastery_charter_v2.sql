-- Migration 0007: expand Personal FLEX Charter to the approved Tier 4 V1 contract.
-- Existing V1 columns remain for backward compatibility; new fields are additive.

ALTER TABLE mastery_charters ADD COLUMN primary_focus TEXT;
ALTER TABLE mastery_charters ADD COLUMN learned TEXT;
ALTER TABLE mastery_charters ADD COLUMN execute_consistently TEXT;
ALTER TABLE mastery_charters ADD COLUMN excel_plan TEXT;
ALTER TABLE mastery_charters ADD COLUMN motivation_plan TEXT;
ALTER TABLE mastery_charters ADD COLUMN completion_date TEXT;
ALTER TABLE mastery_charters ADD COLUMN standard_days INTEGER NOT NULL DEFAULT 0;
