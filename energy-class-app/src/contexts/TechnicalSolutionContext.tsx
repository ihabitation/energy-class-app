import React, { createContext, useContext, useState, useCallback } from 'react';
import { technicalSolutionService } from '../services/technicalSolutionService';
import { Database } from '../types/supabase';

type TechnicalSolution = Database['public']['Tables']['technical_solutions']['Row'];
type TechnicalSolutionInsert = Database['public']['Tables']['technical_solutions']['Insert'];
type TechnicalSolutionUpdate = Database['public']['Tables']['technical_solutions']['Update'];

interface TechnicalSolutionContextType {
  solutions: TechnicalSolution[];
  loading: boolean;
  error: string | null;
  createSolution: (solution: TechnicalSolutionInsert) => Promise<TechnicalSolution>;
  updateSolution: (id: string, updates: TechnicalSolutionUpdate) => Promise<TechnicalSolution>;
  deleteSolution: (id: string) => Promise<void>;
  approveSolution: (id: string, approvedBy: string) => Promise<TechnicalSolution>;
  rejectSolution: (id: string) => Promise<TechnicalSolution>;
  getProjectSolutions: (projectId: string) => Promise<TechnicalSolution[]>;
  getCategorySolutions: (projectId: string, categoryId: string) => Promise<TechnicalSolution[]>;
  getSubCategorySolutions: (
    projectId: string,
    categoryId: string,
    subCategoryId: string
  ) => Promise<TechnicalSolution[]>;
}

const TechnicalSolutionContext = createContext<TechnicalSolutionContextType | undefined>(undefined);

export const useTechnicalSolutions = () => {
  const context = useContext(TechnicalSolutionContext);
  if (!context) {
    throw new Error('useTechnicalSolutions must be used within a TechnicalSolutionProvider');
  }
  return context;
};

export const TechnicalSolutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [solutions, setSolutions] = useState<TechnicalSolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSolution = async (solution: TechnicalSolutionInsert) => {
    try {
      setLoading(true);
      setError(null);
      const newSolution = await technicalSolutionService.createSolution(solution);
      setSolutions((prev) => [...prev, newSolution]);
      return newSolution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la solution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSolution = async (id: string, updates: TechnicalSolutionUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSolution = await technicalSolutionService.updateSolution(id, updates);
      setSolutions((prev) =>
        prev.map((solution) => (solution.id === id ? updatedSolution : solution))
      );
      return updatedSolution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la solution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSolution = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await technicalSolutionService.deleteSolution(id);
      setSolutions((prev) => prev.filter((solution) => solution.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la solution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveSolution = async (id: string, approvedBy: string) => {
    try {
      setLoading(true);
      setError(null);
      const approvedSolution = await technicalSolutionService.approveSolution(id, approvedBy);
      setSolutions((prev) =>
        prev.map((solution) => (solution.id === id ? approvedSolution : solution))
      );
      return approvedSolution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'approbation de la solution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectSolution = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const rejectedSolution = await technicalSolutionService.rejectSolution(id);
      setSolutions((prev) =>
        prev.map((solution) => (solution.id === id ? rejectedSolution : solution))
      );
      return rejectedSolution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet de la solution');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectSolutions = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const projectSolutions = await technicalSolutionService.getProjectSolutions(projectId);
      setSolutions(projectSolutions);
      return projectSolutions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des solutions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategorySolutions = useCallback(async (projectId: string, categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      const categorySolutions = await technicalSolutionService.getCategorySolutions(
        projectId,
        categoryId
      );
      setSolutions(categorySolutions);
      return categorySolutions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des solutions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubCategorySolutions = useCallback(
    async (projectId: string, categoryId: string, subCategoryId: string) => {
      try {
        setLoading(true);
        setError(null);
        const subCategorySolutions = await technicalSolutionService.getSubCategorySolutions(
          projectId,
          categoryId,
          subCategoryId
        );
        setSolutions(subCategorySolutions);
        return subCategorySolutions;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des solutions');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = {
    solutions,
    loading,
    error,
    createSolution,
    updateSolution,
    deleteSolution,
    approveSolution,
    rejectSolution,
    getProjectSolutions,
    getCategorySolutions,
    getSubCategorySolutions,
  };

  return (
    <TechnicalSolutionContext.Provider value={value}>
      {children}
    </TechnicalSolutionContext.Provider>
  );
}; 