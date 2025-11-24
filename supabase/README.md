# Supabase Database Files

This directory contains all database-related files for the Court Management System.

## Directory Structure

```
supabase/
├── migrations/          # Database migration files
│   └── 001_schema_and_policies.sql
├── scripts/            # Utility SQL scripts
│   ├── ADD_MISSING_COLUMNS.sql
│   ├── UPDATE_SUPER_ADMIN.sql
│   ├── FIX_SUPER_ADMIN.sql
│   └── VERIFY_SUPER_ADMIN_FIXED.sql
└── setup/              # Setup and verification guides
    ├── SUPER_ADMIN_SETUP.md
    └── VERIFY_SUPER_ADMIN.md
```

## Migrations

### `migrations/001_schema_and_policies.sql`
The main database schema migration. This creates:
- `users` table with role-based access
- `cases` table
- `case_assignments` table
- `documents` table
- `user_activity_logs` table
- Row Level Security (RLS) policies
- Helper functions and triggers

**To apply:** Run this file in Supabase SQL Editor.

## Scripts

### `scripts/ADD_MISSING_COLUMNS.sql`
Adds missing columns (`status`, `biometric_enabled`) if your database schema doesn't match the expected schema.

**When to use:** If you get errors about missing columns when running the app.

### `scripts/UPDATE_SUPER_ADMIN.sql`
Updates a user's role to `super_admin` and verifies the setup.

**When to use:** After creating a user in Supabase Auth, to set them as super admin.

### `scripts/FIX_SUPER_ADMIN.sql`
Fixed SQL query to verify super admin setup (avoids column name conflicts).

**When to use:** To verify your super admin is set up correctly.

### `scripts/VERIFY_SUPER_ADMIN_FIXED.sql`
Alternative verification query that works with different database schemas.

**When to use:** If the main verification query doesn't work with your schema.

## Setup Guides

### `setup/SUPER_ADMIN_SETUP.md`
Complete guide on how to create and set up a super admin account.

### `setup/VERIFY_SUPER_ADMIN.md`
Step-by-step guide to verify your super admin setup is correct.

## Quick Start

1. **Apply the migration:**
   ```sql
   -- Run migrations/001_schema_and_policies.sql in Supabase SQL Editor
   ```

2. **Create Super Admin:**
   - Follow `setup/SUPER_ADMIN_SETUP.md`
   - Use `scripts/UPDATE_SUPER_ADMIN.sql` to set the role

3. **Verify Setup:**
   - Run `scripts/FIX_SUPER_ADMIN.sql` or follow `setup/VERIFY_SUPER_ADMIN.md`

4. **If schema mismatch:**
   - Run `scripts/ADD_MISSING_COLUMNS.sql` first

## Notes

- All SQL scripts are safe to run multiple times (use `IF NOT EXISTS` where possible)
- Always backup your database before running migrations
- RLS policies are automatically applied with the migration
- The app expects specific column names and types - see migration file for details

