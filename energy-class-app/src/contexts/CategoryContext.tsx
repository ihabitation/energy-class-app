import React, { createContext, useContext, useState } from 'react';
import { Category } from '../types/energyClass';
import { getCategories } from '../services/energyClassService';

interface CategoryContextType {
  categories: Category[];
  toggleCategory: (categoryId: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(getCategories());

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, isEnabled: !category.isEnabled }
          : category
      )
    );
  };

  return (
    <CategoryContext.Provider value={{ categories, toggleCategory }}>
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