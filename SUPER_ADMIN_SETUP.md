# Super Admin Setup Guide

## How to Create and Login as Super Admin

Since Super Admin accounts cannot sign up through the app (they must be created manually in the database), follow these steps:

### Step 1: Create Super Admin in Supabase Auth

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Authentication** → **Users**
4. Click **"Add user"** or **"Create new user"**
5. Fill in:
   - **Email**: e.g., `superadmin@court.com`
   - **Password**: Choose a strong password (you'll need this to login)
   - **Auto Confirm User**: ✅ Check this box (so they can login immediately)
6. Click **"Create user"**
7. **Copy the User ID** (UUID) - you'll need this in the next step

### Step 2: Create Super Admin Record in Users Table

1. In Supabase Dashboard, go to **Table Editor**
2. Select the `users` table
3. Click **"Insert row"** or use the SQL Editor
4. Fill in the following:

**Option A: Using Table Editor (UI)**
- `id`: Paste the User ID from Step 1
- `email`: `superadmin@court.com` (same as Step 1)
- `role`: `super_admin`
- `status`: `active`
- `biometric_enabled`: `false` (will be enabled after first login)
- `created_by`: Leave NULL (or use the same User ID if you want)

**Option B: Using SQL Editor**
```sql
INSERT INTO public.users (
  id,
  email,
  role,
  status,
  biometric_enabled,
  created_at,
  updated_at
) VALUES (
  'PASTE_USER_ID_FROM_STEP_1',  -- Replace with actual UUID
  'superadmin@court.com',
  'super_admin',
  'active',
  false,
  now(),
  now()
);
```

### Step 3: Login to the App

1. Open the app on your device/emulator
2. Enter the credentials:
   - **Email**: `superadmin@court.com`
   - **Password**: (the password you set in Step 1)
3. Click **"Sign In"**

### Step 4: Enable Biometric (Optional)

After logging in:
1. Go to **Settings** tab
2. Toggle **"Biometric Authentication"** ON
3. Follow the prompts to set up Face ID/Touch ID/Fingerprint

## Creating Admins and Staff Users

Once logged in as Super Admin:

1. Go to the **Users** tab
2. Click the **+** (FAB) button
3. Fill in:
   - **Email**: The user's email address
   - **Role**: Select `admin` or `staff`
   - **Password**: (optional - leave empty to auto-generate)
4. Click **"Create User"**
5. The app will:
   - Create the user in Supabase Auth
   - Create the user record in the `users` table
   - Display the generated password (if auto-generated)

**Note**: In production, you should send the password securely via email/SMS. For now, the password is shown in an alert.

## Troubleshooting

### "User metadata not found" error
- Make sure you created the user record in the `users` table with the correct User ID
- Check that the User ID matches exactly (case-sensitive UUID)

### "Invalid login credentials" error
- Verify the email and password are correct
- Check that the user exists in Supabase Auth
- Ensure the user is confirmed (Auto Confirm was checked)

### Can't see Users tab
- Make sure you're logged in as `super_admin` or `admin`
- Staff users cannot see the Users tab

## Quick SQL Script for Testing

If you want to create a test Super Admin quickly, run this in Supabase SQL Editor:

```sql
-- First, create the auth user (you'll need to do this in the Supabase Dashboard UI)
-- Then replace 'YOUR_AUTH_USER_ID' with the actual UUID from Auth

INSERT INTO public.users (
  id,
  email,
  role,
  status,
  biometric_enabled
) VALUES (
  'YOUR_AUTH_USER_ID',  -- Get this from Authentication → Users
  'superadmin@court.com',
  'super_admin',
  'active',
  false
)
ON CONFLICT (id) DO NOTHING;
```

## Logging

All authentication actions are logged with comprehensive details. Check your console/logs for:
- Sign in attempts
- Session retrieval
- User metadata fetching
- Biometric operations
- Errors with full context

Look for logs prefixed with `[AuthService]` in your development console.

