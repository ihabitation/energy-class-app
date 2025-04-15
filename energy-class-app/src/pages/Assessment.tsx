import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useParams } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';

const Assessment: React.FC = () => {
  const { categories, toggleCategory } = useCategories();
  const { getAssessment } = useAssessment();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === projectId);
  const assessment = projectId ? getAssessment(projectId) : {};

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
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: finalClass !== 'NA' ? getClassColor(finalClass) : 'background.paper',
          color: finalClass !== 'NA' ? getClassTextColor(finalClass) : 'text.primary'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Typography variant="subtitle1">
              Évaluation énergétique
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
              {finalClass}
            </Typography>
            <Typography variant="subtitle2">
              Classe finale
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <CategoryList
          assessment={assessment}
          projectId={projectId}
        />
      </Box>
    </Container>
  );
};

export default Assessment; 