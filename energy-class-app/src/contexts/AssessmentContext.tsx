import React, { createContext, useContext, useState } from 'react';
import { BuildingAssessment } from '../types/energyClass';

interface AssessmentContextType {
  assessment: BuildingAssessment;
  updateAssessment: (subCategoryId: string, selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessment, setAssessment] = useState<BuildingAssessment>({});

  const updateAssessment = (subCategoryId: string, selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => {
    setAssessment(prev => ({
      ...prev,
      [subCategoryId]: {
        selectedClass,
        selectedOption
      }
    }));
  };

  return (
    <AssessmentContext.Provider value={{ assessment, updateAssessment }}>
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