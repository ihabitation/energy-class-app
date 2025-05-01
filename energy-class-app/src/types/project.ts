export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName: string;
  user_id: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'in_progress' | 'completed';
  assessments: {
    [categoryId: string]: {
      [subCategoryId: string]: {
        selectedClass: string;
        selectedOption: string;
        notes?: string;
        lastUpdated: Date;
      };
    };
  };
  metadata: {
    buildingType: string;
    constructionYear?: number;
    totalArea?: number;
    floors?: number;
    lastRenovation?: Date;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  status: Project['status'];
  createdAt: Date;
  progress: number; // Pourcentage de complétion
  worstClass: 'A' | 'B' | 'C' | 'D' | 'NA'; // Pire classe énergétique du projet
}

export type ProjectStatus = Project['status'];

export interface ProjectFilters {
  status?: ProjectStatus;
  clientName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  buildingType?: string;
} 