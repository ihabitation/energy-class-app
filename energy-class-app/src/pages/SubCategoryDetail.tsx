import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAssessment } from '../contexts/AssessmentContext';
import { getSubCategories } from '../services/energyClassService';
import ClassSelection from '../components/ClassSelection';
import { SubCategory } from '../types/energyClass';

const SubCategoryDetail: React.FC = () => {
  const { categoryId, subCategoryId } = useParams<{ categoryId: string; subCategoryId: string }>();
  const { updateAssessment } = useAssessment();
  const subCategories = getSubCategories(categoryId || '');
  const subCategory = subCategories.find(sc => sc.id === subCategoryId);

  const handleClassSelection = (selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => {
    if (subCategoryId) {
      updateAssessment(subCategoryId, selectedClass, selectedOption);
    }
  };

  if (!subCategory) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" color="error">
            Sous-catégorie non trouvée
          </Typography>
          <Button
            component={Link}
            to={`/category/${categoryId}`}
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Retour à la catégorie
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button
          component={Link}
          to={`/category/${categoryId}`}
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Retour à la catégorie
        </Button>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              {subCategory.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {subCategory.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <ClassSelection
              subCategory={subCategory}
              onClassSelection={handleClassSelection}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SubCategoryDetail; 