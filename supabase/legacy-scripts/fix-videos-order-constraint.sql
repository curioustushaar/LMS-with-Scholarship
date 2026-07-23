-- Emergency Fix: Resolve Not-Null Constraint on "order" column
-- It seems the database has a column named "order" which is a reserved keyword and is conflicting with "order_index"

DO $$ 
BEGIN
  -- 1. Check if the "order" column exists and has a not-null constraint
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'order') THEN
    -- Make it nullable if it's not-null
    ALTER TABLE videos ALTER COLUMN "order" DROP NOT NULL;
    -- Set a default just in case
    ALTER TABLE videos ALTER COLUMN "order" SET DEFAULT 0;
    RAISE NOTICE 'Fixed "order" column: removed NOT NULL constraint and added default 0';
  END IF;

  -- 2. Ensure order_index is also set up correctly
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'order_index') THEN
    ALTER TABLE videos ADD COLUMN order_index INTEGER DEFAULT 0;
    RAISE NOTICE 'Added missing order_index column';
  END IF;

  -- 3. If both exist, we can try to sync them or just leave them as is with defaults
END $$;

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;
