-- Verify user setup (works with any email)
-- Replace 'redsparks184@gmail.com' with the email you want to verify

-- Check if Auth and App users match
SELECT 
  au.id as auth_user_id,
  ap.id as app_user_id,
  CASE WHEN au.id = ap.id THEN '✅ IDs Match' ELSE '❌ IDs DO NOT Match' END as id_match,
  au.email as auth_email,
  ap.email as app_email,
  CASE WHEN au.confirmed_at IS NOT NULL THEN 'Confirmed' ELSE 'Not Confirmed' END as auth_status,
  ap.role as app_role,
  CASE WHEN ap.is_active THEN 'Active' ELSE 'Inactive' END as app_status
FROM auth.users au
FULL OUTER JOIN public.users ap ON au.id = ap.id
WHERE au.email = 'redsparks184@gmail.com' OR ap.email = 'redsparks184@gmail.com';

-- Detailed view
SELECT 
  'Auth User' as source,
  id,
  email,
  CASE WHEN confirmed_at IS NOT NULL THEN 'Confirmed' ELSE 'Not Confirmed' END as status
FROM auth.users 
WHERE email = 'redsparks184@gmail.com'

UNION ALL

SELECT 
  'App User' as source,
  id,
  email,
  role || ' - ' || CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status
FROM public.users 
WHERE email = 'redsparks184@gmail.com';

