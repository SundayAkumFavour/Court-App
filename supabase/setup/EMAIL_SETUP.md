# Email Service Setup (Optional)

## ⚠️ Important: Email is Optional!

**The app works perfectly without email!** When you create a user, the password is shown in an alert. Email is just a "nice to have" for automation.

## Why Not Supabase's Built-in Email?

Supabase Auth emails are **ONLY** for:
- Email confirmations
- Password resets
- Magic links

They **do NOT** support custom transactional emails like welcome emails. That's why we need a third-party service (Resend, SendGrid, etc.) or you can just skip email entirely.

See `EMAIL_ALTERNATIVES.md` for more details.

## Current Behavior

1. **Tries to send email** (if Edge Function is set up)
2. **Falls back to showing password in alert** (works great, no setup needed!)

## Optional: Email Setup (If You Want Automation)

The app uses `EmailService.sendWelcomeEmail()` which calls a Supabase Edge Function named `send-welcome-email`. The function code is located in `supabase/functions/send-welcome-email/index.ts`.

### Quick Setup (Optional)

### 1. Deploy the Edge Function

The function code is already created in `supabase/functions/send-welcome-email/index.ts`. Deploy it:

```bash
# From your project root
supabase functions deploy send-welcome-email
```

**When Supabase asks if you want to skip or deploy, choose DEPLOY.**

### 2. Set Environment Variables

In your Supabase Dashboard:
1. Go to **Edge Functions** → **Settings** (or **Secrets**)
2. Add the following secrets:

   **RESEND_API_KEY** (Required):
   - Get your API key from: https://resend.com/api-keys
   - Format: `re_xxxxxxxxxxxxx`
   - Add it as a secret named `RESEND_API_KEY`

   **RESEND_FROM_EMAIL** (Optional):
   - Default: `onboarding@resend.dev` (works for testing)
   - For production: Use a verified domain email (e.g., `noreply@yourdomain.com`)
   - Must be verified in your Resend account

### 3. Verify Resend Domain (For Production)

1. Sign up/login at https://resend.com
2. Go to **Domains** → **Add Domain**
3. Add and verify your domain (follow DNS setup instructions)
4. Once verified, update `RESEND_FROM_EMAIL` secret to use your domain (e.g., `noreply@yourdomain.com`)

### 4. Test

Create a new user in the app - the email should be sent automatically!

### Option 2: Supabase Auth Email Templates

Supabase Auth has built-in email templates, but they're designed for password resets and email confirmations. You can customize these in:
- Supabase Dashboard → Authentication → Email Templates

However, this doesn't directly support sending welcome emails with passwords, so Option 1 is recommended.

### Option 3: Third-Party Email Service (Direct Integration)

You can modify `EmailService.ts` to directly call an email service API:

```typescript
// Example with Resend
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Welcome to Court Management System',
    html: `...`,
  }),
});
```

**Note**: This requires storing API keys securely. For React Native, consider using environment variables or a backend service.

## Current Behavior

- **If Edge Function exists**: Email is sent automatically
- **If Edge Function doesn't exist**: Credentials are logged and shown in an alert (development fallback)

## Testing

1. Create a new user in the app
2. Check the logs for email sending status
3. Verify the email is received (if Edge Function is set up)
4. If email fails, credentials are shown in an alert as fallback

## Security Notes

- Never log passwords in production
- Use secure email services with proper authentication
- Consider expiring temporary passwords
- Implement rate limiting for email sending
- Store email service API keys securely (use Supabase secrets for Edge Functions)

