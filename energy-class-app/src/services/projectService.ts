import { Project, ProjectSummary, ProjectFilters } from '../types/project';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type AssessmentRow = Database['public']['Tables']['assessments']['Row'];

class ProjectService {
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Utilisateur non connecté');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description || null,
        client_name: projectData.clientName,
        user_id: session.user.id,
        address: {
          street: projectData.address.street,
          city: projectData.address.city,
          postal_code: projectData.address.postalCode,
          country: projectData.address.country
        },
        status: projectData.status,
        metadata: {
          building_type: projectData.metadata.buildingType,
          construction_year: projectData.metadata.constructionYear,
          total_area: projectData.metadata.totalArea,
          floors: projectData.metadata.floors,
          last_renovation: projectData.metadata.lastRenovation?.toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;

    return this.convertProjectRowToProject(project);
  }

  async getProject(id: string): Promise<Project | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Utilisateur non connecté');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        assessments (*)
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) return null;
    if (!project) return null;

    return this.convertProjectRowToProject(project);
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Utilisateur non connecté');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        client_name: updates.clientName,
        address: updates.address && {
          street: updates.address.street,
          city: updates.address.city,
          postal_code: updates.address.postalCode,
          country: updates.address.country
        },
        status: updates.status,
        metadata: updates.metadata && {
          building_type: updates.metadata.buildingType,
          construction_year: updates.metadata.constructionYear,
          total_area: updates.metadata.totalArea,
          floors: updates.metadata.floors,
          last_renovation: updates.metadata.lastRenovation?.toISOString()
        }
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        assessments (*)
      `)
      .single();

    if (error) return null;
    return this.convertProjectRowToProject(project);
  }

  async deleteProject(id: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Utilisateur non connecté');
    }

    // Supprimer d'abord les entrées dans global_results
    const { error: globalResultsError } = await supabase
      .from('global_results')
      .delete()
      .eq('project_id', id);

    if (globalResultsError) {
      console.error('Erreur lors de la suppression des résultats globaux:', globalResultsError);
      return false;
    }

    // Supprimer le projet
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    return !projectError;
  }

  async getProjects(filters?: ProjectFilters): Promise<ProjectSummary[]> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Utilisateur non connecté');
    }

    let query = supabase
      .from('projects')
      .select(`
        *,
        assessments (*)
      `)
      .eq('user_id', session.user.id);

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.clientName) {
        query = query.ilike('client_name', `%${filters.clientName}%`);
      }
      if (filters.buildingType) {
        query = query.eq('metadata->building_type', filters.buildingType);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }
    }

    const { data: projects, error } = await query;

    if (error) throw error;
    return projects.map(project => this.createProjectSummary(this.convertProjectRowToProject(project)));
  }

  private createProjectSummary(project: Project): ProjectSummary {
    const totalAssessments = this.countTotalAssessments(project);
    const completedAssessments = this.countCompletedAssessments(project);
    const progress = totalAssessments > 0 
      ? (completedAssessments / totalAssessments) * 100 
      : 0;

    return {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      createdAt: project.createdAt,
      progress,
      worstClass: this.calculateWorstClass(project)
    };
  }

  private countTotalAssessments(project: Project): number {
    return Object.values(project.assessments).reduce((total, category) => 
      total + Object.keys(category).length, 0
    );
  }

  private countCompletedAssessments(project: Project): number {
    return Object.values(project.assessments).reduce((total, category) => 
      total + Object.values(category).filter(assessment => 
        assessment.selectedClass && assessment.selectedOption
      ).length, 0
    );
  }

  private calculateWorstClass(project: Project): 'A' | 'B' | 'C' | 'D' | 'NA' {
    const classes = Object.values(project.assessments)
      .flatMap(category => Object.values(category))
      .map(assessment => assessment.selectedClass)
      .filter(Boolean) as ('A' | 'B' | 'C' | 'D' | 'NA')[];

    if (classes.length === 0) return 'NA';

    const classValues = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'NA': 5 } as const;
    return classes.reduce((worst, current) => 
      classValues[current] > classValues[worst] 
        ? current 
        : worst
    ) as 'A' | 'B' | 'C' | 'D' | 'NA';
  }

  private convertProjectRowToProject(row: ProjectRow & { assessments?: AssessmentRow[] }): Project {
    const assessments: Project['assessments'] = {};
    
    if (row.assessments) {
      row.assessments.forEach(assessment => {
        if (!assessments[assessment.category_id]) {
          assessments[assessment.category_id] = {};
        }
        assessments[assessment.category_id][assessment.sub_category_id] = {
          selectedClass: assessment.selected_class,
          selectedOption: assessment.selected_option,
          notes: assessment.notes || undefined,
          lastUpdated: new Date(assessment.last_updated)
        };
      });
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      clientName: row.client_name,
      user_id: row.user_id,
      address: {
        street: row.address.street,
        city: row.address.city,
        postalCode: row.address.postal_code,
        country: row.address.country
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      status: row.status,
      assessments,
      metadata: {
        buildingType: row.metadata.building_type,
        constructionYear: row.metadata.construction_year,
        totalArea: row.metadata.total_area,
        floors: row.metadata.floors,
        lastRenovation: row.metadata.last_renovation ? new Date(row.metadata.last_renovation) : undefined
      }
    };
  }
}

export const projectService = new ProjectService(); 