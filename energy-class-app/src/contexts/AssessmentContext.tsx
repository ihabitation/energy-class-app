import React, { createContext, useContext, useState } from 'react';
import { BuildingAssessment } from '../types/energyClass';

interface AssessmentContextType {
  getAssessment: (projectId: string) => BuildingAssessment;
  updateAssessment: (projectId: string, subCategoryId: string, selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessments, setAssessments] = useState<Record<string, BuildingAssessment>>({});

  const getAssessment = (projectId: string) => {
    return assessments[projectId] || {};
  };

  const updateAssessment = (
    projectId: string,
    subCategoryId: string,
    selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA',
    selectedOption: string
  ) => {
    setAssessments(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [subCategoryId]: {
          selectedClass,
          selectedOption
        }
      }
    }));
  };

  return (
    <AssessmentContext.Provider value={{ getAssessment, updateAssessment }}>
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