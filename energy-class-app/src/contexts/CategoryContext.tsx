import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '../types/energyClass';
import { getCategories } from '../services/energyClassService';
import { supabase } from '../lib/supabase';
import { useParams, useLocation } from 'react-router-dom';
import { useAssessment } from './AssessmentContext';
import { useProjects } from './ProjectContext';

interface CategoryContextType {
  categories: Category[];
  toggleCategory: (categoryId: string, projectId: string) => Promise<void>;
  getEnabledCategories: (projectId: string) => string[];
  setCategories: (updater: (prevCategories: Category[]) => Category[]) => void;
  isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { updateGlobalResults } = useAssessment();
  const { projects } = useProjects();

  // Chargement initial des catégories
  useEffect(() => {
    let isMounted = true;

    const initializeCategories = async () => {
      if (!isMounted) return;

      console.log('=== Initialisation des catégories ===');
      console.log('ProjectId:', urlProjectId);
      console.log('Location:', location.pathname);
      setIsLoading(true);

      try {
        const initialCategories = getCategories().map(cat => ({ ...cat, isEnabled: false }));

        // Si nous sommes sur la page d'accueil, on charge les états pour tous les projets
        if (location.pathname === '/') {
          console.log('Page d\'accueil - chargement des états pour tous les projets');
          
          // Pour chaque projet, charger ses états de catégories
          const allResults = await Promise.all(
            projects.map(async (project) => {
              const { data: results, error } = await supabase
                .from('global_results')
                .select('*')
                .eq('project_id', project.id);

              if (error) {
                console.error(`❌ Erreur lors du chargement des états pour le projet ${project.id}:`, error);
                return [];
              }

              return results || [];
            })
          );

          // Fusionner tous les résultats
          const mergedResults = allResults.flat();

          const categoriesWithStates = initialCategories.map(category => {
            const result = mergedResults.find(r => r.category_id === category.id);
            const isEnabled = result !== undefined ? result.is_enabled : false;
            console.log(`Catégorie ${category.id}: ${isEnabled ? 'activée' : 'désactivée'}`);
            return {
              ...category,
              isEnabled
            };
          });

          if (isMounted) {
            setCategories(categoriesWithStates);
            setIsLoading(false);
          }
          return;
        }

        // Extraire le projectId de l'URL si useParams ne l'a pas encore fait
        const pathProjectId = location.pathname.split('/')[2];
        const currentProjectId = urlProjectId || pathProjectId;

        if (!currentProjectId) {
          console.log('En attente du projectId...');
          if (isMounted) {
            setCategories(initialCategories);
            setIsLoading(false);
          }
          return;
        }

        console.log('Chargement des états depuis Supabase pour le projet:', currentProjectId);
        const { data: results, error } = await supabase
          .from('global_results')
          .select('*')
          .eq('project_id', currentProjectId);

        if (error) {
          console.error('❌ Erreur lors du chargement initial des états:', error);
          if (isMounted) {
            setCategories(initialCategories);
            setIsLoading(false);
          }
          return;
        }

        console.log('États reçus de Supabase:', results);

        const categoriesWithStates = initialCategories.map(category => {
          const result = results?.find(r => r.category_id === category.id);
          const isEnabled = result !== undefined ? result.is_enabled : false;
          console.log(`Catégorie ${category.id}: ${isEnabled ? 'activée' : 'désactivée'}`);
          return {
            ...category,
            isEnabled
          };
        });

        if (isMounted) {
          setCategories(categoriesWithStates);
          setIsLoading(false);

          // Mettre à jour les résultats globaux
          const enabledCategories = categoriesWithStates
            .filter(category => category.isEnabled)
            .map(category => category.id);

          console.log('Mise à jour initiale des résultats globaux avec:', enabledCategories);
          await updateGlobalResults(currentProjectId, enabledCategories);
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des catégories:', error);
        if (isMounted) {
          setCategories(getCategories().map(cat => ({ ...cat, isEnabled: false })));
          setIsLoading(false);
        }
      }
    };

    initializeCategories();

    return () => {
      isMounted = false;
    };
  }, [urlProjectId, location.pathname, updateGlobalResults, projects]);

  const getEnabledCategories = (projectId: string): string[] => {
    console.log('=== getEnabledCategories ===');
    console.log('ProjectId:', projectId);
    console.log('État actuel des catégories:', categories.map(c => ({
      id: c.id,
      isEnabled: c.isEnabled
    })));
    
    const enabledCategories = categories
      .filter(category => category.isEnabled)
      .map(category => category.id);
    
    console.log('Catégories activées retournées:', enabledCategories);
    return enabledCategories;
  };

  const loadCategoryStates = async (currentProjectId: string) => {
    try {
      console.log('=== loadCategoryStates ===');
      console.log('Loading states for project:', currentProjectId);

      // Charger les états depuis Supabase
      const { data: results, error } = await supabase
        .from('global_results')
        .select('*')
        .eq('project_id', currentProjectId);

      if (error) {
        console.error('❌ Erreur lors du chargement des états:', error);
        return;
      }

      console.log('États reçus de Supabase:', results);

      // Mettre à jour les catégories avec les états de Supabase
      const updatedCategories = categories.map(category => {
        const result = results?.find(r => r.category_id === category.id);
        // Si pas de résultat dans Supabase, on garde l'état actuel de la catégorie
        const isEnabled = result !== undefined ? result.is_enabled : category.isEnabled;
        console.log(`Catégorie ${category.id}: ${isEnabled ? 'activée' : 'désactivée'}`);
        return {
          ...category,
          isEnabled
        };
      });

      console.log('Nouvelles catégories à définir:', updatedCategories.map(c => ({
        id: c.id,
        isEnabled: c.isEnabled
      })));

      setCategories(updatedCategories);

      // Mettre à jour les résultats globaux
      const enabledCategories = updatedCategories
        .filter(category => category.isEnabled)
        .map(category => category.id);

      console.log('Mise à jour des résultats globaux avec:', enabledCategories);
      await updateGlobalResults(currentProjectId, enabledCategories);

      console.log('✅ Chargement des états terminé');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des catégories:', error);
    }
  };

  const toggleCategory = async (categoryId: string, projectId: string) => {
    try {
      console.log('=== toggleCategory ===');
      console.log('Toggle demandé pour:', categoryId);
      console.log('Project ID:', projectId);

      // Trouver l'état actuel dans les catégories locales
      const currentCategory = categories.find(c => c.id === categoryId);
      if (!currentCategory) {
        console.error('❌ Catégorie non trouvée:', categoryId);
        return;
      }

      const newState = !currentCategory.isEnabled;
      console.log('État actuel dans les catégories locales:', currentCategory.isEnabled);
      console.log('Nouvel état à appliquer:', newState);

      // Mettre à jour l'état local immédiatement pour une meilleure réactivité
      setCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category =>
          category.id === categoryId
            ? { ...category, isEnabled: newState }
            : category
        );
        console.log('État local mis à jour:', updatedCategories.map(c => ({
          id: c.id,
          isEnabled: c.isEnabled
        })));
        return updatedCategories;
      });

      // Mettre à jour Supabase
      const { error: updateError } = await supabase
        .from('global_results')
        .update({ 
          is_enabled: newState,
          last_updated: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('category_id', categoryId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de Supabase:', updateError);
        // En cas d'erreur, on recharge les états depuis Supabase
        await loadCategoryStates(projectId);
        return;
      }

      // Mettre à jour les résultats globaux
      const enabledCategories = categories
        .map(category => category.id === categoryId ? { ...category, isEnabled: newState } : category)
        .filter(category => category.isEnabled)
        .map(category => category.id);

      console.log('Mise à jour des résultats globaux avec:', enabledCategories);
      await updateGlobalResults(projectId, enabledCategories);

      console.log('✅ Toggle terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du toggle de la catégorie:', error);
      // En cas d'erreur, on recharge les états depuis Supabase
      await loadCategoryStates(projectId);
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, toggleCategory, getEnabledCategories, setCategories, isLoading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}; 