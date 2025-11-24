# Supabase Scripts

Utility SQL scripts for database maintenance and setup.

## Available Scripts

### `FIX_ROLE_CONSTRAINT.sql`
**Purpose:** Fixes the role check constraint to allow `'super_admin'`, `'admin'`, and `'staff'` roles.

**When to use:** 
- When you get errors about invalid role values
- When the constraint doesn't allow the roles your app needs

**What it does:**
1. Drops the old constraint
2. Updates invalid roles to 'staff'
3. Adds the correct constraint
4. Updates specified user to 'super_admin'

### `ADD_MISSING_COLUMNS.sql`
**Purpose:** Adds missing columns (`status`, `biometric_enabled`) if your schema doesn't match the app's expected schema.

**When to use:**
- If you get errors about missing `status` or `biometric_enabled` columns
- When migrating from an older schema

**What it does:**
- Adds `status` column (migrates from `is_active`)
- Adds `biometric_enabled` column
- Verifies columns exist

### `VERIFY_USER.sql`
**Purpose:** Verifies a user is set up correctly in both Auth and App tables.

**When to use:**
- After creating a new user
- To troubleshoot login issues
- To verify super admin setup

**What it does:**
- Checks if Auth and App user IDs match
- Shows confirmation status
- Shows role and active status

## Usage

1. Open Supabase SQL Editor
2. Copy the script you need
3. Replace email addresses if needed
4. Run the script
5. Check the results

## Notes

- All scripts are idempotent (safe to run multiple times)
- Always verify results after running scripts
- Backup your database before running migration scripts

