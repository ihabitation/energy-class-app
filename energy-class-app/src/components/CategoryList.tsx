import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemButton, Typography, Box, LinearProgress, Button, useTheme, useMediaQuery, Paper, Chip } from '@mui/material';
import { Category } from '../types/energyClass';
import { getSubCategories } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BlindsIcon from '@mui/icons-material/Blinds';
import RouterIcon from '@mui/icons-material/Router';
import { BuildingAssessment } from '../types/energyClass';
import { useCategories } from '../contexts/CategoryContext';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PowerIcon from '@mui/icons-material/Power';
import { alpha } from '@mui/material/styles';

interface CategoryListProps {
  assessment: BuildingAssessment;
  projectId: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ assessment, projectId }) => {
  const { categories, toggleCategory, isLoading } = useCategories();
  const [localCategories, setLocalCategories] = React.useState(categories);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    console.log('Mise à jour des catégories locales:', categories.map(c => ({
      id: c.id,
      isEnabled: c.isEnabled
    })));
    setLocalCategories(categories);
  }, [categories]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const getCategoryProgress = (categoryId: string) => {
    const subCategories = getSubCategories(categoryId);
    const completedSubCategories = subCategories.filter(subCat => {
      const classType = assessment[subCat.id]?.classType;
      return classType !== undefined;
    }).length;
    const totalSubCategories = subCategories.length;
    return {
      completed: completedSubCategories,
      total: totalSubCategories,
      percentage: totalSubCategories > 0 ? Math.round((completedSubCategories / totalSubCategories) * 100) : 0
    };
  };

  const getWorstClassInCategory = (categoryId: string): 'A' | 'B' | 'C' | 'D' | 'NA' => {
    const subCategories = getSubCategories(categoryId);
    const classes = subCategories
      .map(subCat => assessment[subCat.id]?.classType)
      .filter((classType): classType is 'A' | 'B' | 'C' | 'D' => 
        classType !== undefined && ['A', 'B', 'C', 'D'].includes(classType)
      );
    
    if (classes.length === 0) return 'NA';
    
    const classValues = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    return classes.reduce((worst, current) => 
      classValues[current] > classValues[worst] ? current : worst
    );
  };

  const getIcon = (categoryId: string) => {
    const iconProps = { 
      sx: { 
        fontSize: isMobile ? '1.5rem' : '1.75rem',
        color: 'primary.main',
        mb: 1
      }
    };

    switch (categoryId) {
      case 'chauffage':
        return <WhatshotIcon {...iconProps} />;
      case 'ecs':
        return <OpacityIcon {...iconProps} />;
      case 'refroidissement':
        return <AcUnitIcon {...iconProps} />;
      case 'ventilation':
        return <AirIcon {...iconProps} />;
      case 'eclairage':
        return <LightbulbIcon {...iconProps} />;
      case 'stores':
        return <BlindsIcon {...iconProps} />;
      case 'gtb':
        return <RouterIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const handleToggle = async (categoryId: string) => {
    try {
      console.log('Toggle de la catégorie:', categoryId);
      const category = localCategories.find(c => c.id === categoryId);
      console.log('État actuel:', category?.isEnabled);
      
      // Mise à jour locale immédiate
      setLocalCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, isEnabled: !cat.isEnabled } : cat
      ));
      
      await toggleCategory(categoryId, projectId);
    } catch (error) {
      console.error('Erreur lors du toggle de la catégorie:', error);
      // En cas d'erreur, on revient à l'état précédent
      setLocalCategories(categories);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {localCategories.map((category) => {
        const progress = getCategoryProgress(category.id);
        const worstClass = getWorstClassInCategory(category.id);
        const subCategories = getSubCategories(category.id);
        const backgroundColor = worstClass !== 'NA' && category.isEnabled
          ? alpha(getClassColor(worstClass), 0.08)
          : 'transparent';

        return (
          <Paper
            key={category.id}
            elevation={1}
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              opacity: category.isEnabled ? 1 : 0.7,
              backgroundColor,
              '&:hover': category.isEnabled ? {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[2]
              } : {}
            }}
          >
            <Box
              component={Link}
              to={category.isEnabled ? `/projects/${projectId}/category/${category.id}` : '#'}
              sx={{
                display: 'flex',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: category.isEnabled ? 'transparent' : 'action.hover',
                position: 'relative',
                p: 2
              }}
            >
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mr: 2
              }}>
                {getIcon(category.id)}
                <Chip
                  label={worstClass}
                  size="small"
                  sx={worstClass !== 'NA' ? {
                    backgroundColor: getClassColor(worstClass),
                    color: getClassTextColor(worstClass),
                    fontWeight: 600,
                    minWidth: '45px'
                  } : {
                    backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              
              <Box sx={{ flex: 1, mr: isMobile ? 11 : 14 }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 500,
                      color: category.isEnabled ? 'text.primary' : 'text.secondary'
                    }}
                  >
                    {category.name}
                  </Typography>
                  {category.isEnabled && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}
                    >
                      {progress.completed} / {progress.total} évaluées
                    </Typography>
                  )}
                </Box>

                {category.isEnabled && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progress.percentage === 100 
                            ? theme.palette.success.main 
                            : theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  handleToggle(category.id);
                }}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  minWidth: 'auto',
                  px: 2,
                  backgroundColor: category.isEnabled ? 'success.main' : 'error.main',
                  '&:hover': {
                    backgroundColor: category.isEnabled ? 'success.dark' : 'error.dark',
                  }
                }}
                startIcon={
                  category.isEnabled 
                    ? <PowerIcon sx={{ fontSize: '1.25rem' }} /> 
                    : <PowerSettingsNewIcon sx={{ fontSize: '1.25rem' }} />
                }
              >
                {category.isEnabled ? 'ON' : 'OFF'}
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default CategoryList; 