import { supabase } from '../supabase';
import Logger from '../utils/logger';

const LOG_SOURCE = 'EmailService';

export class EmailService {
  /**
   * Send welcome email with credentials to new user
   * 
   * NOTE: Supabase Auth emails are ONLY for:
   * - Email confirmations
   * - Password resets  
   * - Magic links
   * 
   * They do NOT support custom transactional emails like welcome emails.
   * 
   * Options:
   * 1. Use Edge Function with third-party service (Resend, SendGrid, etc.) - requires setup
   * 2. Use Supabase SMTP (limited: 2 emails/hour, dev only)
   * 3. Skip email entirely - just show password in app (simplest)
   * 
   * This function attempts Edge Function if available, otherwise returns false.
   * The app will show password in alert as fallback.
   */
  static async sendWelcomeEmail(
    email: string,
    password: string,
    role: string
  ): Promise<{ success: boolean; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Attempting to send welcome email', { email, role });

    try {
      // Try Edge Function if available (requires third-party email service setup)
      if (supabase.functions && typeof supabase.functions.invoke === 'function') {
        const { data, error } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            email,
            password,
            role,
          },
        });

        if (error) {
          Logger.error(LOG_SOURCE, 'Error calling email function', error);
          return { success: false, error: error as Error };
        }

        Logger.info(LOG_SOURCE, 'Welcome email sent successfully', { email });
        return { success: true, error: null };
      } else {
        Logger.debug(LOG_SOURCE, 'Edge Functions not available - email will be shown in app');
        return { success: false, error: new Error('Email service not configured') };
      }
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception sending email', error);
      return { success: false, error: error as Error };
    }
  }

  // Alternative: Use Supabase's built-in email (if configured)
  // This requires Supabase Auth email templates to be set up
  static async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Sending password reset email', { email });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'court://reset-password',
      });

      if (error) {
        Logger.error(LOG_SOURCE, 'Error sending password reset', error);
        return { success: false, error: error as Error };
      }

      Logger.info(LOG_SOURCE, 'Password reset email sent', { email });
      return { success: true, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception sending password reset', error);
      return { success: false, error: error as Error };
    }
  }
}

