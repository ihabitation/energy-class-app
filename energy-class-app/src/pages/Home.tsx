import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CategoryList from '../components/CategoryList';
import FinalClassDisplay from '../components/FinalClassDisplay';
import { useAssessment } from '../contexts/AssessmentContext';
import { useCategories } from '../contexts/CategoryContext';

const Home: React.FC = () => {
  const { assessment } = useAssessment();
  const { categories, toggleCategory } = useCategories();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Évaluation de la performance énergétique
        </Typography>
        <Typography variant="body1" paragraph>
          Sélectionnez les catégories à évaluer pour déterminer la classe énergétique de votre bâtiment.
        </Typography>
        <FinalClassDisplay />
        <CategoryList 
          categories={categories}
          onCategoryToggle={toggleCategory}
          assessment={assessment}
        />
      </Box>
    </Container>
  );
};

export default Home; 