import { supabase } from '../supabase';
import { User, UserRole, UserStatus } from '../../types';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'UserService';

export class UserService {
  // Transform database user to app User type (handles is_active vs status)
  private static transformUser(dbUser: any): User {
    return {
      ...dbUser,
      status: dbUser.status || (dbUser.is_active ? 'active' : 'deactivated'),
      biometric_enabled: dbUser.biometric_enabled ?? false,
    } as User;
  }

  // Get all users (role-based filtering handled by RLS)
  static async getUsers(): Promise<{ data: User[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform users to handle schema differences
      const transformedUsers = (data || []).map(user => this.transformUser(user));
      
      return { data: transformedUsers, error: null };
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
      return { data: this.transformUser(data), error: null };
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
    Logger.info(LOG_SOURCE, 'Creating user', { userId, email, role, createdBy });
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

      if (error) {
        Logger.error(LOG_SOURCE, 'Error creating user', { error: error.message, email, role });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'User created successfully', { userId, email, role });
      return { data: this.transformUser(data), error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception creating user', error);
      return { data: null, error: error as Error };
    }
  }

  // Update user
  static async updateUser(
    id: string,
    updates: Partial<Pick<User, 'status' | 'biometric_enabled' | 'role'>>
  ): Promise<{ data: User | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Updating user', { userId: id, updates });
    try {
      // Convert status to is_active if needed (for databases with is_active column)
      const dbUpdates: any = { ...updates };
      if (updates.status && 'is_active' in dbUpdates === false) {
        // If database has is_active, convert status to is_active
        // Otherwise keep status as is
        dbUpdates.is_active = updates.status === 'active';
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error updating user', { error: error.message, userId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'User updated successfully', { userId: id });
      return { data: this.transformUser(data), error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception updating user', error);
      return { data: null, error: error as Error };
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<{ error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Deleting user', { userId: id });
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        Logger.error(LOG_SOURCE, 'Error deleting user', { error: error.message, userId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'User deleted successfully', { userId: id });
      return { error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception deleting user', error);
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

