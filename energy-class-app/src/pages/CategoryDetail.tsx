import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SubCategoryList from '../components/SubCategoryList';
import { useAssessment } from '../contexts/AssessmentContext';
import { getSubCategories } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';

const CategoryDetail: React.FC = () => {
  const { projectId, categoryId } = useParams<{ projectId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { getAssessment } = useAssessment();
  const assessment = projectId ? getAssessment(projectId) : {};

  if (!projectId || !categoryId) {
    return (
      <Container>
        <Typography color="error">Paramètres manquants</Typography>
      </Container>
    );
  }

  // Calculer la classe finale de la catégorie
  const calculateCategoryClass = () => {
    const subCategories = getSubCategories(categoryId);
    const classes = subCategories
      .map(subCat => assessment[subCat.id]?.selectedClass)
      .filter((classType): classType is 'A' | 'B' | 'C' | 'D' => 
        classType !== undefined && ['A', 'B', 'C', 'D'].includes(classType)
      );
    
    if (classes.length === 0) return 'NA';
    
    const classValues = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    return classes.reduce((worst, current) => 
      classValues[current] > classValues[worst] ? current : worst
    );
  };

  const categoryClass = calculateCategoryClass();
  const subCategories = getSubCategories(categoryId);
  const completedCount = subCategories.filter(subCat => {
    const selectedClass = assessment[subCat.id]?.selectedClass;
    return selectedClass !== undefined;
  }).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/projects/${projectId}/assessment`)}
        sx={{ mb: 3 }}
      >
        Retour à l'évaluation
      </Button>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: categoryClass !== 'NA' ? getClassColor(categoryClass) : 'background.paper',
          color: categoryClass !== 'NA' ? getClassTextColor(categoryClass) : 'text.primary'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
            </Typography>
            <Typography variant="subtitle1">
              {completedCount} sur {subCategories.length} sous-catégories évaluées
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
              {categoryClass}
            </Typography>
            <Typography variant="subtitle2">
              Classe finale
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Sous-catégories
      </Typography>

      <SubCategoryList categoryId={categoryId} projectId={projectId} />
    </Container>
  );
};

export default CategoryDetail; 