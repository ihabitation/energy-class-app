import React, { useState } from 'react';
import { Grid, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardActionArea, useTheme, useMediaQuery, Tooltip, Paper } from '@mui/material';
import { SubCategory } from '../types/energyClass';
import { getClassColor, getClassTextColor } from '../utils/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAssessment } from '../contexts/AssessmentContext';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types/project';

interface ClassSelectionProps {
  subCategoryId: string;
  projectId: string;
  options: {
    id: string;
    name: string;
    description: string;
    impact: string;
    class: 'A' | 'B' | 'C' | 'D' | 'NA';
  }[];
}

const ClassSelection: React.FC<ClassSelectionProps> = ({
  subCategoryId,
  projectId,
  options,
}) => {
  const { getAssessment, updateAssessment } = useAssessment();
  const assessment = getAssessment(projectId);
  const classType = assessment[subCategoryId]?.classType;
  const selectedOption = assessment[subCategoryId]?.selectedOption;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // État pour gérer le détail sur mobile
  const [selectedDetail, setSelectedDetail] = useState<{
    class: 'A' | 'B' | 'C' | 'D' | 'NA';
    description: string;
  } | null>(null);

  // Récupérer le projet depuis le contexte
  const { projects } = useProjects();
  const project = projects.find(p => p.id === projectId);

  // Filtrer les classes disponibles en fonction des options de la sous-catégorie
  const availableClasses = ['NA', 'A', 'B', 'C', 'D'].filter(classType => {
    if (classType === 'NA') return true; // Toujours garder l'option NA
    return options?.some(opt => opt.class === classType);
  }) as ('A' | 'B' | 'C' | 'D' | 'NA')[];

  const getClassDescription = (energyClass: typeof availableClasses[number]) => {
    if (energyClass === 'NA') {
      return {
        short: 'Non applicable',
        full: 'Cette fonction n\'est pas présente dans le bâtiment'
      };
    }
    const classData = options?.find(opt => opt.class === energyClass);
    if (classData) {
      return {
        short: classData.description.split('.')[0] + '.',
        full: `${classData.description}\n\n\nImpact : ${classData.impact}`
      };
    }
    return {
      short: 'Non applicable',
      full: 'Cette sous-catégorie n\'est pas applicable à ce bâtiment'
    };
  };

  const handleClassSelection = async (energyClass: 'A' | 'B' | 'C' | 'D' | 'NA', optionId: string) => {
    try {
      const selectedOption = options.find(opt => opt.id === optionId)?.id || '';
      await updateAssessment(projectId, subCategoryId, energyClass, selectedOption);
      navigate(`/projects/${projectId}/category/${subCategoryId.split('.')[0]}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
      // Vous pourriez ajouter une notification d'erreur ici
    }
  };

  const handleClassClick = (energyClass: 'A' | 'B' | 'C' | 'D' | 'NA') => {
    if (isMobile) {
      const description = getClassDescription(energyClass);
      if (selectedDetail?.class === energyClass) {
        // Si on clique une deuxième fois sur la même classe, on la sélectionne
        handleClassSelection(energyClass, '');
        setSelectedDetail(null);
      } else {
        // Premier clic : on affiche le détail
        setSelectedDetail({
          class: energyClass,
          description: description.full
        });
      }
    } else {
      // Sur desktop, on sélectionne directement
      handleClassSelection(energyClass, '');
    }
  };

  const handleCloseDetail = () => {
    setSelectedDetail(null);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
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
          {options?.find(opt => opt.id === subCategoryId)?.name}
        </Typography>
      {options?.find(opt => opt.id === subCategoryId)?.description && (
        <Typography 
          variant="body1" 
          sx={{
            mb: 4,
            fontSize: '1rem',
            color: theme => theme.palette.text.secondary
          }}
        >
          {options?.find(opt => opt.id === subCategoryId)?.description}
        </Typography>
      )}

      <Grid container spacing={isMobile ? 2 : 3}>
        {availableClasses.map((energyClass) => {
          const description = getClassDescription(energyClass);
          const isSelected = classType === energyClass;
          const isDetailSelected = selectedDetail?.class === energyClass;
          
          return (
            <Grid item xs={6} sm={4} md={2.4} key={energyClass}>
              <Tooltip 
                title={
                  !isMobile ? (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Classe {energyClass}
                      </Typography>
                      <Typography sx={{ whiteSpace: 'pre-line' }}>
                        {description.full}
                      </Typography>
                    </Box>
                  ) : ''
                }
                placement="top"
                arrow
                enterDelay={200}
                leaveDelay={200}
                sx={{
                  maxWidth: '300px'
                }}
              >
                <Card 
                  sx={{ 
                    height: isMobile ? '140px' : '100%',
                    minHeight: isMobile ? 'auto' : '140px',
                    backgroundColor: getClassColor(energyClass),
                    color: getClassTextColor(energyClass),
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border 0.2s ease-in-out',
                    position: 'relative',
                    borderRadius: '12px',
                    border: (isSelected || isDetailSelected) ? `2px solid ${theme.palette.grey[900]}` : 'none',
                    transform: (isSelected || isDetailSelected) ? 'translateY(-2px)' : 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme => theme.shadows[4],
                      border: `2px solid ${theme.palette.grey[800]}`
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleClassClick(energyClass)}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
            <Box sx={{ 
              height: '100%',
                      width: '100%',
              display: 'flex',
                      flexDirection: 'column',
                      p: isMobile ? '16px' : 2,
                      justifyContent: 'space-between'
            }}>
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                        alignItems: 'center',
                        mb: isMobile ? 1 : 1
              }}>
                <Typography 
                  variant={isMobile ? "h4" : "h2"}
                  component="div" 
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                            lineHeight: 1,
                            color: '#FFFFFF',
                            textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {energyClass}
                </Typography>
                {isSelected && (
                  <CheckCircleIcon 
                    sx={{ 
                              fontSize: isMobile ? '1.5rem' : '2rem',
                              color: '#FFFFFF',
                      position: 'absolute',
                              top: 0,
                              right: 0
                    }} 
                  />
                )}
              </Box>
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                        minHeight: isMobile ? '60px' : '80px'
              }}>
                <Typography 
                  variant="body2"
                  align="center"
                  sx={{
                    width: '100%',
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            color: '#FFFFFF',
                            textShadow: '0px 1px 1px rgba(0,0,0,0.1)',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: isMobile ? 3 : 4,
                    WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            m: 0
                  }}
                >
                  {description.short}
                </Typography>
              </Box>
            </Box>
                  </CardActionArea>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={!!selectedDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Classe {selectedDetail?.class}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {selectedDetail?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Fermer</Button>
          <Button 
            onClick={() => {
              if (selectedDetail) {
                handleClassSelection(selectedDetail.class, '');
              }
              handleCloseDetail();
            }}
            variant="contained"
          >
            Sélectionner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassSelection; 