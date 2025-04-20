import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { calculateFinalClass } from '../services/energyClassService';
import { useAssessment } from '../contexts/AssessmentContext';
import { useCategories } from '../contexts/CategoryContext';

const FinalClassDisplay: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { getAssessment } = useAssessment();
  const { categories } = useCategories();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const assessment = getAssessment(projectId);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: isMobile ? 1.5 : 3, 
        mb: isMobile ? 2 : 3,
        backgroundColor: getClassColor(finalClass),
        color: getClassTextColor(finalClass),
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isMobile ? '120px' : '160px'
      }}
    >
      <Typography 
        variant={isMobile ? "h6" : "h4"} 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 'medium',
          mb: isMobile ? 1 : 2
        }}
      >
        Classe énergétique finale
      </Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: isMobile ? 1 : 2
        }}
      >
        <Typography 
          variant={isMobile ? "h2" : "h1"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: isMobile ? '3rem' : '4rem',
            lineHeight: 1
          }}
        >
          {finalClass}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FinalClassDisplay; 