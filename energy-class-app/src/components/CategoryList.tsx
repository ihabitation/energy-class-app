import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemButton, Typography, Box, LinearProgress, Button, useTheme, useMediaQuery } from '@mui/material';
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
      percentage: totalSubCategories > 0 ? (completedSubCategories / totalSubCategories) * 100 : 0
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
        fontSize: '2rem',
        color: 'primary.main',
        mr: 2
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
    <List>
      {localCategories.map((category) => {
        const progress = getCategoryProgress(category.id);
        const worstClass = getWorstClassInCategory(category.id);
        return (
          <ListItem
            key={category.id}
            secondaryAction={
              <Button
                variant="contained"
                onClick={() => handleToggle(category.id)}
                sx={{
                  minWidth: isMobile ? '90px' : '120px',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  backgroundColor: category.isEnabled ? 'success.main' : 'error.main',
                  '&:hover': {
                    backgroundColor: category.isEnabled ? 'success.dark' : 'error.dark',
                  },
                  position: 'absolute',
                  right: isMobile ? 1 : 2,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
                startIcon={category.isEnabled ? <PowerIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> : <PowerSettingsNewIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
              >
                {category.isEnabled ? 'Activée' : 'Désactivée'}
              </Button>
            }
            disablePadding
            sx={{ position: 'relative', pr: isMobile ? 8 : 10 }}
          >
            <ListItemButton
              component={Link}
              to={`/projects/${projectId}/category/${category.id}`}
              disabled={!category.isEnabled}
              sx={{
                backgroundColor: category.isEnabled ? 'transparent' : '#f5f5f5',
                '&:hover': {
                  backgroundColor: category.isEnabled ? 'rgba(0, 0, 0, 0.04)' : '#f5f5f5',
                },
                width: '100%',
                pr: isMobile ? 8 : 10
              }}
            >
              {getIcon(category.id)}
              <Box sx={{ 
                flex: 1, 
                ml: isMobile ? 1 : 2,
                maxWidth: 'calc(100% - 120px)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  mb: 0.5
                }}>
                  <Typography variant={isMobile ? "body1" : "subtitle1"}>
                    {category.name}
                  </Typography>
                  {category.isEnabled && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {progress.percentage}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ({worstClass})
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    pr: 1
                  }}
                >
                  {category.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress.percentage}
                    color={progress.percentage === 100 ? "success" : "primary"}
                    sx={{ height: isMobile ? 6 : 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default CategoryList; 