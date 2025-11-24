import { supabase } from '../supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole } from '../../types';
import { STORAGE_KEYS } from '../../constants';

export class AuthService {
  // Check if biometric is available
  static async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  // Authenticate with biometric
  static async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Court Management',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user metadata
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      return { user: userData as User, error: null };
    } catch (error: any) {
      return { user: null, error: error as Error };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
  }

  // Get current session
  static async getSession() {
    return await supabase.auth.getSession();
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  // Check if biometric is enabled for user
  static async isBiometricEnabled(userId: string): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(`${STORAGE_KEYS.BIOMETRIC_ENABLED}_${userId}`);
    return stored === 'true';
  }

  // Enable biometric for user
  static async enableBiometric(userId: string): Promise<void> {
    await SecureStore.setItemAsync(`${STORAGE_KEYS.BIOMETRIC_ENABLED}_${userId}`, 'true');
  }

  // Check if user role requires biometric
  static requiresBiometric(role: UserRole): boolean {
    return role === 'super_admin' || role === 'admin';
  }
}

