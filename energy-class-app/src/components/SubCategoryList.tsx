import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemButton, Box, Chip, Paper, Typography, Grid } from '@mui/material';
import { getSubCategories } from '../services/energyClassService';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useAssessment } from '../contexts/AssessmentContext';

interface SubCategoryListProps {
  categoryId: string;
  projectId: string;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({ categoryId, projectId }) => {
  const { getAssessment } = useAssessment();
  const assessment = getAssessment(projectId);
  const subCategories = getSubCategories(categoryId);

  return (
    <Grid container spacing={3}>
      {subCategories.map((subCategory) => {
        const classType = assessment[subCategory.id]?.classType;
        const selectedOption = assessment[subCategory.id]?.selectedOption;
        const Icon = subCategory.icon;

        return (
          <Grid item xs={12} sm={6} md={4} key={subCategory.id}>
            <Paper 
              elevation={1}
              sx={{
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <ListItemButton
                component={Link}
                to={`/projects/${projectId}/category/${categoryId}/subcategory/${subCategory.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2
                }}
              >
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Icon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography 
                      variant="h6" 
                      sx={{
                        fontWeight: 500,
                        fontSize: '1.25rem',
                        color: 'primary.main'
                      }}
                    >
                      {subCategory.name}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      opacity: 0.8,
                      lineHeight: 1.4
                    }}
                  >
                    {subCategory.description}
                  </Typography>
                </Box>

                <Box sx={{ 
                  mt: 'auto', 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {classType ? (
                    <Chip
                      label={classType}
                      size="small"
                      sx={{
                        backgroundColor: getClassColor(classType),
                        color: getClassTextColor(classType),
                      }}
                    />
                  ) : (
                    <Chip
                      label="Non évalué"
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {selectedOption && (
                    <Typography variant="caption" color="text.secondary">
                      Option : {selectedOption}
                    </Typography>
                  )}
                </Box>
              </ListItemButton>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SubCategoryList; 