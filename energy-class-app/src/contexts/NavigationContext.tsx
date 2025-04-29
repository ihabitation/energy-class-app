import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { useProjects } from './ProjectContext';
import { getCategories, getSubCategories } from '../services/energyClassService';

interface NavigationContextType {
  currentProjectId?: string;
  currentProjectName?: string;
  currentCategory?: string;
  currentSubCategory?: string;
  isAssessment?: boolean;
}

const NavigationContext = createContext<NavigationContextType>({});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<NavigationContextType>({});
  const location = useLocation();
  const { projects } = useProjects();

  // Définir tous les patterns d'URL possibles
  const projectMatch = useMatch('/projects/:projectId');
  const assessmentMatch = useMatch('/projects/:projectId/assessment');
  const categoryMatch = useMatch('/projects/:projectId/category/:categoryId');
  const subCategoryMatch = useMatch('/projects/:projectId/category/:categoryId/subcategory/:subCategoryId');

  useEffect(() => {
    const updateNavigation = () => {
      // Déterminer le pattern qui correspond le mieux à l'URL actuelle
      const currentMatch = subCategoryMatch || categoryMatch || assessmentMatch || projectMatch;
      
      if (!currentMatch) return;

      const projectId = currentMatch.params.projectId;
      const categoryId = (categoryMatch || subCategoryMatch)?.params?.categoryId;
      const subCategoryId = subCategoryMatch?.params?.subCategoryId;

      // Trouver le projet
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      // Trouver la catégorie si applicable
      const allCategories = getCategories();
      const category = categoryId ? 
        allCategories.find(c => c.id.toLowerCase() === categoryId.toLowerCase()) : undefined;

      // Trouver la sous-catégorie si applicable
      const subCategory = subCategoryId && categoryId ? 
        getSubCategories(categoryId).find(s => s.id === subCategoryId) : undefined;

      // Déterminer si nous sommes dans la vue d'évaluation
      const isAssessment = location.pathname.includes('/assessment') || 
                          location.pathname.includes('/category/');

      const newState = {
        currentProjectId: project.id,
        currentProjectName: project.name,
        currentCategory: category?.name,
        currentSubCategory: subCategory?.name,
        isAssessment
      };

      setNavigationState(newState);
    };

    updateNavigation();
  }, [location.pathname, projects, subCategoryMatch, categoryMatch, assessmentMatch, projectMatch]);

  return (
    <NavigationContext.Provider value={navigationState}>
      {children}
    </NavigationContext.Provider>
  );
}; 