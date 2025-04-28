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
        minHeight: isMobile ? '120px' : '160px',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        },
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Typography 
        variant={isMobile ? "h6" : "h4"} 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 'medium',
          mb: isMobile ? 1 : 2,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        Classe énergétique finale
      </Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: isMobile ? 1 : 2,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40%',
            height: '2px',
            backgroundColor: 'currentColor',
            opacity: 0.3,
          },
        }}
      >
        <Typography 
          variant={isMobile ? "h2" : "h1"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: isMobile ? '3rem' : '4rem',
            lineHeight: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            animation: 'scaleIn 0.5s ease-out',
            '@keyframes scaleIn': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 0,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          {finalClass}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FinalClassDisplay; 