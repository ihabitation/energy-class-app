import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemButton, Box, Chip, Paper, Typography, Grid, useTheme } from '@mui/material';
import { getSubCategories } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useAssessment } from '../contexts/AssessmentContext';
import { alpha } from '@mui/material/styles';

interface SubCategoryListProps {
  categoryId: string;
  projectId: string;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({ categoryId, projectId }) => {
  const { getAssessment } = useAssessment();
  const assessment = getAssessment(projectId);
  const subCategories = getSubCategories(categoryId);
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      {subCategories.map((subCategory) => {
        const classType = assessment[subCategory.id]?.classType;
        const selectedOption = assessment[subCategory.id]?.selectedOption;
        const Icon = subCategory.icon;
        const backgroundColor = classType 
          ? alpha(getClassColor(classType), 0.08)
          : 'transparent';

        return (
          <Grid item xs={12} sm={6} md={4} key={subCategory.id}>
            <Paper 
              elevation={1}
              sx={{
                height: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                backgroundColor,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Box
                component={Link}
                to={`/projects/${projectId}/category/${categoryId}/subcategory/${subCategory.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  textDecoration: 'none',
                  color: 'inherit',
                  p: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mr: 2
                }}>
                  <Icon sx={{ 
                    fontSize: '1.75rem',
                    color: 'primary.main',
                    mb: 1
                  }} />
                  <Chip
                    label={classType || "Non évalué"}
                    size="small"
                    sx={classType ? {
                      backgroundColor: getClassColor(classType),
                      color: getClassTextColor(classType),
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
                  <Typography 
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      color: theme.palette.text.primary
                    }}
                  >
                    {subCategory.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.4
                    }}
                  >
                    {subCategory.description}
                  </Typography>
                  {selectedOption && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        mt: 1
                      }}
                    >
                      Option {selectedOption}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SubCategoryList; 