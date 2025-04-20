import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass } from '../services/energyClassService';
import { getClassColor } from '../utils/colors';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Assessment: React.FC = () => {
  const { categories } = useCategories();
  const { getAssessment } = useAssessment();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const assessment = projectId ? getAssessment(projectId) : {};
  const navigate = useNavigate();

  if (!projectId || !project) {
    return (
      <Container>
        <Typography color="error">Projet non trouvé</Typography>
      </Container>
    );
  }

  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects/' + projectId)}
        sx={{ 
          mb: 4,
          color: 'primary.main',
          textTransform: 'none',
          fontSize: '1rem'
        }}
      >
        RETOUR AU PROJET
      </Button>

      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '2.5rem',
            fontWeight: 'normal',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            textAlign: 'left',
            zIndex: 1,
            pl: 2,
            pt: 2
          }}
        >
          {project.name}
        </Typography>

        <Paper
          elevation={2}
          sx={{
            backgroundColor: getClassColor(finalClass),
            borderRadius: 2,
            pt: 8, // Espace pour le titre
            pb: 4,
            px: 3,
            mt: 3 // Décalage pour compenser le titre absolu
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 'normal'
              }}
            >
              Classe énergétique finale
            </Typography>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '4rem',
                lineHeight: 1
              }}
            >
              {finalClass}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Typography
        variant="h2"
        sx={{
          fontSize: '2rem',
          fontWeight: 'normal',
          mb: 3
        }}
      >
        Catégories à évaluer
      </Typography>

      <CategoryList
        assessment={assessment}
        projectId={projectId}
      />
    </Container>
  );
};

export default Assessment; 