import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, Fade } from '@mui/material';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { calculateFinalClass } from '../services/energyClassService';
import { useAssessment } from '../contexts/AssessmentContext';
import { useCategories } from '../contexts/CategoryContext';
import { useProjects } from '../contexts/ProjectContext';

interface FinalClassDisplayProps {
  projectId: string;
  project?: any;  // Ajout de la prop project optionnelle
}

const FinalClassDisplay: React.FC<FinalClassDisplayProps> = ({ projectId, project: propProject }) => {
  const { getAssessment } = useAssessment();
  const { categories } = useCategories();
  const { projects } = useProjects();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Utiliser le projet passé en prop s'il existe, sinon chercher dans le contexte
  const project = propProject || projects.find(p => p.id === projectId);
  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const assessment = getAssessment(projectId);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  if (!project) return null;

  return (
    <Fade in timeout={500}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2,
          mb: 2,
          backgroundColor: finalClass !== 'NA' ? getClassColor(finalClass) : 'background.paper',
          color: finalClass !== 'NA' ? getClassTextColor(finalClass) : 'text.primary',
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
              {project.clientName}
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
              {finalClass}
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
              Classe finale
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default FinalClassDisplay; 