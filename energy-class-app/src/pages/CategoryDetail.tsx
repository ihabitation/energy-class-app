import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, useTheme, useMediaQuery, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProjects } from '../contexts/ProjectContext';
import { useCategories } from '../contexts/CategoryContext';
import SubCategoryList from '../components/SubCategoryList';
import { getCategories, getSubCategories } from '../services/energyClassService';
import { Project } from '../types/project';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useAssessment } from '../contexts/AssessmentContext';

const CategoryDetail: React.FC = () => {
  const { projectId, categoryId } = useParams<{ projectId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { categories } = useCategories();
  const { getAssessment } = useAssessment();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!projectId || !categoryId) {
    return (
      <Container>
        <Typography variant="h5">ID de projet ou de catégorie manquant</Typography>
      </Container>
    );
  }

  const project = projects.find(p => p.id === projectId) as Project | undefined;
  const category = getCategories().find(c => c.id === categoryId);
  const assessment = projectId ? getAssessment(projectId) : {};

  // Calculer la classe finale de la catégorie
  const calculateCategoryClass = () => {
    if (!categoryId) return 'NA';
    
    const subCategories = getSubCategories(categoryId);
    const subCategoryClasses = subCategories.map(sub => assessment[sub.id]?.classType || 'NA');
    
    // Si toutes les sous-catégories sont NA, retourner NA
    if (subCategoryClasses.every(cls => cls === 'NA')) return 'NA';
    
    // Filtrer les NA et trouver la pire classe
    const validClasses = subCategoryClasses.filter(cls => cls !== 'NA');
    if (validClasses.length === 0) return 'NA';
    
    const classOrder = ['A', 'B', 'C', 'D'];
    return validClasses.reduce((worst, current) => {
      const worstIndex = classOrder.indexOf(worst);
      const currentIndex = classOrder.indexOf(current);
      return currentIndex > worstIndex ? current : worst;
    }, 'A');
  };

  const categoryClass = calculateCategoryClass();

  if (!project || !category) {
    return (
      <Container>
        <Typography variant="h5">Projet ou catégorie non trouvé</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {!isMobile && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/projects/${projectId}/assessment`)}
          sx={{ 
            mb: 4,
            color: 'primary.main',
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          RETOUR À L'ÉVALUATION
        </Button>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: getClassColor(categoryClass),
          color: getClassTextColor(categoryClass)
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem' },
                fontWeight: 'normal',
                color: 'inherit'
              }}
            >
              {project.name}
            </Typography>
            <Typography 
              variant="h5"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                fontWeight: 'medium',
                opacity: 0.9,
                color: 'inherit'
              }}
            >
              {category.name}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', sm: '3rem' }
              }}
            >
              {categoryClass}
            </Typography>
            <Typography variant="subtitle2">
              Classe catégorie
            </Typography>
          </Box>
        </Box>
      </Paper>

      <SubCategoryList categoryId={categoryId} projectId={projectId} />
    </Container>
  );
};

export default CategoryDetail; 