import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectSummary, ProjectFilters } from '../types/project';

const STORAGE_KEY = 'energy_class_projects';

class ProjectService {
  private projects: Project[] = [];

  constructor() {
    this.loadProjects();
  }

  private loadProjects(): void {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (storedProjects) {
      this.projects = JSON.parse(storedProjects, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'lastUpdated' || key === 'lastRenovation') {
          return new Date(value);
        }
        return value;
      });
    }
  }

  private saveProjects(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      assessments: projectData.assessments || {}
    };

    this.projects.push(newProject);
    this.saveProjects();
    return newProject;
  }

  async getProject(id: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === id);
    return project || null;
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject: Project = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date()
    };

    this.projects[index] = updatedProject;
    this.saveProjects();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    this.saveProjects();
    return true;
  }

  async getProjects(filters?: ProjectFilters): Promise<ProjectSummary[]> {
    let filteredProjects = [...this.projects];

    if (filters) {
      if (filters.status) {
        filteredProjects = filteredProjects.filter(p => p.status === filters.status);
      }
      if (filters.clientName) {
        filteredProjects = filteredProjects.filter(p => 
          p.clientName.toLowerCase().includes(filters.clientName!.toLowerCase())
        );
      }
      if (filters.buildingType) {
        filteredProjects = filteredProjects.filter(p => 
          p.metadata.buildingType === filters.buildingType
        );
      }
      if (filters.dateRange) {
        filteredProjects = filteredProjects.filter(p => 
          p.createdAt >= filters.dateRange!.start && 
          p.createdAt <= filters.dateRange!.end
        );
      }
    }

    return filteredProjects.map(project => this.createProjectSummary(project));
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
}

export const projectService = new ProjectService(); 