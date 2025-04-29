import React from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BlindsIcon from '@mui/icons-material/Blinds';
import RouterIcon from '@mui/icons-material/Router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProjectId, currentProjectName, currentCategory } = useNavigation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Utiliser useMatch pour extraire les paramètres de l'URL
  const projectMatch = useMatch('/projects/:projectId');
  const assessmentMatch = useMatch('/projects/:projectId/assessment');
  const categoryMatch = useMatch('/projects/:projectId/category/:categoryId');
  const subCategoryMatch = useMatch('/projects/:projectId/category/:categoryId/subcategory/:subCategoryId');

  if (!isMobile) return null;

  const isProjectList = location.pathname === '/projects';
  const isAssessmentView = location.pathname.includes('/assessment');
  const isCategoryView = categoryMatch !== null;
  const isSubCategoryView = subCategoryMatch !== null;

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return <AssessmentIcon />;

    switch (categoryName.toLowerCase()) {
      case 'chauffage':
        return <WhatshotIcon />;
      case 'ecs':
        return <OpacityIcon />;
      case 'refroidissement':
        return <AcUnitIcon />;
      case 'ventilation':
        return <AirIcon />;
      case 'eclairage':
        return <LightbulbIcon />;
      case 'stores':
        return <BlindsIcon />;
      case 'gtb':
        return <RouterIcon />;
      default:
        return <AssessmentIcon />;
    }
  };

  const handleBackToCategory = () => {
    if (isSubCategoryView && subCategoryMatch?.params) {
      const { projectId, categoryId } = subCategoryMatch.params;
      navigate(`/projects/${projectId}/category/${categoryId}`);
    }
  };

  const getCurrentValue = () => {
    if (isProjectList) return 0;
    if (isAssessmentView) return 2;
    if (isCategoryView || isSubCategoryView) return 3;
    return 1;
  };

  const getActionLabel = () => {
    if (isSubCategoryView) {
      return "Retour";
    }
    if (isCategoryView) {
      return currentCategory || "Catégorie";
    }
    return "Évaluation";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.3 }}
      >
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={getCurrentValue()}
            onChange={(event, newValue) => {
              switch (newValue) {
                case 0:
                  navigate('/projects');
                  break;
                case 1:
                  if (currentProjectId) {
                    navigate(`/projects/${currentProjectId}`);
                  }
                  break;
                case 2:
                  if (currentProjectId) {
                    navigate(`/projects/${currentProjectId}/assessment`);
                  }
                  break;
                case 3:
                  if (isSubCategoryView) {
                    handleBackToCategory();
                  }
                  break;
              }
            }}
            sx={{
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 0',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <BottomNavigationAction 
              label="Projets" 
              icon={<ViewListIcon />} 
            />
            {!isProjectList && currentProjectId && (
              <BottomNavigationAction 
                label="Projet"
                icon={<ApartmentIcon />} 
              />
            )}
            {!isProjectList && currentProjectId && (
              <BottomNavigationAction 
                label="Évaluation"
                icon={<AssessmentIcon />}
              />
            )}
            {(isCategoryView || isSubCategoryView) && (
              <BottomNavigationAction 
                label={getActionLabel()}
                icon={isSubCategoryView ? <ArrowBackIcon /> : getCategoryIcon(currentCategory)}
                onClick={isSubCategoryView ? handleBackToCategory : undefined}
              />
            )}
          </BottomNavigation>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileNavigation; 