import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '../types/energyClass';
import { getCategories } from '../services/energyClassService';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

interface CategoryContextType {
  categories: Category[];
  toggleCategory: (categoryId: string, projectId: string) => Promise<void>;
  getGlobalResults: (projectId: string) => Promise<{
    finalClass: string;
    enabledCategories: string[];
    disabledCategories: string[];
  } | null>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const { projectId } = useParams<{ projectId: string }>();

  // Charger les catégories depuis Supabase au démarrage
  useEffect(() => {
    if (projectId) {
      loadCategories(projectId);
    }
  }, [projectId]);

  const loadCategories = async (projectId: string) => {
    // Fonction temporaire pour nettoyer la table
    const { error: upsertError } = await supabase
      .from('global_results')
      .upsert(
        {
          project_id: projectId,
          enabled_categories: [],
          disabled_categories: [],
          final_class: 'NA',
          last_updated: new Date().toISOString()
        },
        { onConflict: 'project_id' }
      );

    if (upsertError) {
      console.error('Erreur lors de la mise à jour des entrées:', upsertError);
      return;
    }

    console.log('Table global_results mise à jour avec succès');

    const { data: globalResult, error } = await supabase
      .from('global_results')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      return;
    }

    // Si aucun résultat n'existe, créer une entrée par défaut
    if (!globalResult) {
      const { error: insertError } = await supabase
        .from('global_results')
        .upsert(
          {
            project_id: projectId,
            enabled_categories: categories.map(c => c.id),
            disabled_categories: [],
            final_class: 'NA',
            last_updated: new Date().toISOString()
          },
          { onConflict: 'project_id' }
        );

      if (insertError) {
        console.error('Erreur lors de la création des résultats globaux:', insertError);
        return;
      }
    }

    const disabledCategories = globalResult?.disabled_categories || [];
    setCategories(prev => 
      prev.map(category => ({
        ...category,
        isEnabled: !disabledCategories.includes(category.id)
      }))
    );
  };

  const getGlobalResults = async (projectId: string) => {
    const { data: globalResult, error } = await supabase
      .from('global_results')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération des résultats globaux:', error);
      return null;
    }

    return {
      finalClass: globalResult.final_class,
      enabledCategories: globalResult.enabled_categories || [],
      disabledCategories: globalResult.disabled_categories || []
    };
  };

  const toggleCategory = async (categoryId: string, projectId: string) => {
    console.log('toggleCategory appelé avec categoryId:', categoryId);
    console.log('projectId passé en paramètre:', projectId);
    
    if (!projectId) {
      console.error('Pas de projectId disponible');
      return;
    }

    // Mettre à jour l'état local
    const updatedCategories = categories.map(category => 
      category.id === categoryId 
        ? { ...category, isEnabled: !category.isEnabled }
        : category
    );
    console.log('Catégories mises à jour localement:', updatedCategories);
    setCategories(updatedCategories);

    // Préparer les listes de catégories
    const enabledCategories = updatedCategories
      .filter(category => category.isEnabled)
      .map(category => category.id);
    const disabledCategories = updatedCategories
      .filter(category => !category.isEnabled)
      .map(category => category.id);

    console.log('Catégories activées:', enabledCategories);
    console.log('Catégories désactivées:', disabledCategories);

    // Récupérer la classe finale actuelle
    const { data: currentResult } = await supabase
      .from('global_results')
      .select('final_class')
      .eq('project_id', projectId)
      .single();

    const currentFinalClass = currentResult?.final_class || 'NA';

    // Mettre à jour dans Supabase avec upsert
    console.log('Tentative de mise à jour dans Supabase...');
    const { error } = await supabase
      .from('global_results')
      .upsert(
        { 
          project_id: projectId,
          enabled_categories: enabledCategories,
          disabled_categories: disabledCategories,
          final_class: currentFinalClass,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'project_id' }
      );

    if (error) {
      console.error('Erreur lors de la mise à jour des catégories dans Supabase:', error);
      // Restaurer l'état précédent en cas d'erreur
      console.log('Tentative de restauration de l\'état précédent...');
      await loadCategories(projectId);
    } else {
      console.log('Mise à jour dans Supabase réussie');
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, toggleCategory, getGlobalResults }}>
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