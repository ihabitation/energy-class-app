import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  LinearProgress,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useProjects } from '../contexts/ProjectContext';
import { ProjectFilters, ProjectStatus } from '../types/project';
import { getClassColor, getClassTextColor } from '../utils/colors';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass } from '../services/energyClassService';
import { getSubCategories } from '../services/energyClassService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';

type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'NA';

interface ProjectCategories {
  [projectId: string]: string[];
}

interface Project {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

interface UserProjects {
  user_id: string;
  email: string;
  display_name?: string;
  projects: any[];
}

interface UserDetails {
  user_id: string;
  email: string;
  display_name?: string;
}

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, loading, error, filters, setFilters, deleteProject } = useProjects();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { categories } = useCategories();
  const { getAssessment } = useAssessment();
  const [projectCategories, setProjectCategories] = useState<ProjectCategories>({});
  const { user, isAdmin } = useAuth();
  const [userProjects, setUserProjects] = useState<UserProjects[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);

  // Fonction pour récupérer les catégories activées depuis global_results
  const getProjectEnabledCategories = async (projectId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('global_results')
        .select('category_id, is_enabled')
        .eq('project_id', projectId)
        .eq('is_enabled', true);

      if (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        return [];
      }

      return data.map(item => item.category_id);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  };

  // Charger les catégories activées pour tous les projets
  useEffect(() => {
    const loadProjectCategories = async () => {
      const categories: ProjectCategories = {};
      for (const project of projects) {
        categories[project.id] = await getProjectEnabledCategories(project.id);
      }
      setProjectCategories(categories);
    };

    if (projects.length > 0) {
      loadProjectCategories();
    }
  }, [projects]);

  const calculateProjectProgress = (projectId: string) => {
    if (!projectId) return 0;
    
    const enabledCategories = categories.filter(cat => cat.isEnabled);
    const assessment = getAssessment(projectId);
    
    let totalSubCategories = 0;
    let completedSubCategories = 0;

    enabledCategories.forEach(category => {
      const subCategories = getSubCategories(category.id);
      totalSubCategories += subCategories.length;
      
      completedSubCategories += subCategories.filter(subCat => {
        const classType = assessment[subCat.id]?.classType;
        return classType !== undefined;
      }).length;
    });

    return totalSubCategories > 0 ? (completedSubCategories / totalSubCategories) * 100 : 0;
  };

  const getFinalClass = async (projectId: string): Promise<EnergyClass> => {
    if (!projectId) return 'NA';
    
    try {
      const { data, error } = await supabase
        .from('global_results')
        .select('final_class, last_updated')
        .eq('project_id', projectId)
        .order('last_updated', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erreur lors de la récupération de la classe finale:', error);
        return 'NA';
      }

      return (data?.[0]?.final_class as EnergyClass) || 'NA';
    } catch (error) {
      console.error('Erreur lors de la récupération de la classe finale:', error);
      return 'NA';
    }
  };

  const [projectClasses, setProjectClasses] = useState<Record<string, EnergyClass>>({});

  useEffect(() => {
    const loadProjectClasses = async () => {
      const classes: Record<string, EnergyClass> = {};
      for (const project of projects) {
        classes[project.id] = await getFinalClass(project.id);
      }
      setProjectClasses(classes);
    };

    if (projects.length > 0) {
      loadProjectClasses();
    }
  }, [projects]);

  const getProjectProgress = async (projectId: string): Promise<number> => {
    if (!projectId) return 0;
    
    try {
      const { data, error } = await supabase
        .from('global_results')
        .select('project_progress, last_updated')
        .eq('project_id', projectId)
        .order('last_updated', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        return 0;
      }

      return data?.[0]?.project_progress || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      return 0;
    }
  };

  const [projectProgresses, setProjectProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadProjectProgresses = async () => {
      const progresses: Record<string, number> = {};
      for (const project of projects) {
        progresses[project.id] = await getProjectProgress(project.id);
      }
      setProjectProgresses(progresses);
    };

    if (projects.length > 0) {
      loadProjectProgresses();
    }
  }, [projects]);

  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const progress = projectId ? calculateProjectProgress(projectId) : 0;

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const statusOptions: ProjectStatus[] = ['draft', 'in_progress', 'completed'];
  const statusLabels: Record<ProjectStatus, string> = {
    draft: 'Brouillon',
    in_progress: 'En cours',
    completed: 'Terminé'
  };

  const renderCategoryIcons = (projectId: string) => {
    try {
      if (!projectId || !categories || !navigate) {
        return null;
      }

      const enabledCategoryIds = projectCategories[projectId] || [];
      const enabledCategories = categories.filter(cat => enabledCategoryIds.includes(cat.id));
      const currentClass = projectClasses[projectId] || 'NA';
      const iconColor = currentClass !== 'NA' ? 'rgba(0, 0, 0, 0.3)' : 'primary.main';
      
      if (enabledCategories.length === 0) {
        return null;
      }

      const handleCategoryClick = (categoryId: string) => {
        try {
          navigate(`/projects/${projectId}/category/${categoryId}`);
        } catch (error) {
          console.error('Erreur lors de la navigation:', error);
        }
      };

      return (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 1 }, 
            mt: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}
        >
          {enabledCategories.map(category => {
            if (!category || !category.icon) return null;
            
            const Icon = category.icon;
            return (
              <Tooltip 
                key={category.id} 
                title={`Aller à ${category.name}`}
                placement="top"
              >
                <Box
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: '40px', sm: '32px' },
                    height: { xs: '40px', sm: '32px' },
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '4px'
                    }
                  }}
                >
                  <Icon sx={{ 
                    fontSize: { xs: '2rem', sm: '1.5rem' },
                    color: iconColor,
                    opacity: 0.9,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.1)'
                    }
                  }} />
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      );
    } catch (error) {
      console.error('Erreur lors du rendu des icônes:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAdminAndLoadProjects = async () => {
      const adminStatus = await isAdmin();
      console.log('Status admin:', adminStatus);
      setIsAdminView(adminStatus);
      
      if (adminStatus) {
        try {
          // Utiliser la fonction RPC get_user_details pour obtenir les informations des utilisateurs
          const { data: usersData, error: usersError } = await supabase
            .rpc('get_user_details');

          if (usersError) throw usersError;

          console.log('Données utilisateurs:', usersData);

          // Charger tous les projets
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (projectsError) throw projectsError;

          console.log('Données projets:', projectsData);

          // Charger les classes énergétiques et la progression pour tous les projets
          const projectClasses: Record<string, EnergyClass> = {};
          const projectProgresses: Record<string, number> = {};
          const projectCategories: ProjectCategories = {};

          for (const project of projectsData || []) {
            // Charger la classe énergétique
            const { data: classData } = await supabase
              .from('global_results')
              .select('final_class, last_updated')
              .eq('project_id', project.id)
              .order('last_updated', { ascending: false })
              .limit(1);

            projectClasses[project.id] = (classData?.[0]?.final_class as EnergyClass) || 'NA';

            // Charger la progression
            const { data: progressData } = await supabase
              .from('global_results')
              .select('project_progress, last_updated')
              .eq('project_id', project.id)
              .order('last_updated', { ascending: false })
              .limit(1);

            projectProgresses[project.id] = progressData?.[0]?.project_progress || 0;

            // Charger les catégories activées
            const { data: categoriesData } = await supabase
              .from('global_results')
              .select('category_id, is_enabled')
              .eq('project_id', project.id)
              .eq('is_enabled', true);

            projectCategories[project.id] = categoriesData?.map(item => item.category_id) || [];
          }

          // Mettre à jour les états
          setProjectClasses(projectClasses);
          setProjectProgresses(projectProgresses);
          setProjectCategories(projectCategories);

          // Créer d'abord un objet avec tous les utilisateurs
          const projectsByUser = (usersData as UserDetails[]).reduce((acc: { [key: string]: UserProjects }, user) => {
            acc[user.user_id] = {
              user_id: user.user_id,
              email: user.email,
              display_name: user.display_name,
              projects: []
            };
            return acc;
          }, {});

          // Ensuite, ajouter les projets aux utilisateurs correspondants
          projectsData?.forEach(project => {
            if (projectsByUser[project.user_id]) {
              projectsByUser[project.user_id].projects.push(project);
            }
          });

          console.log('Projets groupés par utilisateur:', projectsByUser);

          const userProjectsArray = Object.values(projectsByUser);
          console.log('Tableau final des projets utilisateurs:', userProjectsArray);

          setUserProjects(userProjectsArray);
          setExpandedUsers([user?.id || '']);

        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };

    checkAdminAndLoadProjects();
  }, [isAdmin, user]);

  const handleUserAccordion = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 2 }}>
          Erreur: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 4,
        px: { xs: 2, sm: 3 }  // Ajustement du padding horizontal du conteneur principal
      }}
    >
      {currentProject && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4,
            backgroundColor: projectClasses[currentProject.id] !== 'NA' ? getClassColor(projectClasses[currentProject.id]) : 'background.paper',
            color: projectClasses[currentProject.id] !== 'NA' ? getClassTextColor(projectClasses[currentProject.id]) : 'text.primary'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {currentProject.name}
              </Typography>
              <Typography variant="subtitle1">
                {currentProject.clientName}
              </Typography>
              {renderCategoryIcons(currentProject.id)}
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
                {projectClasses[currentProject.id] !== 'NA' ? projectClasses[currentProject.id] : 'NA'}
              </Typography>
              <Typography variant="subtitle2">
                Classe finale
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: { xs: 3, sm: 4 },
        gap: { xs: 3, sm: 0 },
        width: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 3, sm: 2 },
            mb: { xs: 0, sm: 0 }
          }}>
            <img 
              src="/logo.png" 
              alt="iHabitation Logo" 
              style={{ 
                width: '48px', 
                height: '48px',
                objectFit: 'contain'
              }} 
            />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{
                fontWeight: 600,
                color: theme => theme.palette.text.primary,
                letterSpacing: '0.5px',
                textAlign: { xs: 'center', sm: 'left' },
                fontSize: { xs: '1.5rem', sm: '1.5rem' }
              }}
            >
              VOS PROJETS D'AUDIT
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              maxWidth: '600px',
              px: { xs: 2, sm: 0 },
              fontSize: { xs: '0.9rem', sm: '0.875rem' }
            }}
          >
            Gérez et suivez vos projets d'audit énergétique en un coup d'œil
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 2 },
          justifyContent: { xs: 'center', sm: 'flex-end' },
          width: '100%',
          mt: { xs: 1, sm: 0 }
        }}>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)} 
            sx={{ 
              width: { xs: '48px', sm: '40px' },
              height: { xs: '48px', sm: '40px' },
              backgroundColor: theme => showFilters ? theme.palette.primary.main : 'transparent',
              color: theme => showFilters ? theme.palette.primary.contrastText : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme => showFilters ? theme.palette.primary.dark : theme.palette.action.hover
              },
              flexShrink: 0  // Empêche l'icône de rétrécir
            }}
          >
            <FilterListIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.25rem' } }} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.25rem' } }} />}
            onClick={() => navigate('/projects/new')}
            sx={{
              width: '100%',  // Utilise toute la largeur disponible
              maxWidth: { xs: 'calc(100% - 64px)', sm: 'auto' },  // Soustrait la largeur du bouton filtre + gap
              height: { xs: '48px', sm: '40px' },
              fontSize: { xs: '1rem', sm: '0.875rem' }
            }}
          >
            Nouveau Projet
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Card 
          sx={{ 
            mb: 4,
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Statut"
                  select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="small"
                >
                  <MenuItem value="">Tous</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusLabels[status]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Client"
                  value={filters.clientName || ''}
                  onChange={(e) => handleFilterChange('clientName', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Type de bâtiment"
                  value={filters.buildingType || ''}
                  onChange={(e) => handleFilterChange('buildingType', e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isAdminView ? (
            // Vue administrateur
            <Box>
              {userProjects.length === 0 ? (
                <Alert severity="info">Aucun projet trouvé</Alert>
              ) : (
                userProjects.map((userProject) => (
                  <Accordion
                    key={userProject.user_id}
                    expanded={expandedUsers.includes(userProject.user_id)}
                    onChange={() => handleUserAccordion(userProject.user_id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: 'grey.100',
                        '&:hover': { backgroundColor: 'grey.200' }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="action" />
                        <Typography>
                          {userProject.display_name || userProject.email}
                          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                            ({userProject.projects.length} projet{userProject.projects.length > 1 ? 's' : ''})
                          </Typography>
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {userProject.projects.map((project) => (
                          <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <Paper
                              elevation={3}
                              sx={{
                                p: { xs: 3, sm: 2.5 },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 2.5, sm: 2 },
                                backgroundColor: getClassColor(projectClasses[project.id] || 'NA'),
                                color: getClassTextColor(projectClasses[project.id] || 'NA'),
                                borderRadius: { xs: '16px', sm: '12px' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontSize: { xs: '1.25rem', sm: '1.15rem' },
                                      fontWeight: 600,
                                      mb: 0.5
                                    }}
                                  >
                                    {project.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      opacity: 0.9,
                                      fontSize: { xs: '0.95rem', sm: '0.875rem' }
                                    }}
                                  >
                                    {project.clientName}
                                  </Typography>
                                  {renderCategoryIcons(project.id)}
                                </Box>
                                <Chip
                                  label={projectClasses[project.id] || 'NA'}
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'inherit',
                                    fontSize: { xs: '1.35rem', sm: '1.2rem' },
                                    fontWeight: 'bold',
                                    border: '2px solid',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    height: { xs: '36px', sm: '32px' },
                                    ml: 1
                                  }}
                                />
                              </Box>

                              <Box sx={{ width: '100%' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={projectProgresses[project.id] || 0}
                                  sx={{ 
                                    height: { xs: 10, sm: 8 }, 
                                    borderRadius: { xs: 5, sm: 4 },
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                  }}
                                />
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    mt: 1,
                                    display: 'block', 
                                    opacity: 0.9,
                                    fontWeight: projectProgresses[project.id] === 100 ? 600 : 'inherit',
                                    fontSize: { xs: '0.9rem', sm: '0.75rem' }
                                  }}
                                >
                                  Progression: {Math.round(projectProgresses[project.id] || 0)}%
                                </Typography>
                              </Box>

                              <Box sx={{ 
                                display: 'flex', 
                                gap: { xs: 2, sm: 1.5 }, 
                                justifyContent: 'flex-end',
                                mt: { xs: 1, sm: 0 }
                              }}>
                                <Button
                                  variant="contained"
                                  onClick={() => navigate(`/projects/${project.id}/assessment`)}
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'inherit',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                                    },
                                    fontSize: { xs: '0.95rem', sm: '0.875rem' },
                                    py: { xs: 1.2, sm: 1 }
                                  }}
                                >
                                  Évaluer
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={() => navigate(`/projects/${project.id}`)}
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'inherit',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                                    },
                                    fontSize: { xs: '0.95rem', sm: '0.875rem' },
                                    py: { xs: 1.2, sm: 1 }
                                  }}
                                >
                                  Détails
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={() => handleDeleteClick(project.id)}
                                  sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'inherit',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.3)'
                                    },
                                    fontSize: { xs: '0.95rem', sm: '0.875rem' },
                                    py: { xs: 1.2, sm: 1 }
                                  }}
                                >
                                  Supprimer
                                </Button>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          ) : (
            // Vue utilisateur normale
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 3, sm: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 2.5, sm: 2 },
                      backgroundColor: getClassColor(projectClasses[project.id] || 'NA'),
                      color: getClassTextColor(projectClasses[project.id] || 'NA'),
                      borderRadius: { xs: '16px', sm: '12px' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: { xs: '1.25rem', sm: '1.15rem' },
                            fontWeight: 600,
                            mb: 0.5
                          }}
                        >
                          {project.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            opacity: 0.9,
                            fontSize: { xs: '0.95rem', sm: '0.875rem' }
                          }}
                        >
                          {project.clientName}
                        </Typography>
                        {renderCategoryIcons(project.id)}
                      </Box>
                      <Chip
                        label={projectClasses[project.id] || 'NA'}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'inherit',
                          fontSize: { xs: '1.35rem', sm: '1.2rem' },
                          fontWeight: 'bold',
                          border: '2px solid',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          height: { xs: '36px', sm: '32px' },
                          ml: 1
                        }}
                      />
                    </Box>

                    <Box sx={{ width: '100%' }}>
                      <LinearProgress
                        variant="determinate"
                        value={projectProgresses[project.id] || 0}
                        sx={{ 
                          height: { xs: 10, sm: 8 }, 
                          borderRadius: { xs: 5, sm: 4 },
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)'
                          }
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          mt: 1,
                          display: 'block', 
                          opacity: 0.9,
                          fontWeight: projectProgresses[project.id] === 100 ? 600 : 'inherit',
                          fontSize: { xs: '0.9rem', sm: '0.75rem' }
                        }}
                      >
                        Progression: {Math.round(projectProgresses[project.id] || 0)}%
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: 2, sm: 1.5 }, 
                      justifyContent: 'flex-end',
                      mt: { xs: 1, sm: 0 }
                    }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/projects/${project.id}/assessment`)}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)'
                          },
                          fontSize: { xs: '0.95rem', sm: '0.875rem' },
                          py: { xs: 1.2, sm: 1 }
                        }}
                      >
                        Évaluer
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)'
                          },
                          fontSize: { xs: '0.95rem', sm: '0.875rem' },
                          py: { xs: 1.2, sm: 1 }
                        }}
                      >
                        Détails
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleDeleteClick(project.id)}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'inherit',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)'
                          },
                          fontSize: { xs: '0.95rem', sm: '0.875rem' },
                          py: { xs: 1.2, sm: 1 }
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectList;