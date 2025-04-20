import { EnergyClass, Category, SubCategory, ClassOption, BuildingAssessment } from '../types/energyClass';

// Import des données JSON
import chauffageData from '../ressources/01 chauffage.json';
import ecsData from '../ressources/02 ECS.json';
import refroidissementData from '../ressources/03 refroidissement.json';
import ventilationData from '../ressources/04 ventil_clim.json';
import eclairageData from '../ressources/05 eclairage.json';
import storesData from '../ressources/06 stores.json';
import gtbData from '../ressources/07 GTB.json';

const energyData = {
  chauffage: chauffageData as EnergyClass,
  ecs: ecsData as EnergyClass,
  refroidissement: refroidissementData as EnergyClass,
  ventilation: ventilationData as EnergyClass,
  eclairage: eclairageData as EnergyClass,
  stores: storesData as EnergyClass,
  gtb: gtbData as EnergyClass
};

export const getCategories = (): Category[] => {
  return Object.entries(energyData).map(([id, data]) => {
    const mainCategory = Object.values(data)[0];
    const subCategories = Object.entries(mainCategory.sous_categories).map(([subId, subData]) => ({
      id: `${id}.${subId}`,
      name: subId.split('_').slice(1).join(' '),
      description: subData.description,
      details: Object.values(subData.classes)
        .map(classData => Object.values(classData as Record<string, { description: string; impact: string }>))
        .flat()
        .map(option => `${option.description}\nImpact : ${option.impact}`)
        .join('\n\n')
    }));

    return {
      id,
      name: Object.keys(data)[0].split('_').slice(1).join(' '),
      description: mainCategory.description,
      isEnabled: true,
      subCategories
    };
  });
};

export const getSubCategories = (categoryId: string): SubCategory[] => {
  const categoryData = energyData[categoryId as keyof typeof energyData];
  if (!categoryData) return [];

  const mainCategory = Object.values(categoryData)[0];
  return Object.entries(mainCategory.sous_categories).map(([id, data]) => {
    // Créer un résumé de la description
    const shortDescription = data.description.split('.')[0] + '.';

    // Extraire les options pour chaque classe
    const options = Object.entries(data.classes).flatMap(([classType, classData]) => {
      const className = classType.split('_')[1] as 'A' | 'B' | 'C' | 'D' | 'NA';
      return Object.entries(classData as Record<string, { description: string; impact: string }>).map(([optionId, optionData]) => ({
        id: optionId,
        name: optionId.split('_').join(' '),
        description: optionData.description,
        impact: optionData.impact,
        class: className
      }));
    });

    // Ajouter l'option NA
    options.push({
      id: 'non_applicable',
      name: 'Non applicable',
      description: 'Cette sous-catégorie n\'est pas applicable à ce bâtiment',
      impact: 'Cette sous-catégorie ne sera pas prise en compte dans le calcul de la classe finale',
      class: 'NA'
    });

    return {
      id: `${categoryId}.${id}`,
      name: id.split('_').slice(1).join(' '),
      description: shortDescription,
      details: data.description,
      options
    };
  });
};

export const getClassOptions = (categoryId: string, subCategoryId: string): ClassOption[] => {
  const categoryData = energyData[categoryId as keyof typeof energyData];
  if (!categoryData) return [];

  const mainCategory = Object.values(categoryData)[0];
  const subCategory = mainCategory.sous_categories[subCategoryId];
  if (!subCategory) return [];

  const options: ClassOption[] = [];
  Object.entries(subCategory.classes).forEach(([classType, classData]) => {
    Object.entries(classData as Record<string, { description: string; impact: string; images?: string[] }>).forEach(([optionId, optionData]) => {
      options.push({
        id: optionId,
        name: optionId.split('_').join(' '),
        description: optionData.description,
        impact: optionData.impact,
        images: optionData.images,
        subCategoryId,
        classType: classType.split('_')[1] as 'A' | 'B' | 'C' | 'D' | 'NA'
      });
    });
  });

  // Ajout de l'option "Non applicable"
  options.push({
    id: 'non_applicable',
    name: 'Non applicable',
    description: 'Cette sous-catégorie n\'est pas applicable à ce bâtiment',
    impact: 'Cette sous-catégorie ne sera pas prise en compte dans le calcul de la classe finale',
    images: [],
    subCategoryId,
    classType: 'NA'
  });

  return options;
};

export const calculateFinalClass = (assessment: BuildingAssessment, enabledCategories: string[]): 'A' | 'B' | 'C' | 'D' | 'NA' => {
  const classCounts: { [key: string]: number } = {
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0
  };

  // Compter le nombre d'occurrences de chaque classe pour les catégories activées
  Object.entries(assessment).forEach(([subCategoryId, { classType }]) => {
    const categoryId = subCategoryId.split('.')[0];
    if (enabledCategories.includes(categoryId) && classType && classType !== 'NA') {
      classCounts[classType]++;
    }
  });

  // Si aucune classe n'est sélectionnée, retourner NA
  const totalSelected = classCounts['A'] + classCounts['B'] + classCounts['C'] + classCounts['D'];
  if (totalSelected === 0) {
    return 'NA';
  }

  // Retourner la pire classe qui a été sélectionnée
  if (classCounts['D'] > 0) {
    return 'D';
  } else if (classCounts['C'] > 0) {
    return 'C';
  } else if (classCounts['B'] > 0) {
    return 'B';
  }
  return 'A';
}; 