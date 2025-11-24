import { supabase } from '../supabase';
import { User, UserRole, UserStatus } from '../../types';

export class UserService {
  // Get all users (role-based filtering handled by RLS)
  static async getUsers(): Promise<{ data: User[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as User[], error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Create user (auth user must be created first via Supabase Auth)
  static async createUser(
    userId: string,
    email: string,
    role: UserRole,
    createdBy: string
  ): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          role,
          created_by: createdBy,
          status: 'active',
          biometric_enabled: false,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Update user
  static async updateUser(
    id: string,
    updates: Partial<Pick<User, 'status' | 'biometric_enabled'>>
  ): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  }

  // Generate random password
  static generatePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

