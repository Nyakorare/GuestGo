-- Add missing log action for place deletion
DO $$
BEGIN
  -- Ensure the enum type exists before altering
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_action') THEN
    ALTER TYPE log_action ADD VALUE IF NOT EXISTS 'place_delete';
  END IF;
END $$;


