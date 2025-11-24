import { supabase } from '../supabase';
import { Case, CaseStatus, CaseAssignment } from '../../types';

export class CaseService {
  // Get all cases (role-based filtering handled by RLS)
  static async getCases(): Promise<{ data: Case[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Case[], error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Get case by ID
  static async getCaseById(id: string): Promise<{ data: Case | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Case, error: null };
    } catch (error: any) {
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

      if (error) throw error;
      return { data: data as Case, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Update case
  static async updateCase(
    id: string,
    updates: Partial<Pick<Case, 'title' | 'description' | 'status'>>
  ): Promise<{ data: Case | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Case, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Delete case
  static async deleteCase(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  }

  // Assign case to user
  static async assignCase(
    caseId: string,
    userId: string,
    assignedBy: string
  ): Promise<{ data: CaseAssignment | null; error: Error | null }> {
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

      if (error) throw error;
      return { data: data as CaseAssignment, error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Remove case assignment
  static async unassignCase(caseId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('case_assignments')
        .delete()
        .eq('case_id', caseId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error as Error };
    }
  }

  // Get assignments for a case
  static async getCaseAssignments(caseId: string): Promise<{ data: CaseAssignment[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('case_assignments')
        .select('*')
        .eq('case_id', caseId);

      if (error) throw error;
      return { data: data as CaseAssignment[], error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }

  // Search cases
  static async searchCases(query: string): Promise<{ data: Case[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .or(`case_number.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Case[], error: null };
    } catch (error: any) {
      return { data: null, error: error as Error };
    }
  }
}

