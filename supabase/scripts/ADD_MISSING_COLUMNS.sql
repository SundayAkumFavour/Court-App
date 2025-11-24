-- Add missing columns to match the app's expected schema
-- Run this if your users table is missing 'status' or 'biometric_enabled'

-- Add 'status' column if it doesn't exist (convert is_active to status)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN status text DEFAULT 'active' 
    CHECK (status IN ('active','suspended','deactivated'));
    
    -- Migrate existing is_active values to status
    UPDATE public.users 
    SET status = CASE 
      WHEN is_active = true THEN 'active'
      WHEN is_active = false THEN 'deactivated'
      ELSE 'active'
    END;
  END IF;
END $$;

-- Add 'biometric_enabled' column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'biometric_enabled'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN biometric_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('status', 'biometric_enabled', 'role', 'is_active')
ORDER BY column_name;

