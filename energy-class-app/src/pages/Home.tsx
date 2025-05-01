import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryList from '../components/CategoryList';
import FinalClassDisplay from '../components/FinalClassDisplay';
import { useProjects } from '../contexts/ProjectContext';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';

const Home: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { categories, toggleCategory } = useCategories();
  const { getAssessment } = useAssessment();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCategoryToggle = (categoryId: string) => {
    if (projectId) {
      toggleCategory(categoryId, projectId);
    }
  };

  const currentProject = projects.find(p => p.id === projectId);

  if (!currentProject) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 2 }}>
          Projet non trouvé
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {!isMobile && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/projects/${projectId}`)}
          sx={{ mb: 2 }}
        >
          Retour au projet
        </Button>
        )}

        <FinalClassDisplay projectId={projectId || ''} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Catégories à évaluer
        </Typography>

        <CategoryList
          projectId={projectId || ''}
          assessment={projectId ? getAssessment(projectId) : {}}
        />
      </Box>
    </Container>
  );
};

export default Home; 