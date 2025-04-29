import React from 'react';
import { Breadcrumbs, Link, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BlindsIcon from '@mui/icons-material/Blinds';
import RouterIcon from '@mui/icons-material/Router';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ViewListIcon from '@mui/icons-material/ViewList';
import { getCategories } from '../services/energyClassService';

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProjectId, currentProjectName, currentCategory, currentSubCategory, isAssessment } = useNavigation();

  // Utiliser useMatch pour extraire les paramètres de l'URL
  const projectMatch = useMatch('/projects/:projectId');
  const assessmentMatch = useMatch('/projects/:projectId/assessment');
  const categoryMatch = useMatch('/projects/:projectId/category/:categoryId');
  const subCategoryMatch = useMatch('/projects/:projectId/category/:categoryId/subcategory/:subCategoryId');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Ne pas afficher le fil d'Ariane sur mobile
  if (isMobile) return null;

  const handleProjectClick = () => {
    navigate('/projects');
  };

  const handleCurrentProjectClick = () => {
    if (currentProjectId) {
      navigate(`/projects/${currentProjectId}`);
    }
  };

  const handleAssessmentClick = () => {
    if (currentProjectId) {
      navigate(`/projects/${currentProjectId}/assessment`);
    }
  };

  const handleCategoryClick = () => {
    // Utiliser les paramètres du match pour la navigation
    if (subCategoryMatch) {
      const { projectId, categoryId } = subCategoryMatch.params;
      navigate(`/projects/${projectId}/category/${categoryId}`);
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    const iconProps = { 
      sx: { 
        fontSize: '1.4rem',
        mr: 0.5
      }
    };

    if (!categoryName) return null;

    switch (categoryName.toLowerCase()) {
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

  const showAssessmentLink = isAssessment || 
                            location.pathname.includes('/assessment') || 
                            location.pathname.includes('/category/');

  const isSubCategoryView = location.pathname.includes('/subcategory/');

  return (
    <Breadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />} 
      aria-label="breadcrumb"
      sx={{ 
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '& .MuiLink-root': {
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }
      }}
    >
      <Link
        color="inherit"
        href="#"
        onClick={handleProjectClick}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" />
        Projets
      </Link>

      {currentProjectName && (
        <Link
          color="inherit"
          href="#"
          onClick={handleCurrentProjectClick}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ApartmentIcon sx={{ mr: 0.5 }} fontSize="small" />
          {currentProjectName}
        </Link>
      )}

      {showAssessmentLink && (
        <Link
          color="inherit"
          href="#"
          onClick={handleAssessmentClick}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <AssessmentIcon sx={{ mr: 0.5 }} fontSize="small" />
          Évaluation
        </Link>
      )}

      {currentCategory && (
        isSubCategoryView ? (
          <Link
            color="inherit"
            href="#"
            onClick={handleCategoryClick}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {getCategoryIcon(currentCategory)}
            {currentCategory}
          </Link>
        ) : (
          <Typography
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.primary'
            }}
          >
            {getCategoryIcon(currentCategory)}
            {currentCategory}
          </Typography>
        )
      )}

      {currentSubCategory && (
        <Typography
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.primary'
          }}
        >
          {currentSubCategory}
        </Typography>
      )}
    </Breadcrumbs>
  );
};

export default Breadcrumb; 