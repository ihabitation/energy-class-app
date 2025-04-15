import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useTechnicalSolutions } from '../contexts/TechnicalSolutionContext';
import { Database } from '../types/supabase';

type TechnicalSolutionInsert = Database['public']['Tables']['technical_solutions']['Insert'];

const solutionTypes = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'recommendation', label: 'Recommandation' },
  { value: 'requirement', label: 'Exigence' },
];

const TechnicalSolutionForm: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { createSolution } = useTechnicalSolutions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TechnicalSolutionInsert>({
    project_id: projectId || '',
    category_id: '',
    sub_category_id: '',
    selected_class: '',
    solution_type: 'prescription',
    title: '',
    description: '',
    technical_details: {
      equipment_type: '',
      specifications: [],
      installation_requirements: [],
      maintenance_requirements: [],
      standards: [],
    },
    implementation: {
      priority: 'medium',
      estimated_duration: 0,
      complexity: 'moderate',
      required_skills: [],
      prerequisites: [],
    },
    economic_impact: {
      investment_cost: 0,
      annual_savings: 0,
      maintenance_cost: 0,
      lifespan: 0,
      roi_period: 0,
      payback_period: 0,
    },
    environmental_impact: {
      co2_reduction: 0,
      energy_savings: 0,
      water_savings: 0,
    },
    status: 'proposed',
    created_by: 'current-user-id', // TODO: Remplacer par l'ID de l'utilisateur connecté
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof TechnicalSolutionInsert] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSolution(formData);
      // Réinitialiser le formulaire après la création
      setFormData({
        ...formData,
        title: '',
        description: '',
        technical_details: {
          equipment_type: '',
          specifications: [],
          installation_requirements: [],
          maintenance_requirements: [],
          standards: [],
        },
        implementation: {
          priority: 'medium',
          estimated_duration: 0,
          complexity: 'moderate',
          required_skills: [],
          prerequisites: [],
        },
        economic_impact: {
          investment_cost: 0,
          annual_savings: 0,
          maintenance_cost: 0,
          lifespan: 0,
          roi_period: 0,
          payback_period: 0,
        },
        environmental_impact: {
          co2_reduction: 0,
          energy_savings: 0,
          water_savings: 0,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la solution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Proposer une nouvelle solution technique
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Type de solution</InputLabel>
              <Select
                value={formData.solution_type}
                label="Type de solution"
                onChange={(e) => handleChange('solution_type', e.target.value)}
                required
              >
                {solutionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={4}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Détails Techniques
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Type d'équipement"
              value={formData.technical_details.equipment_type}
              onChange={(e) => handleNestedChange('technical_details', 'equipment_type', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Spécifications"
              value={(formData.technical_details.specifications || []).join(', ')}
              onChange={(e) => handleNestedChange('technical_details', 'specifications', e.target.value.split(',').map(s => s.trim()))}
              multiline
              rows={2}
              helperText="Séparez les spécifications par des virgules"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mise en œuvre
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={formData.implementation.priority}
                label="Priorité"
                onChange={(e) => handleNestedChange('implementation', 'priority', e.target.value)}
              >
                <MenuItem value="high">Haute</MenuItem>
                <MenuItem value="medium">Moyenne</MenuItem>
                <MenuItem value="low">Basse</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Durée estimée (jours)"
              type="number"
              value={formData.implementation.estimated_duration}
              onChange={(e) => handleNestedChange('implementation', 'estimated_duration', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Complexité</InputLabel>
              <Select
                value={formData.implementation.complexity}
                label="Complexité"
                onChange={(e) => handleNestedChange('implementation', 'complexity', e.target.value)}
              >
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="moderate">Modérée</MenuItem>
                <MenuItem value="complex">Complexe</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Compétences requises"
              value={formData.implementation.required_skills?.join(', ') || ''}
              onChange={(e) => handleNestedChange('implementation', 'required_skills', e.target.value.split(',').map(s => s.trim()))}
              multiline
              rows={2}
              helperText="Séparez les compétences par des virgules"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Prérequis"
              value={formData.implementation.prerequisites?.join(', ') || ''}
              onChange={(e) => handleNestedChange('implementation', 'prerequisites', e.target.value.split(',').map(s => s.trim()))}
              multiline
              rows={2}
              helperText="Séparez les prérequis par des virgules"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Impact Économique
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Coût d'investissement (€)"
              type="number"
              value={formData.economic_impact.investment_cost}
              onChange={(e) => handleNestedChange('economic_impact', 'investment_cost', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Économies annuelles (€)"
              type="number"
              value={formData.economic_impact.annual_savings}
              onChange={(e) => handleNestedChange('economic_impact', 'annual_savings', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Coût de maintenance (€/an)"
              type="number"
              value={formData.economic_impact.maintenance_cost}
              onChange={(e) => handleNestedChange('economic_impact', 'maintenance_cost', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Durée de vie (années)"
              type="number"
              value={formData.economic_impact.lifespan}
              onChange={(e) => handleNestedChange('economic_impact', 'lifespan', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Période de retour sur investissement (années)"
              type="number"
              value={formData.economic_impact.roi_period}
              onChange={(e) => handleNestedChange('economic_impact', 'roi_period', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Période de remboursement (années)"
              type="number"
              value={formData.economic_impact.payback_period}
              onChange={(e) => handleNestedChange('economic_impact', 'payback_period', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Impact Environnemental
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Réduction CO2 (kg/an)"
              type="number"
              value={formData.environmental_impact.co2_reduction}
              onChange={(e) => handleNestedChange('environmental_impact', 'co2_reduction', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Économies d'énergie (kWh/an)"
              type="number"
              value={formData.environmental_impact.energy_savings}
              onChange={(e) => handleNestedChange('environmental_impact', 'energy_savings', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Économies d'eau (m³/an)"
              type="number"
              value={formData.environmental_impact.water_savings}
              onChange={(e) => handleNestedChange('environmental_impact', 'water_savings', Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Proposer la solution'}
              </Button>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </form>
    </Paper>
  );
};

export default TechnicalSolutionForm; 