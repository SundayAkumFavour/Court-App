-- Fix the role check constraint to allow 'super_admin', 'admin', 'staff'
-- This script will drop the old constraint and add the correct one

-- Step 1: Check current constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
AND contype = 'c'
AND conname LIKE '%role%';

-- Step 2: Drop the old constraint FIRST (before updating roles)
-- We need to drop it first because it's blocking our updates
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No role constraint found';
    END IF;
END $$;

-- Step 3: Now update any invalid roles to 'staff' (temporary fix)
-- This ensures all rows have valid roles before we add the new constraint
UPDATE public.users 
SET role = 'staff'
WHERE role NOT IN ('super_admin', 'admin', 'staff') 
   OR role IS NULL;

-- Step 4: Add the correct constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'staff'));

-- Step 5: Verify the constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
AND contype = 'c'
AND conname LIKE '%role%';

-- Step 6: Now update the role
UPDATE public.users 
SET role = 'super_admin'
WHERE email = 'redsparks184@gmail.com';

-- Step 7: Verify the update
SELECT id, email, role, is_active 
FROM public.users 
WHERE email = 'redsparks184@gmail.com';

