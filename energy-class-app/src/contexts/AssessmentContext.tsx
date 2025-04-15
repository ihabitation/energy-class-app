import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuildingAssessment } from '../types/energyClass';
import { supabase } from '../lib/supabase';
import { calculateFinalClass } from '../services/energyClassService';

interface AssessmentContextType {
  getAssessment: (projectId: string) => BuildingAssessment;
  updateAssessment: (projectId: string, subCategoryId: string, selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => Promise<void>;
  updateGlobalResults: (projectId: string, assessment: BuildingAssessment, enabledCategories: string[]) => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessments, setAssessments] = useState<Record<string, BuildingAssessment>>({});

  const getAssessment = (projectId: string) => {
    return assessments[projectId] || {};
  };

  const updateGlobalResults = async (projectId: string, assessment: BuildingAssessment, enabledCategories: string[]) => {
    const finalClass = calculateFinalClass(assessment, enabledCategories);
    
    const { error } = await supabase
      .from('global_results')
      .upsert(
        {
          project_id: projectId,
          final_class: finalClass,
          enabled_categories: enabledCategories,
          last_updated: new Date().toISOString()
        },
        {
          onConflict: 'project_id'
        }
      );

    if (error) {
      console.error('Erreur lors de la mise à jour des résultats globaux:', error);
    }
  };

  const updateAssessment = async (
    projectId: string,
    subCategoryId: string,
    selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA',
    selectedOption: string
  ) => {
    try {
      // Extraire la catégorie (première partie) et le reste comme sous-catégorie
      const [categoryId, ...subCategoryParts] = subCategoryId.split('.');
      const subCategory = subCategoryParts.join('.');
      
      console.log('Mise à jour de l\'évaluation:', {
        projectId,
        categoryId,
        subCategory,
        selectedClass,
        selectedOption
      });

      // Mettre à jour la base de données
      const { error } = await supabase
        .from('assessments')
        .upsert({
          project_id: projectId,
          category_id: categoryId,
          sub_category_id: subCategory,
          selected_class: selectedClass,
          selected_option: selectedOption,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      // Mettre à jour le state local
      const updatedAssessment = {
        ...assessments[projectId],
        [subCategoryId]: {
          selectedClass,
          selectedOption
        }
      };
      setAssessments(prev => ({
        ...prev,
        [projectId]: updatedAssessment
      }));

      // Récupérer les catégories activées pour mettre à jour les résultats globaux
      const { data: globalResult, error: globalError } = await supabase
        .from('global_results')
        .select('*')
        .eq('project_id', projectId)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (globalError) {
        console.error('Erreur lors de la récupération des résultats globaux:', globalError);
        // Créer un nouvel enregistrement si aucun n'existe
        const { error: insertError } = await supabase
          .from('global_results')
          .upsert(
            {
              project_id: projectId,
              enabled_categories: [],
              disabled_categories: [],
              final_class: 'NA',
              last_updated: new Date().toISOString()
            },
            {
              onConflict: 'project_id'
            }
          );

        if (insertError) {
          console.error('Erreur lors de la création des résultats globaux:', insertError);
          return;
        }
      }

      if (globalResult?.enabled_categories) {
        await updateGlobalResults(projectId, updatedAssessment, globalResult.enabled_categories);
      }
    } catch (error) {
      console.error('Erreur dans updateAssessment:', error);
      throw error;
    }
  };

  // Charger les évaluations au démarrage
  useEffect(() => {
    const loadAssessments = async () => {
      // Charger les évaluations
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*');

      if (assessmentsError) {
        console.error('Erreur lors du chargement des évaluations:', assessmentsError);
        return;
      }

      // Transformer les données de la base en format BuildingAssessment
      const loadedAssessments: Record<string, BuildingAssessment> = {};
      assessmentsData.forEach(assessment => {
        const projectId = assessment.project_id;
        const subCategoryId = `${assessment.category_id}.${assessment.sub_category_id}`;

        if (!loadedAssessments[projectId]) {
          loadedAssessments[projectId] = {};
        }

        loadedAssessments[projectId][subCategoryId] = {
          selectedClass: assessment.selected_class,
          selectedOption: assessment.selected_option
        };
      });

      setAssessments(loadedAssessments);

      // Initialiser les global_results pour tous les projets
      const projectIds = Array.from(new Set(assessmentsData.map(a => a.project_id)));
      for (const projectId of projectIds) {
        const { error: globalError } = await supabase
          .from('global_results')
          .upsert(
            {
              project_id: projectId,
              enabled_categories: [], // Toutes les catégories sont activées par défaut
              disabled_categories: [],
              final_class: 'NA',
              last_updated: new Date().toISOString()
            },
            {
              onConflict: 'project_id'
            }
          );

        if (globalError) {
          console.error(`Erreur lors de l'initialisation des global_results pour le projet ${projectId}:`, globalError);
        }
      }
    };

    loadAssessments();
  }, []);

  return (
    <AssessmentContext.Provider value={{ getAssessment, updateAssessment, updateGlobalResults }}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}; 