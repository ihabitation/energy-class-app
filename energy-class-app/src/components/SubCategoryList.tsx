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
        const selectedClass = assessment[subCategory.id]?.selectedClass;
        const selectedOption = assessment[subCategory.id]?.selectedOption;

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
                  <Typography variant="h6" gutterBottom>
                    {subCategory.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                  {selectedClass ? (
                    <Chip
                      label={selectedClass}
                      size="small"
                      sx={{
                        backgroundColor: getClassColor(selectedClass),
                        color: getClassTextColor(selectedClass),
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