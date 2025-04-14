import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemButton, Typography, Box, Chip, Paper, useTheme, useMediaQuery } from '@mui/material';
import { SubCategory } from '../types/energyClass';
import { getClassColor, getClassTextColor } from '../utils/colors';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterIcon from '@mui/icons-material/Water';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import StorageIcon from '@mui/icons-material/Storage';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PowerIcon from '@mui/icons-material/Power';

interface SubCategoryListItemProps {
  subCategory: SubCategory;
  selectedClass?: string;
  selectedOption?: string;
  categoryId: string;
}

const SubCategoryListItem: React.FC<SubCategoryListItemProps> = ({
  subCategory,
  selectedClass,
  selectedOption,
  categoryId
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getIcon = (id: string) => {
    const iconProps = { 
      sx: { 
        fontSize: isMobile ? '1.5rem' : '2rem',
        color: theme.palette.primary.main,
        mr: 2
      }
    };

    if (id.includes('emission')) return <TuneIcon {...iconProps} />;
    if (id.includes('temperature')) return <DeviceThermostatIcon {...iconProps} />;
    if (id.includes('pompes')) return <WaterIcon {...iconProps} />;
    if (id.includes('hydronique')) return <CompareArrowsIcon {...iconProps} />;
    if (id.includes('intermittente')) return <PowerIcon {...iconProps} />;
    if (id.includes('generateurs')) return <AcUnitIcon {...iconProps} />;
    if (id.includes('stockage')) return <StorageIcon {...iconProps} />;
    return <SettingsIcon {...iconProps} />;
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': {
          elevation: 2,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={`/subcategory/${categoryId}/${subCategory.id}`}
          sx={{
            p: isMobile ? 1.5 : 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%'
          }}>
            {getIcon(subCategory.id)}
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: 1
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"}
                  component="div"
                  sx={{ fontWeight: 'medium' }}
                >
                  {subCategory.name}
                </Typography>
                {selectedClass && (
                  <Chip
                    label={selectedClass}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor: getClassColor(selectedClass as 'A' | 'B' | 'C' | 'D' | 'NA'),
                      color: getClassTextColor(selectedClass as 'A' | 'B' | 'C' | 'D' | 'NA'),
                      fontWeight: 'bold',
                      ml: 'auto'
                    }}
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {subCategory.description}
              </Typography>
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
    </Paper>
  );
};

export default SubCategoryListItem; 