# Send Welcome Email Edge Function

This Supabase Edge Function sends welcome emails to newly created users using the Resend API.

## Setup Instructions

### 1. Deploy the Function

```bash
# From your project root
supabase functions deploy send-welcome-email
```

### 2. Set Environment Variables

In your Supabase Dashboard:
1. Go to **Edge Functions** → **Settings**
2. Add the following secrets:

   - **RESEND_API_KEY**: Your Resend API key
     - Get it from: https://resend.com/api-keys
     - Format: `re_xxxxxxxxxxxxx`

   - **RESEND_FROM_EMAIL** (Optional): The "from" email address
     - Default: `onboarding@resend.dev` (for testing)
     - For production: Use a verified domain (e.g., `noreply@yourdomain.com`)
     - Must be verified in your Resend account

### 3. Verify Resend Domain (Production)

1. Go to https://resend.com/domains
2. Add and verify your domain
3. Update `RESEND_FROM_EMAIL` to use your verified domain

### 4. Test the Function

You can test the function using curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-welcome-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "staff"
  }'
```

## Function Details

- **Endpoint**: `POST /functions/v1/send-welcome-email`
- **Authentication**: Requires Supabase anon key (handled automatically by the app)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "generated_password",
    "role": "staff" | "admin" | "super_admin"
  }
  ```
- **Response**: 
  - Success: `200` with `{ message: "Welcome email sent successfully", resend: {...} }`
  - Error: `400/500/502` with error details

## Troubleshooting

### Email not sending?
1. Check Resend API key is set correctly
2. Verify the "from" email domain is verified in Resend
3. Check Edge Function logs in Supabase Dashboard
4. Ensure the email address is valid

### Getting 500 errors?
- Check that `RESEND_API_KEY` is set in Supabase Edge Function secrets
- Verify the API key is valid in Resend dashboard

### Getting 502 errors?
- Check Resend API status
- Verify your Resend account has available credits
- Check the function logs for detailed error messages

