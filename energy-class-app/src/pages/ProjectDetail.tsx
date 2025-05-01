import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import { useProjects } from '../contexts/ProjectContext';
import { Project, ProjectStatus } from '../types/project';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass } from '../services/energyClassService';
import { getSubCategories } from '../services/energyClassService';
import TechnicalSolutionsList from '../components/TechnicalSolutionsList';
import TechnicalSolutionForm from '../components/TechnicalSolutionForm';
import SupabaseTest from '../components/SupabaseTest';
import { ProjectShareDialog } from '../components/ProjectShareDialog';
import { useAuth } from '../contexts/AuthContext';

const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminé',
};

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTechnicalSolutions, setShowTechnicalSolutions] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { categories } = useCategories();
  const { getAssessment } = useAssessment();
  const assessment = projectId ? getAssessment(projectId) : {};
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      try {
        const loadedProject = await getProject(projectId);
        setProject(loadedProject);
      } catch (err) {
        setError('Erreur lors du chargement du projet');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProject]);

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container>
        <Typography color="error">
          {error || 'Projet non trouvé'}
        </Typography>
      </Container>
    );
  }

  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
  const finalClass = calculateFinalClass(assessment, enabledCategories);

  // Calculer le nombre total de sous-catégories pour les catégories activées
  const totalSubCategories = enabledCategories.reduce((total, categoryId) => {
    return total + getSubCategories(categoryId).length;
  }, 0);

  // Calculer le nombre de sous-catégories complétées
  const completedSubCategories = enabledCategories.reduce((total, categoryId) => {
    const subCategories = getSubCategories(categoryId);
    return total + subCategories.filter(subCat => {
      const classType = assessment[subCat.id]?.classType;
      return classType !== undefined;
    }).length;
  }, 0);

  const progress = totalSubCategories > 0
    ? (completedSubCategories / totalSubCategories) * 100
    : 0;

  const isOwner = user?.id === project?.user_id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {!isMobile && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          Retour aux projets
        </Button>
      )}

      <SupabaseTest />

      <Paper 
        elevation={2} 
        sx={{ 
          p: 2,
          mb: 2,
          backgroundColor: finalClass !== 'NA' ? getClassColor(finalClass) : 'background.paper',
          color: finalClass !== 'NA' ? getClassTextColor(finalClass) : 'text.primary',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h6" 
                component="h1"
                sx={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  mb: 0.5,
                  lineHeight: 1
                }}
              >
                {project.name}
              </Typography>
              {isOwner && (
                <Tooltip title="Gérer les partages">
                  <IconButton
                    color="inherit"
                    onClick={() => setShareDialogOpen(true)}
                    size="small"
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography 
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.9rem',
                mt: 1
              }}
            >
              {project.clientName}
            </Typography>
          </Box>
          <Box sx={{ 
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '2.5rem',
                lineHeight: 1,
                mb: 0.5
              }}
            >
              {finalClass}
            </Typography>
            <Typography 
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Classe finale
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={1}
            sx={{ 
              p: 2, 
              mb: 2,
              borderRadius: '12px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[2]
              }
            }}
          >
            <Box 
              sx={{
                backgroundColor: 'grey.100',
                p: 1.5,
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Informations générales
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Description
                </Typography>
                <Typography variant="body1">
                  {project.description || 'Aucune description'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Adresse
                </Typography>
                <Typography variant="body1">
                  {project.address.street}
                  <br />
                  {project.address.postalCode} {project.address.city}
                  <br />
                  {project.address.country}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper 
            elevation={1}
            sx={{ 
              p: 2,
              borderRadius: '12px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[2]
              }
            }}
          >
            <Box 
              sx={{
                backgroundColor: 'grey.100',
                p: 1.5,
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Informations techniques
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Type de bâtiment
                </Typography>
                <Typography variant="body1">
                  {project.metadata.buildingType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Année de construction
                </Typography>
                <Typography variant="body1">
                  {project.metadata.constructionYear || 'Non spécifié'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Surface totale
                </Typography>
                <Typography variant="body1">
                  {project.metadata.totalArea ? `${project.metadata.totalArea} m²` : 'Non spécifié'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  Nombre d'étages
                </Typography>
                <Typography variant="body1">
                  {project.metadata.floors || 'Non spécifié'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box mt={3}>
            <Paper sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: 'grey.100',
                  p: 1.5,
                  borderRadius: '8px',
                  mb: 2
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Solutions techniques
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowTechnicalSolutions(!showTechnicalSolutions)}
                >
                  {showTechnicalSolutions ? 'Masquer' : 'Afficher'}
                </Button>
              </Box>
              {showTechnicalSolutions && (
                <>
                  <TechnicalSolutionsList />
                  <Box mt={3}>
                    <TechnicalSolutionForm />
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box 
              sx={{
                backgroundColor: 'grey.100',
                p: 1.5,
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                État du projet
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={statusLabels[project.status]}
                color={project.status === 'completed' ? 'success' : 'default'}
                sx={{ mb: 1 }}
              />
            </Box>
            <Typography variant="body2" gutterBottom>
              Progression de l'évaluation
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              {completedSubCategories} sur {totalSubCategories} évaluations complétées
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box 
              sx={{
                backgroundColor: 'grey.100',
                p: 1.5,
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Dates importantes
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  Créé le
                </Typography>
                <Typography>
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="textSecondary">
                  Dernière modification
                </Typography>
                <Typography>
                  {new Date(project.updatedAt).toLocaleDateString('fr-FR')}
                </Typography>
              </Grid>
              {project.metadata.lastRenovation && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="textSecondary">
                    Dernière rénovation
                  </Typography>
                  <Typography>
                    {new Date(project.metadata.lastRenovation).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate(`/projects/${projectId}/assessment`)}
              fullWidth
              sx={{ mb: 2 }}
            >
              Évaluer
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${projectId}/edit`)}
              fullWidth
            >
              Modifier
            </Button>
          </Box>
        </Grid>
      </Grid>

      {project && (
        <ProjectShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          projectId={project.id}
        />
      )}
    </Container>
  );
};

export default ProjectDetail; 