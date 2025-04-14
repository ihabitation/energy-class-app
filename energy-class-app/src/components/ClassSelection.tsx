import React from 'react';
import { Grid, Typography, Box, Tooltip, Paper, Card, CardContent, CardActionArea, useTheme, useMediaQuery } from '@mui/material';
import { SubCategory } from '../types/energyClass';
import { getClassColor, getClassTextColor } from '../utils/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAssessment } from '../contexts/AssessmentContext';

interface ClassSelectionProps {
  subCategory: SubCategory;
  onClassSelection: (selectedClass: 'A' | 'B' | 'C' | 'D' | 'NA', selectedOption: string) => void;
}

const ClassSelection: React.FC<ClassSelectionProps> = ({ subCategory, onClassSelection }) => {
  const { assessment } = useAssessment();
  const selectedClass = assessment[subCategory.id]?.selectedClass;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filtrer les classes disponibles en fonction des options de la sous-catégorie
  const availableClasses = ['A', 'B', 'C', 'D', 'NA'].filter(classType => {
    if (classType === 'NA') return true; // Toujours garder l'option NA
    return subCategory.options?.some(opt => opt.class === classType);
  }) as ('A' | 'B' | 'C' | 'D' | 'NA')[];

  const getClassDescription = (energyClass: typeof availableClasses[number]) => {
    const classData = subCategory.options?.find(opt => opt.class === energyClass);
    if (classData) {
      return {
        short: classData.description.split('.')[0] + '.',
        full: `${classData.description}\n\nImpact : ${classData.impact}`
      };
    }
    return {
      short: 'Non applicable',
      full: 'Cette fonction n\'est pas présente dans le bâtiment'
    };
  };

  return (
    <Box>
      <Paper 
        elevation={2} 
        sx={{ 
          p: isMobile ? 2 : 3, 
          mb: 3,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
          {subCategory.name}
        </Typography>
        <Typography variant="body1" paragraph>
          {subCategory.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isMobile ? "Appuyez sur les classes pour plus de détails" : "Survolez les classes pour plus de détails"}
        </Typography>
      </Paper>

      <Grid container spacing={isMobile ? 1 : 2}>
        {availableClasses.map((energyClass) => {
          const description = getClassDescription(energyClass);
          const isSelected = selectedClass === energyClass;
          return (
            <Grid item xs={6} sm={6} md={4} key={energyClass}>
              <Tooltip
                title={description.full}
                placement={isMobile ? "bottom" : "top"}
                arrow
                enterDelay={isMobile ? 0 : 200}
                leaveDelay={isMobile ? 0 : 200}
                enterTouchDelay={0}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    backgroundColor: getClassColor(energyClass),
                    color: getClassTextColor(energyClass),
                    transition: 'all 0.2s',
                    position: 'relative',
                    border: isSelected ? '3px solid' : 'none',
                    borderColor: isSelected ? theme => theme.palette.primary.main : 'transparent',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      backgroundColor: getClassColor(energyClass),
                      opacity: 0.9,
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => onClassSelection(energyClass, '')}
                    sx={{ height: '100%', p: isMobile ? 1 : 2 }}
                  >
                    <CardContent sx={{ p: isMobile ? 1 : 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 1,
                        position: 'relative'
                      }}>
                        <Typography 
                          variant={isMobile ? "h4" : "h3"} 
                          component="div" 
                          gutterBottom={!isMobile} 
                          align="center"
                        >
                          {energyClass}
                        </Typography>
                        {isSelected && (
                          <CheckCircleIcon 
                            sx={{ 
                              fontSize: isMobile ? '1.5rem' : '2rem',
                              color: theme => theme.palette.primary.main,
                              position: 'absolute',
                              top: isMobile ? 4 : 8,
                              right: isMobile ? 4 : 8
                            }} 
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: isMobile ? '0.75rem' : 'inherit',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {description.short}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ClassSelection; 