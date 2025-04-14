import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { useProjects } from '../contexts/ProjectContext';
import { Project, ProjectStatus } from '../types/project';

const initialProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  clientName: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
  },
  status: 'draft',
  assessments: {},
  metadata: {
    buildingType: '',
  },
};

const statusOptions: ProjectStatus[] = ['draft', 'in_progress', 'completed'];
const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminé',
};

const ProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { createProject, updateProject, getProject } = useProjects();
  const [formData, setFormData] = useState(initialProject);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        setLoading(true);
        try {
          const project = await getProject(projectId);
          if (project) {
            const { id, createdAt, updatedAt, ...projectData } = project;
            setFormData(projectData);
          }
        } catch (err) {
          setError('Erreur lors du chargement du projet');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProject();
  }, [projectId, getProject]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [section, key] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...(prev[section as keyof typeof prev] as Record<string, any> || {}),
            [key]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (projectId) {
        await updateProject(projectId, formData);
      } else {
        await createProject(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {projectId ? 'Modifier le projet' : 'Nouveau projet'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nom du projet"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nom du client"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Adresse
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Rue"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Ville"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Code postal"
                value={formData.address.postalCode}
                onChange={(e) => handleChange('address.postalCode', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Pays"
                value={formData.address.country}
                onChange={(e) => handleChange('address.country', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Informations techniques
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Type de bâtiment"
                value={formData.metadata.buildingType}
                onChange={(e) => handleChange('metadata.buildingType', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Année de construction"
                value={formData.metadata.constructionYear || ''}
                onChange={(e) => handleChange('metadata.constructionYear', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Surface totale (m²)"
                value={formData.metadata.totalArea || ''}
                onChange={(e) => handleChange('metadata.totalArea', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Nombre d'étages"
                value={formData.metadata.floors || ''}
                onChange={(e) => handleChange('metadata.floors', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Dernière rénovation"
                value={formData.metadata.lastRenovation ? new Date(formData.metadata.lastRenovation).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('metadata.lastRenovation', e.target.value ? new Date(e.target.value) : undefined)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabels[status]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/')}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {projectId ? 'Enregistrer' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProjectForm; 