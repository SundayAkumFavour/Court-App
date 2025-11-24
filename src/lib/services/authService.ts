import { supabase } from '../supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole } from '../../types';
import { STORAGE_KEYS } from '../../constants';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'AuthService';

export class AuthService {
  // Check if biometric is available
  static async isBiometricAvailable(): Promise<boolean> {
    Logger.debug(LOG_SOURCE, 'Checking biometric availability');
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      
      Logger.info(LOG_SOURCE, 'Biometric availability check', {
        compatible,
        enrolled,
        available,
      });
      
      return available;
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Error checking biometric availability', error);
      return false;
    }
  }

  // Authenticate with biometric
  static async authenticateWithBiometric(): Promise<boolean> {
    Logger.debug(LOG_SOURCE, 'Starting biometric authentication');
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Court Management',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      
      Logger.info(LOG_SOURCE, 'Biometric authentication result', {
        success: result.success,
        error: result.error,
      });
      
      return result.success;
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Biometric authentication error', error);
      return false;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Sign in attempt', { email });
    
    try {
      Logger.debug(LOG_SOURCE, 'Calling supabase.auth.signInWithPassword', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Logger.error(LOG_SOURCE, 'Supabase auth sign in error', {
          error: error.message,
          status: error.status,
          name: error.name,
        });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Supabase auth sign in successful', {
        userId: data.user?.id,
        email: data.user?.email,
        sessionExists: !!data.session,
      });

      // Fetch user metadata
      Logger.debug(LOG_SOURCE, 'Fetching user metadata from users table', {
        userId: data.user.id,
      });

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        Logger.error(LOG_SOURCE, 'Error fetching user metadata', {
          error: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint,
        });
        throw userError;
      }

      if (!userData) {
        Logger.warn(LOG_SOURCE, 'User metadata not found in users table', {
          userId: data.user.id,
        });
        throw new Error('User metadata not found');
      }

      Logger.info(LOG_SOURCE, 'User metadata fetched successfully', {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      });

      // Check biometric requirement
      const requiresBio = this.requiresBiometric(userData.role);
      Logger.debug(LOG_SOURCE, 'Biometric requirement check', {
        role: userData.role,
        requiresBiometric: requiresBio,
      });

      return { user: userData as User, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Sign in failed', {
        email,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStatus: error?.status,
        fullError: error,
      });
      
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error(error?.message || 'Sign in failed')
      };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    Logger.info(LOG_SOURCE, 'Sign out initiated');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        Logger.error(LOG_SOURCE, 'Error during sign out', error);
      } else {
        Logger.info(LOG_SOURCE, 'Sign out successful');
      }

      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
      Logger.debug(LOG_SOURCE, 'Cleared biometric enabled flag');
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Error clearing biometric flag', error);
    }
  }

  // Get current session
  static async getSession() {
    Logger.debug(LOG_SOURCE, 'Getting current session');
    
    try {
      const result = await supabase.auth.getSession();
      
      Logger.info(LOG_SOURCE, 'Session retrieved', {
        hasSession: !!result.data.session,
        userId: result.data.session?.user?.id,
        expiresAt: result.data.session?.expires_at,
      });

      if (result.error) {
        Logger.error(LOG_SOURCE, 'Error getting session', result.error);
      }

      return result;
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception getting session', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    Logger.debug(LOG_SOURCE, 'Getting current user');
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        Logger.error(LOG_SOURCE, 'Error getting session for current user', sessionError);
        return null;
      }

      if (!session) {
        Logger.debug(LOG_SOURCE, 'No active session found');
        return null;
      }

      Logger.debug(LOG_SOURCE, 'Fetching user from users table', {
        userId: session.user.id,
      });

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching user from users table', {
          error: error.message,
          code: error.code,
          userId: session.user.id,
        });
        return null;
      }

      if (!data) {
        Logger.warn(LOG_SOURCE, 'User not found in users table', {
          userId: session.user.id,
        });
        return null;
      }

      Logger.info(LOG_SOURCE, 'Current user retrieved', {
        userId: data.id,
        email: data.email,
        role: data.role,
        status: data.status,
      });

      return data as User;
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Exception getting current user', error);
      return null;
    }
  }

  // Check if biometric is enabled for user
  static async isBiometricEnabled(userId: string): Promise<boolean> {
    Logger.debug(LOG_SOURCE, 'Checking if biometric is enabled', { userId });
    
    try {
      const stored = await SecureStore.getItemAsync(`${STORAGE_KEYS.BIOMETRIC_ENABLED}_${userId}`);
      const enabled = stored === 'true';
      
      Logger.debug(LOG_SOURCE, 'Biometric enabled check result', {
        userId,
        enabled,
      });
      
      return enabled;
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Error checking biometric enabled', error);
      return false;
    }
  }

  // Enable biometric for user
  static async enableBiometric(userId: string): Promise<void> {
    Logger.info(LOG_SOURCE, 'Enabling biometric for user', { userId });
    
    try {
      await SecureStore.setItemAsync(`${STORAGE_KEYS.BIOMETRIC_ENABLED}_${userId}`, 'true');
      Logger.info(LOG_SOURCE, 'Biometric enabled successfully', { userId });
    } catch (error) {
      Logger.error(LOG_SOURCE, 'Error enabling biometric', error);
      throw error;
    }
  }

  // Check if user role requires biometric
  static requiresBiometric(role: UserRole): boolean {
    const requires = role === 'super_admin' || role === 'admin';
    Logger.debug(LOG_SOURCE, 'Biometric requirement check', { role, requires });
    return requires;
  }
}

