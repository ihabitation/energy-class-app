import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuildingAssessment } from '../types/energyClass';
import { supabase } from '../lib/supabase';
import { calculateFinalClass } from '../services/energyClassService';
import { getCategories, getSubCategories } from '../services/energyClassService';

interface AssessmentContextType {
  getAssessment: (projectId: string) => BuildingAssessment;
  updateAssessment: (projectId: string, subCategoryId: string, classType: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => Promise<void>;
  updateGlobalResults: (projectId: string, enabledCategories: string[]) => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessments, setAssessments] = useState<Record<string, BuildingAssessment>>({});

  const getAssessment = (projectId: string) => {
    return assessments[projectId] || {};
  };

  const updateGlobalResults = async (projectId: string, enabledCategories: string[]) => {
    try {
      console.log('Mise à jour des résultats globaux pour le projet:', projectId);
      console.log('Catégories activées:', enabledCategories);

      // Récupérer l'assessment actuel
      const assessment = getAssessment(projectId);
      const finalClass = calculateFinalClass(assessment, enabledCategories);
      console.log('Nouvelle classe finale calculée:', finalClass);

      // Calculer la progression
      let totalSubCategories = 0;
      let completedSubCategories = 0;

      enabledCategories.forEach(categoryId => {
        const subCategories = getSubCategories(categoryId);
        totalSubCategories += subCategories.length;
        
        completedSubCategories += subCategories.filter((subCat: { id: string }) => {
          const classType = assessment[subCat.id]?.classType;
          return classType !== undefined;
        }).length;
      });

      const progress = totalSubCategories > 0 
        ? Math.round((completedSubCategories / totalSubCategories) * 100) 
        : 0;
      console.log('Progression calculée:', progress);

      // Supprimer les entrées existantes
      const { error: deleteError } = await supabase
        .from('global_results')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Erreur lors de la suppression des entrées existantes:', deleteError);
        return;
      }

      // Créer les nouvelles entrées uniquement pour les catégories activées
      const entries = enabledCategories.map(categoryId => ({
        project_id: projectId,
        category_id: categoryId,
        final_class: finalClass,
        project_progress: progress,
        last_updated: new Date().toISOString()
      }));

      const { error: upsertError } = await supabase
        .from('global_results')
        .upsert(entries, {
          onConflict: 'project_id,category_id'
        });

      if (upsertError) {
        console.error('Erreur lors de la mise à jour des entrées:', upsertError);
        return;
      }

      console.log('Classe finale et progression mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe finale et de la progression:', error);
    }
  };

  const updateAssessment = async (
    projectId: string,
    subCategoryId: string,
    classType: 'A' | 'B' | 'C' | 'D' | 'NA',
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
        classType,
        selectedOption
      });

      // Mettre à jour la base de données
      const { error } = await supabase
        .from('assessments')
        .upsert({
          project_id: projectId,
          category_id: categoryId,
          sub_category_id: subCategory,
          selected_class: classType,
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
          classType,
          selectedOption
        }
      };
      setAssessments(prev => ({
        ...prev,
        [projectId]: updatedAssessment
      }));

      // Récupérer les catégories activées
      const { data: globalResults, error: globalError } = await supabase
        .from('global_results')
        .select('category_id, is_enabled')
        .eq('project_id', projectId);

      if (globalError) {
        console.error('Erreur lors de la récupération des résultats globaux:', globalError);
        return;
      }

      const enabledCategories = globalResults
        ?.filter(result => result.is_enabled)
        .map(result => result.category_id) || [];

      await updateGlobalResults(projectId, enabledCategories);
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
          classType: assessment.selected_class,
          selectedOption: assessment.selected_option
        };
      });

      setAssessments(loadedAssessments);

      // Initialiser les global_results pour tous les projets
      const projectIds = Array.from(new Set(assessmentsData.map(a => a.project_id)));
      const allCategories = getCategories();

      for (const projectId of projectIds) {
        // Vérifier si des entrées existent déjà pour ce projet
        const { data: existingResults, error: checkError } = await supabase
          .from('global_results')
          .select('category_id')
          .eq('project_id', projectId);

        if (checkError) {
          console.error(`Erreur lors de la vérification des résultats pour le projet ${projectId}:`, checkError);
          continue;
        }

        // Si aucune entrée n'existe, créer les entrées par défaut
        if (!existingResults || existingResults.length === 0) {
          const defaultEntries = allCategories.map(category => ({
            project_id: projectId,
            category_id: category.id,
            is_enabled: true,
            last_updated: new Date().toISOString()
          }));

          const { error: insertError } = await supabase
            .from('global_results')
            .insert(defaultEntries);

          if (insertError) {
            console.error(`Erreur lors de l'initialisation des résultats pour le projet ${projectId}:`, insertError);
          }
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