import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { calculateFinalClass } from '../services/energyClassService';
import { useAssessment } from '../contexts/AssessmentContext';
import { useCategories } from '../contexts/CategoryContext';
import { useProjects } from '../contexts/ProjectContext';

const FinalClassDisplay: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { getAssessment } = useAssessment();
  const { categories } = useCategories();
  const { projects } = useProjects();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const project = projects.find(p => p.id === projectId);
  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const assessment = getAssessment(projectId);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  if (!project) return null;

  return (
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
            {project.clientName}
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
  );
};

export default FinalClassDisplay; 