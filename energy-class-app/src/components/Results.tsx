import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Paper, List, ListItem, ListItemText, Divider, useTheme, useMediaQuery } from '@mui/material';
import { BuildingAssessment } from '../types/energyClass';

interface ResultsProps {
  assessment: BuildingAssessment;
  finalClass: 'A' | 'B' | 'C' | 'D';
  enabledCategories: string[];
}

const Results: React.FC<ResultsProps> = ({ assessment, finalClass, enabledCategories }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getClassColor = (classType: 'A' | 'B' | 'C' | 'D' | 'NA') => {
    switch (classType) {
      case 'A':
        return 'success.main';
      case 'B':
        return 'info.main';
      case 'C':
        return 'warning.main';
      case 'D':
        return 'error.main';
      case 'NA':
        return 'text.secondary';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        align="center"
        sx={{ mb: isMobile ? 2 : 3 }}
      >
        Résultats de l'évaluation
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 2 : 3, 
          mb: isMobile ? 3 : 4 
        }}
      >
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom
        >
          Classe énergétique finale
        </Typography>
        <Typography
          variant={isMobile ? "h3" : "h2"}
          align="center"
          sx={{
            color: getClassColor(finalClass),
            fontWeight: 'bold',
            my: isMobile ? 2 : 4
          }}
        >
          {finalClass}
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          Selon la norme EN ISO 52120-1, la classe énergétique finale est déterminée par la classe la plus basse parmi les catégories activées. La classe D représente le niveau le plus bas (le moins performant), tandis que la classe A représente le niveau le plus élevé (le plus performant).
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom
        >
          Détails par catégorie
        </Typography>
        <List>
          {Object.entries(assessment).map(([subCategoryId, { classType, selectedOption }]) => {
            if (!enabledCategories.includes(subCategoryId.split('.')[0])) return null;
            return (
              <React.Fragment key={subCategoryId}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography 
                        variant={isMobile ? "body1" : "subtitle1"}
                        sx={{ fontWeight: 'medium' }}
                      >
                        {subCategoryId}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                        >
                          Classe : {classType}
                        </Typography>
                        {selectedOption && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                          >
                            Option : {selectedOption}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Retour à la liste des catégories
        </Button>
      </Box>
    </Box>
  );
};

export default Results; 