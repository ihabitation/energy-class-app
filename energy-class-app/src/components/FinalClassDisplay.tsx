import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { calculateFinalClass } from '../services/energyClassService';
import { useAssessment } from '../contexts/AssessmentContext';
import { useCategories } from '../contexts/CategoryContext';

const FinalClassDisplay: React.FC = () => {
  const { assessment } = useAssessment();
  const { categories } = useCategories();
  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: getClassColor(finalClass),
        color: getClassTextColor(finalClass),
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Classe énergétique finale
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Typography variant="h1" component="div" sx={{ fontWeight: 'bold' }}>
          {finalClass}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FinalClassDisplay; 