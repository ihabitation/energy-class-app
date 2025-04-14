import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import SubCategoryList from '../components/SubCategoryList';
import FinalClassDisplay from '../components/FinalClassDisplay';

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Retour à l'accueil
        </Button>
        <FinalClassDisplay />
        <SubCategoryList />
      </Box>
    </Container>
  );
};

export default CategoryDetail; 