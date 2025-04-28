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

type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'NA';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, loading, error, filters, setFilters, deleteProject } = useProjects();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { categories } = useCategories();
  const { getAssessment } = useAssessment();

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

  const statusOptions: ProjectStatus[] = ['draft', 'in_progress', 'completed'];
  const statusLabels: Record<ProjectStatus, string> = {
    draft: 'Brouillon',
    in_progress: 'En cours',
    completed: 'Terminé'
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h5" 
          component="h1"
          sx={{
            fontWeight: 600,
            color: theme => theme.palette.text.primary,
            letterSpacing: '0.5px'
          }}
        >
          PROJETS D'ÉVALUATION ÉNERGÉTIQUE
        </Typography>
        <Box>
          <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ mr: 1 }}>
            <FilterListIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Nouveau Projet
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Statut"
                  select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Type de bâtiment"
                  value={filters.buildingType || ''}
                  onChange={(e) => handleFilterChange('buildingType', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: getClassColor(projectClasses[project.id] || 'NA'),
                  color: getClassTextColor(projectClasses[project.id] || 'NA')
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {project.clientName}
                    </Typography>
                  </Box>
                  <Chip
                    label={projectClasses[project.id] || 'NA'}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'inherit',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      border: '2px solid',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={projectProgresses[project.id] || 0}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)'
                      }
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5, 
                      display: 'block', 
                      opacity: 0.9,
                      fontWeight: projectProgresses[project.id] === 100 ? 600 : 'inherit'
                    }}
                  >
                    Progression: {Math.round(projectProgresses[project.id] || 0)}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/projects/${project.id}/assessment`)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'inherit',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)'
                      }
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
                      }
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
                      }
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectList;