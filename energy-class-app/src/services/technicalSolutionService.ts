import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type TechnicalSolution = Database['public']['Tables']['technical_solutions']['Row'];
type TechnicalSolutionInsert = Database['public']['Tables']['technical_solutions']['Insert'];
type TechnicalSolutionUpdate = Database['public']['Tables']['technical_solutions']['Update'];

class TechnicalSolutionService {
  async createSolution(solution: TechnicalSolutionInsert): Promise<TechnicalSolution> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .insert(solution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSolution(id: string): Promise<TechnicalSolution | null> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getProjectSolutions(projectId: string): Promise<TechnicalSolution[]> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getCategorySolutions(projectId: string, categoryId: string): Promise<TechnicalSolution[]> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .select('*')
      .eq('project_id', projectId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getSubCategorySolutions(
    projectId: string,
    categoryId: string,
    subCategoryId: string
  ): Promise<TechnicalSolution[]> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .select('*')
      .eq('project_id', projectId)
      .eq('category_id', categoryId)
      .eq('sub_category_id', subCategoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateSolution(id: string, updates: TechnicalSolutionUpdate): Promise<TechnicalSolution> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSolution(id: string): Promise<void> {
    const { error } = await supabase
      .from('technical_solutions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async approveSolution(id: string, approvedBy: string): Promise<TechnicalSolution> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approval_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async rejectSolution(id: string): Promise<TechnicalSolution> {
    const { data, error } = await supabase
      .from('technical_solutions')
      .update({
        status: 'rejected',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const technicalSolutionService = new TechnicalSolutionService(); 