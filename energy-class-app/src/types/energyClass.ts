export interface EnergyClass {
  [key: string]: {
    description: string;
    sous_categories: {
      [key: string]: {
        description: string;
        classes: {
          [key: string]: {
            [key: string]: {
              description: string;
              impact: string;
              images?: string[];
            };
          };
        };
      };
    };
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  details?: string;
  options?: {
    id: string;
    name: string;
    description: string;
    impact: string;
    class: 'A' | 'B' | 'C' | 'D' | 'NA';
  }[];
}

export interface ClassOption {
  id: string;
  name: string;
  description: string;
  impact: string;
  images?: string[];
  subCategoryId?: string;
  classType: 'A' | 'B' | 'C' | 'D' | 'NA';
}

export interface BuildingAssessment {
  [key: string]: {
    selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA';
    selectedOption: string;
  };
} 