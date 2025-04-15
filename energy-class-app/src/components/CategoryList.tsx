import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemButton, Switch, Typography, Box, LinearProgress, Chip } from '@mui/material';
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

interface CategoryListProps {
  assessment: BuildingAssessment;
  projectId: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ assessment, projectId }) => {
  const { categories, toggleCategory } = useCategories();

  const getCategoryProgress = (categoryId: string) => {
    const subCategories = getSubCategories(categoryId);
    const completedSubCategories = subCategories.filter(subCat => {
      const selectedClass = assessment[subCat.id]?.selectedClass;
      return selectedClass !== undefined;
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
      .map(subCat => assessment[subCat.id]?.selectedClass)
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

  return (
    <List>
      {categories.map((category) => {
        const progress = getCategoryProgress(category.id);
        const worstClass = getWorstClassInCategory(category.id);
        return (
          <ListItem
            key={category.id}
            secondaryAction={
              <Switch
                edge="end"
                checked={category.isEnabled}
                onChange={() => toggleCategory(category.id, projectId)}
              />
            }
            disablePadding
          >
            <ListItemButton
              component={Link}
              to={`/projects/${projectId}/category/${category.id}`}
              disabled={!category.isEnabled}
              sx={{
                backgroundColor: category.isEnabled ? 'transparent' : '#f5f5f5',
                '&:hover': {
                  backgroundColor: category.isEnabled ? 'rgba(0, 0, 0, 0.04)' : '#f5f5f5',
                }
              }}
            >
              {getIcon(category.id)}
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      {category.name}
                    </Typography>
                    {category.isEnabled && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                          {progress.percentage}%
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                          ({worstClass})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {category.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress.percentage}
                        color={progress.percentage === 100 ? "success" : "primary"}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      component="div"
                      sx={{ color: category.isEnabled ? 'success.main' : 'error.main' }}
                    >
                      {category.isEnabled ? 'Activée' : 'Désactivée'}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default CategoryList; 