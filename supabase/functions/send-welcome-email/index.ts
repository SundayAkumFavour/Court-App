import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Expected application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, role' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server not configured: RESEND_API_KEY missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resendUrl = 'https://api.resend.com/emails';
    
    // TODO: Update 'from' email to your verified Resend domain
    // Example: 'noreply@yourdomain.com' or 'onboarding@resend.dev' (for testing)
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    
    const subject = 'Welcome to Court Management System';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-top: 0;">Your account has been created successfully. Here are your login credentials:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 10px 0;"><strong>Email:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${email}</code></p>
              <p style="margin: 10px 0;"><strong>Password:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
              <p style="margin: 10px 0;"><strong>Role:</strong> <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize;">${role.replace('_', ' ')}</span></p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Security Notice:</strong> Please change your password after your first login. Keep these credentials secure and do not share them with anyone.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; margin-bottom: 0;">
              If you did not expect this email, please contact your administrator immediately.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Court Management System</p>
          </div>
        </body>
      </html>
    `;

    const payload = {
      from: fromEmail,
      to: email,
      subject,
      html,
    };

    const resp = await fetch(resendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error('Resend API error:', result);
      return new Response(
        JSON.stringify({ error: 'Resend API error', details: result }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully', resend: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

