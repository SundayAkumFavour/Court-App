# Database Migrations

This directory contains database migration files that define the schema and structure of the Court Management System database.

## Migration Files

### `001_schema_and_policies.sql`
**Purpose:** Initial database schema setup with Row Level Security (RLS) policies.

**What it creates:**
- `users` table - User metadata and roles
- `cases` table - Court cases
- `case_assignments` table - Case-to-user assignments
- `documents` table - Case documents
- `user_activity_logs` table - Activity tracking

**What it sets up:**
- Row Level Security (RLS) policies for all tables
- Helper functions for permission checks
- Triggers for automatic `updated_at` timestamps
- Check constraints for data validation

## How to Apply Migrations

1. **Via Supabase Dashboard:**
   - Go to SQL Editor
   - Copy the contents of the migration file
   - Paste and run

2. **Via Supabase CLI (if installed):**
   ```bash
   supabase db push
   ```

## Migration Order

Migrations should be applied in numerical order:
- `001_schema_and_policies.sql` - Must be applied first

## Important Notes

- **Backup your database** before running migrations
- Migrations are **idempotent** (safe to run multiple times) - they use `IF NOT EXISTS` and `DROP IF EXISTS`
- After running migrations, verify:
  - All tables exist
  - RLS is enabled on all tables
  - Policies are created correctly

## Schema Overview

### Users Table
- Links to `auth.users` via foreign key
- Roles: `super_admin`, `admin`, `staff`
- Status: `active`, `suspended`, `deactivated`

### Cases Table
- Unique case numbers
- Status: `open`, `closed`, `pending`

### Case Assignments
- Many-to-many relationship between cases and users
- Tracks who assigned the case

### Documents
- Linked to cases
- File metadata stored
- Actual files in Supabase Storage

## Troubleshooting

If you encounter errors:
1. Check that you have the correct permissions
2. Verify no conflicting constraints exist
3. Check the Supabase logs for detailed error messages
4. Use `supabase/scripts/ADD_MISSING_COLUMNS.sql` if schema doesn't match

