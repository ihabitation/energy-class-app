import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import ClassSelection from '../components/ClassSelection';
import { getSubCategories } from '../services/energyClassService';
import { useProjects } from '../contexts/ProjectContext';
import { useNavigation } from '../contexts/NavigationContext';

const SubCategoryDetail: React.FC = () => {
  const { projectId, categoryId, subCategoryId } = useParams<{
    projectId: string;
    categoryId: string;
    subCategoryId: string;
  }>();
  const { projects } = useProjects();
  const navigation = useNavigation();

  const currentProject = projects.find(p => p.id === projectId);
  const subCategory = getSubCategories(categoryId || '').find(
    sub => sub.id === subCategoryId
  );

  if (!subCategory || !currentProject) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 2 }}>
          {!subCategory ? 'Sous-catégorie non trouvée' : 'Projet non trouvé'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {subCategory.name}
        </Typography>

        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Projet : {currentProject.name}
        </Typography>

        <Typography variant="body1" paragraph>
          {subCategory.description}
        </Typography>

        <ClassSelection
          subCategoryId={subCategoryId || ''}
          options={subCategory?.options || []}
          projectId={projectId || ''}
        />
      </Box>
    </Container>
  );
};

export default SubCategoryDetail; 