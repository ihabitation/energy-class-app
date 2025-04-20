import React, { useState } from 'react';
import { Grid, Typography, Box, Tooltip, Paper, Card, CardContent, CardActionArea, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { SubCategory } from '../types/energyClass';
import { getClassColor, getClassTextColor } from '../utils/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAssessment } from '../contexts/AssessmentContext';
import { useNavigate } from 'react-router-dom';

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
        full: `${classData.description}\n\nImpact : ${classData.impact}`
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
    <Box>
      <Paper 
        elevation={2} 
        sx={{ 
          p: isMobile ? 1.5 : 3, 
          mb: isMobile ? 2 : 3,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{
            fontWeight: 600,
            color: theme => theme.palette.primary.main,
            pb: 1,
            borderBottom: '2px solid',
            borderColor: theme => theme.palette.divider,
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {options?.find(opt => opt.id === subCategoryId)?.name}
        </Typography>
        <Typography 
          variant="body1" 
          paragraph
          sx={{
            display: isMobile ? '-webkit-box' : 'block',
            WebkitLineClamp: isMobile ? 2 : 'none',
            WebkitBoxOrient: 'vertical',
            overflow: isMobile ? 'hidden' : 'visible',
            mb: isMobile ? 1 : 2,
            color: theme => theme.palette.text.secondary
          }}
        >
          {options?.find(opt => opt.id === subCategoryId)?.description}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}
        >
          {isMobile ? "Appuyez une fois pour voir les détails, deux fois pour sélectionner" : "Survolez les classes pour plus de détails"}
        </Typography>
      </Paper>

      <Grid container spacing={isMobile ? 1.5 : 2}>
        {availableClasses.map((energyClass) => {
          const description = getClassDescription(energyClass);
          const isSelected = classType === energyClass;
          const isDetailSelected = selectedDetail?.class === energyClass;
          
          const cardContent = (
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                position: 'relative',
                pt: isMobile ? 1.5 : 2,
                pb: isMobile ? 1 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Typography 
                  variant={isMobile ? "h4" : "h2"}
                  component="div" 
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1
                  }}
                >
                  {energyClass}
                </Typography>
                {isSelected && (
                  <CheckCircleIcon 
                    sx={{ 
                      fontSize: isMobile ? '1.25rem' : '2rem',
                      color: theme => theme.palette.primary.main,
                      position: 'absolute',
                      top: isMobile ? 4 : 4,
                      right: isMobile ? 4 : 4
                    }} 
                  />
                )}
              </Box>
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                p: isMobile ? 1 : 2,
                pt: 0
              }}>
                <Typography 
                  variant="body2"
                  align="center"
                  sx={{
                    width: '100%',
                    opacity: 0.9,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    display: isMobile ? 'block' : '-webkit-box',
                    WebkitLineClamp: isMobile ? 'none' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: isMobile ? 'visible' : 'hidden',
                    whiteSpace: isMobile ? 'normal' : 'pre-line'
                  }}
                >
                  {description.short}
                </Typography>
              </Box>
            </Box>
          );
          
          return (
            <Grid item xs={6} sm={4} md={2.4} key={energyClass}>
              {!isMobile ? (
                <Tooltip
                  title={description.full}
                  placement="top"
                  arrow
                  enterDelay={200}
                  leaveDelay={200}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      minHeight: '140px',
                      backgroundColor: getClassColor(energyClass),
                      color: getClassTextColor(energyClass),
                      transition: 'all 0.2s',
                      position: 'relative',
                      border: isSelected ? '2px solid' : 'none',
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
                      onClick={() => handleClassClick(energyClass)}
                      sx={{ height: '100%' }}
                    >
                      {cardContent}
                    </CardActionArea>
                  </Card>
                </Tooltip>
              ) : (
                <Card 
                  sx={{ 
                    height: '100%',
                    minHeight: '120px',
                    backgroundColor: getClassColor(energyClass),
                    color: getClassTextColor(energyClass),
                    transition: 'all 0.2s',
                    position: 'relative',
                    border: isSelected || isDetailSelected ? '2px solid' : 'none',
                    borderColor: theme => theme.palette.primary.main,
                    transform: (isSelected || isDetailSelected) ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleClassClick(energyClass)}
                    sx={{ height: '100%' }}
                  >
                    {cardContent}
                  </CardActionArea>
                </Card>
              )}
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog pour afficher les détails sur mobile */}
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
          <Typography>
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