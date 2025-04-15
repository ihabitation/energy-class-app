import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, ProjectSummary, ProjectFilters } from '../types/project';
import { projectService } from '../services/projectService';
import { supabase } from '../lib/supabase';

interface ProjectContextType {
  projects: ProjectSummary[];
  loading: boolean;
  error: string | null;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  refreshProjects: () => Promise<void>;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Promise<Project | null>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await projectService.getProjects(filters);
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject = await projectService.createProject(projectData);
      await refreshProjects();
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      if (updatedProject) {
        await refreshProjects();
      }
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du projet');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const success = await projectService.deleteProject(id);
      if (success) {
        await refreshProjects();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du projet');
      throw err;
    }
  };

  const getProject = async (id: string) => {
    try {
      return await projectService.getProject(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du projet');
      throw err;
    }
  };

  const value = {
    projects,
    loading,
    error,
    filters,
    setFilters,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 