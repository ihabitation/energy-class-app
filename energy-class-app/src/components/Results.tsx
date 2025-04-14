import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { BuildingAssessment } from '../types/energyClass';

interface ResultsProps {
  assessment: BuildingAssessment;
  finalClass: 'A' | 'B' | 'C' | 'D';
  enabledCategories: string[];
}

const Results: React.FC<ResultsProps> = ({ assessment, finalClass, enabledCategories }) => {
  const navigate = useNavigate();

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
      <Typography variant="h4" gutterBottom align="center">
        Résultats de l'évaluation
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Classe énergétique finale
        </Typography>
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: getClassColor(finalClass),
            fontWeight: 'bold',
            my: 4
          }}
        >
          {finalClass}
        </Typography>
        <Typography variant="body1" paragraph>
          Selon la norme EN ISO 52120-1, la classe énergétique finale est déterminée par la classe la plus basse parmi les catégories activées. La classe D représente le niveau le plus bas (le moins performant), tandis que la classe A représente le niveau le plus élevé (le plus performant).
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Détail des évaluations
        </Typography>
        <List>
          {Object.entries(assessment).map(([subCategoryId, { selectedClass, selectedOption }]) => {
            const categoryId = subCategoryId.split('.')[0];
            if (!enabledCategories.includes(categoryId)) return null;

            return (
              <React.Fragment key={subCategoryId}>
                <ListItem>
                  <ListItemText
                    primary={subCategoryId}
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color={getClassColor(selectedClass)}
                          component="span"
                        >
                          Classe : {selectedClass}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Option sélectionnée : {selectedOption}
                        </Typography>
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