import React, { useState } from 'react';
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
        const selectedClass = assessment[subCat.id]?.selectedClass;
        return selectedClass !== undefined;
      }).length;
    });

    return totalSubCategories > 0 ? (completedSubCategories / totalSubCategories) * 100 : 0;
  };

  const getFinalClass = (projectId: string) => {
    if (!projectId) return 'NA';
    
    const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);
    const assessment = getAssessment(projectId);
    return calculateFinalClass(assessment, enabledCategories);
  };

  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const progress = projectId ? calculateProjectProgress(projectId) : 0;
  const finalClass = projectId ? getFinalClass(projectId) : 'NA';

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
            backgroundColor: currentProject.worstClass !== 'NA' ? getClassColor(currentProject.worstClass) : 'background.paper',
            color: currentProject.worstClass !== 'NA' ? getClassTextColor(currentProject.worstClass) : 'text.primary'
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
                {currentProject.worstClass !== 'NA' ? currentProject.worstClass : 'NA'}
              </Typography>
              <Typography variant="subtitle2">
                Classe finale
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Projets d'évaluation énergétique
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
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.clientName}
                    </Typography>
                  </Box>
                  <Chip
                    label={getFinalClass(project.id)}
                    sx={{
                      bgcolor: getClassColor(getFinalClass(project.id)),
                      color: getClassTextColor(getFinalClass(project.id)),
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProjectProgress(project.id)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                    Progression: {Math.round(calculateProjectProgress(project.id))}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/projects/${project.id}/assessment`)}
                  >
                    Évaluer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteClick(project.id)}
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