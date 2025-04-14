import React from 'react';
import { List, Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import SubCategoryListItem from './SubCategoryListItem';
import { useAssessment } from '../contexts/AssessmentContext';
import { getSubCategories } from '../services/energyClassService';

const SubCategoryList: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { assessment } = useAssessment();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const subCategories = getSubCategories(categoryId || '');

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 1 : 2 }}>
      <List sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1.5
      }}>
        {subCategories.map((subCategory) => (
          <SubCategoryListItem
            key={subCategory.id}
            subCategory={subCategory}
            selectedClass={assessment[subCategory.id]?.selectedClass}
            selectedOption={assessment[subCategory.id]?.selectedOption}
            categoryId={categoryId || ''}
          />
        ))}
      </List>
    </Container>
  );
};

export default SubCategoryList; 