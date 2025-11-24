import { supabase } from '../supabase';
import { Case, CaseStatus, CaseAssignment } from '../../types';
import Logger from '../../utils/logger';

const LOG_SOURCE = 'CaseService';

export class CaseService {
  // Get all cases (role-based filtering handled by RLS)
  static async getCases(): Promise<{ data: Case[] | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Fetching all cases');
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching cases', error);
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Cases fetched successfully', { count: data?.length || 0 });
      return { data: data as Case[], error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception fetching cases', error);
      return { data: null, error: error as Error };
    }
  }

  // Get case by ID
  static async getCaseById(id: string): Promise<{ data: Case | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Fetching case by ID', { caseId: id });
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching case', { error: error.message, caseId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case fetched successfully', { caseId: id, caseNumber: data?.case_number });
      return { data: data as Case, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception fetching case', error);
      return { data: null, error: error as Error };
    }
  }

  // Create case
  static async createCase(
    caseNumber: string,
    title: string,
    description: string | undefined,
    createdBy: string
  ): Promise<{ data: Case | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Creating case', { caseNumber, title, createdBy });
    try {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          case_number: caseNumber,
          title,
          description,
          status: 'open',
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error creating case', { error: error.message, caseNumber });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case created successfully', { caseId: data.id, caseNumber });
      return { data: data as Case, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception creating case', error);
      return { data: null, error: error as Error };
    }
  }

  // Update case
  static async updateCase(
    id: string,
    updates: Partial<Pick<Case, 'title' | 'description' | 'status'>>
  ): Promise<{ data: Case | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Updating case', { caseId: id, updates });
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error updating case', { error: error.message, caseId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case updated successfully', { caseId: id });
      return { data: data as Case, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception updating case', error);
      return { data: null, error: error as Error };
    }
  }

  // Delete case
  static async deleteCase(id: string): Promise<{ error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Deleting case', { caseId: id });
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) {
        Logger.error(LOG_SOURCE, 'Error deleting case', { error: error.message, caseId: id });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case deleted successfully', { caseId: id });
      return { error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception deleting case', error);
      return { error: error as Error };
    }
  }

  // Assign case to user
  static async assignCase(
    caseId: string,
    userId: string,
    assignedBy: string
  ): Promise<{ data: CaseAssignment | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Assigning case to user', { caseId, userId, assignedBy });
    try {
      const { data, error } = await supabase
        .from('case_assignments')
        .insert({
          case_id: caseId,
          user_id: userId,
          assigned_by: assignedBy,
        })
        .select()
        .single();

      if (error) {
        Logger.error(LOG_SOURCE, 'Error assigning case', { error: error.message, caseId, userId });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case assigned successfully', { caseId, userId });
      return { data: data as CaseAssignment, error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception assigning case', error);
      return { data: null, error: error as Error };
    }
  }

  // Remove case assignment
  static async unassignCase(caseId: string, userId: string): Promise<{ error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Unassigning case from user', { caseId, userId });
    try {
      const { error } = await supabase
        .from('case_assignments')
        .delete()
        .eq('case_id', caseId)
        .eq('user_id', userId);

      if (error) {
        Logger.error(LOG_SOURCE, 'Error unassigning case', { error: error.message, caseId, userId });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case unassigned successfully', { caseId, userId });
      return { error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception unassigning case', error);
      return { error: error as Error };
    }
  }

  // Get assignments for a case
  static async getCaseAssignments(caseId: string): Promise<{ data: CaseAssignment[] | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Fetching case assignments', { caseId });
    try {
      const { data, error } = await supabase
        .from('case_assignments')
        .select('*')
        .eq('case_id', caseId);

      if (error) {
        Logger.error(LOG_SOURCE, 'Error fetching assignments', { error: error.message, caseId });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Assignments fetched successfully', { caseId, count: data?.length || 0 });
      return { data: data as CaseAssignment[], error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception fetching assignments', error);
      return { data: null, error: error as Error };
    }
  }

  // Search cases
  static async searchCases(query: string): Promise<{ data: Case[] | null; error: Error | null }> {
    Logger.info(LOG_SOURCE, 'Searching cases', { query });
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .or(`case_number.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        Logger.error(LOG_SOURCE, 'Error searching cases', { error: error.message, query });
        throw error;
      }

      Logger.info(LOG_SOURCE, 'Case search completed', { query, count: data?.length || 0 });
      return { data: data as Case[], error: null };
    } catch (error: any) {
      Logger.error(LOG_SOURCE, 'Exception searching cases', error);
      return { data: null, error: error as Error };
    }
  }
}

