import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass } from '../services/energyClassService';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FinalClassDisplay from '../components/FinalClassDisplay';

const Assessment: React.FC = () => {
  const { categories } = useCategories();
  const { getAssessment, updateGlobalResults } = useAssessment();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const assessment = projectId ? getAssessment(projectId) : {};
  const navigate = useNavigate();

  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);

  useEffect(() => {
    if (projectId && enabledCategories.length > 0) {
      updateGlobalResults(projectId, enabledCategories);
    }
  }, [projectId, enabledCategories.join(','), assessment]);

  if (!projectId || !project) {
    return (
      <Container>
        <Typography color="error">Projet non trouvé</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects/' + projectId)}
          sx={{ 
            alignSelf: 'flex-start',
            color: 'primary.main',
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          RETOUR AU PROJET
        </Button>

        <FinalClassDisplay projectId={projectId} />

        <Typography
          variant="h2"
          sx={{
            fontSize: '2rem',
            fontWeight: 'normal'
          }}
        >
          Catégories à évaluer
        </Typography>

        <CategoryList
          projectId={projectId}
          assessment={assessment}
        />
      </Box>
    </Container>
  );
};

export default Assessment; 