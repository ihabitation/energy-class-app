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
        elevation={2} 
        sx={{ 
          p: 2,
          mb: 2,
          backgroundColor: categoryClass !== 'NA' ? getClassColor(categoryClass) : 'background.paper',
          color: categoryClass !== 'NA' ? getClassTextColor(categoryClass) : 'text.primary',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h6" 
              component="h1"
              sx={{
                fontSize: '2.5rem',
                fontWeight: 700,
                mb: 0.5,
                lineHeight: 1
              }}
            >
              {project.name}
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.9rem',
                mt: 1
              }}
            >
              {category.name}
            </Typography>
          </Box>
          <Box sx={{ 
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2.5rem',
                lineHeight: 1,
                mb: 0.5
              }}
            >
              {categoryClass}
            </Typography>
            <Typography 
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
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