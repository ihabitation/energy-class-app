import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Chip, LinearProgress, useTheme, useMediaQuery, Button } from '@mui/material';
import { useCategories } from '../contexts/CategoryContext';
import { getSubCategories } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useAssessment } from '../contexts/AssessmentContext';
import { alpha } from '@mui/material/styles';
import PowerIcon from '@mui/icons-material/Power';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

interface CategoryListProps {
  projectId: string;
  assessment: any;
}

const CategoryList: React.FC<CategoryListProps> = ({ projectId, assessment }) => {
  const { categories, toggleCategory, isLoading } = useCategories();
  const [localCategories, setLocalCategories] = useState(categories);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    console.log('Mise à jour des catégories locales:', categories);
    setLocalCategories(categories);
  }, [categories]);

  const handleToggle = async (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
    , 'A');
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!localCategories || localCategories.length === 0) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography color="text.secondary">
          Aucune catégorie disponible
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {localCategories.map((category) => {
        if (!category) return null;
        
        const progress = getCategoryProgress(category.id);
        const worstClass = getWorstClassInCategory(category.id);
        const Icon = category.icon;

        return (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Paper
              elevation={1}
              sx={{
                height: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                opacity: category.isEnabled ? 1 : 0.7,
                backgroundColor: worstClass !== 'NA' && category.isEnabled
                  ? alpha(getClassColor(worstClass), 0.08)
                  : 'transparent',
                '&:hover': category.isEnabled ? {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2]
                } : {},
                position: 'relative'
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
                  p: 2,
                  pr: 14  // Espace pour le bouton
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mr: 2
                }}>
                  {Icon && <Icon sx={{ fontSize: '2rem', mb: 1 }} />}
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {progress.completed} / {progress.total} évalués
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => handleToggle(category.id, e)}
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
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CategoryList; 