# Verify Super Admin Setup

## Quick Verification Checklist

### ✅ Step 1: Verify in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Look for your super admin email (e.g., `redsparks184@gmail.com`)
3. Check:
   - ✅ User exists
   - ✅ Status shows "Confirmed" (green checkmark)
   - ✅ Copy the User ID (UUID) - you'll need it for Step 2

### ✅ Step 2: Verify in Users Table

**Option A: Using Table Editor**
1. Go to **Table Editor** → `users` table
2. Search for your super admin email
3. Verify:
   - ✅ `id` matches the User ID from Auth (exact match, case-sensitive)
   - ✅ `email` is correct
   - ✅ `role` = `super_admin`
   - ✅ `status` = `active`

**Option B: Using SQL Editor**
Run this query to check:
```sql
SELECT 
  id,
  email,
  role,
  status,
  biometric_enabled,
  created_at
FROM public.users
WHERE email = 'redsparks184@gmail.com';  -- Replace with your email
```

Expected result:
- Should return exactly 1 row
- `role` should be `super_admin`
- `status` should be `active`

### ✅ Step 3: Test Login in App

1. Open the app
2. Enter credentials:
   - Email: `redsparks184@gmail.com` (or your email)
   - Password: (the password you set)
3. Click "Sign In"
4. **Check the logs** - you should see:
   ```
   [AuthService] Sign in attempt
   [AuthService] Supabase auth sign in successful
   [AuthService] User metadata fetched successfully
   [AuthSlice] Redux: Sign in successful
   ```

### ✅ Step 4: Verify After Login

Once logged in, verify:
- ✅ You can see the **Users** tab (Super Admin should see this)
- ✅ You can see the **Cases** tab
- ✅ You can see the **Settings** tab
- ✅ In Settings, you can see your email and role displayed

## Common Issues & Solutions

### Issue: "User metadata not found" error

**Check:**
```sql
-- Run this in SQL Editor to verify the user exists
SELECT * FROM public.users WHERE email = 'redsparks184@gmail.com';
```

**If no results:**
- The user record wasn't created in the `users` table
- Go back to Step 2 of SUPER_ADMIN_SETUP.md

**If results show but still error:**
- Check that the `id` in `users` table **exactly matches** the User ID from Auth
- UUIDs are case-sensitive!

### Issue: "Invalid login credentials"

**Check:**
1. Email is correct (case-sensitive)
2. Password is correct
3. User is confirmed in Auth (green checkmark)

**Solution:**
- Try resetting the password in Supabase Auth
- Or create a new user with a simpler password for testing

### Issue: Can't see Users tab after login

**Check your role:**
```sql
SELECT role FROM public.users WHERE email = 'redsparks184@gmail.com';
```

**Should return:** `super_admin`

**If it returns something else:**
- Update the role:
```sql
UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'redsparks184@gmail.com';
```

## Quick SQL Verification Script

Run this in Supabase SQL Editor to verify everything:

```sql
-- Check if user exists in both Auth and users table
WITH auth_user AS (
  SELECT id, email, confirmed_at 
  FROM auth.users 
  WHERE email = 'redsparks184@gmail.com'  -- Replace with your email
),
app_user AS (
  SELECT id, email, role, status 
  FROM public.users 
  WHERE email = 'redsparks184@gmail.com'  -- Replace with your email
)
SELECT 
  'Auth User' as source,
  au.id,
  au.email,
  CASE WHEN au.confirmed_at IS NOT NULL THEN 'Confirmed' ELSE 'Not Confirmed' END as status
FROM auth_user au
UNION ALL
SELECT 
  'App User' as source,
  ap.id,
  ap.email,
  ap.role || ' - ' || ap.status as status
FROM app_user ap;
```

**Expected Result:**
- Should return 2 rows (one from Auth, one from App)
- Both should have the **same ID** (UUID)
- Auth status should be "Confirmed"
- App status should be "super_admin - active"

## Test Creating a User (Final Verification)

Once logged in as Super Admin:

1. Go to **Users** tab
2. Click the **+** button
3. Try creating a test user:
   - Email: `test@example.com`
   - Role: `staff`
   - Leave password empty (auto-generate)
4. If this works, your Super Admin is fully set up! ✅

