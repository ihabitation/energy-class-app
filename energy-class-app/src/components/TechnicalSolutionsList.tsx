import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTechnicalSolutions } from '../contexts/TechnicalSolutionContext';
import { Database } from '../types/supabase';

type TechnicalSolution = Database['public']['Tables']['technical_solutions']['Row'];

const TechnicalSolutionsList: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    solutions,
    loading,
    error,
    getProjectSolutions,
    approveSolution,
    rejectSolution,
  } = useTechnicalSolutions();

  useEffect(() => {
    if (projectId) {
      getProjectSolutions(projectId);
    }
  }, [projectId, getProjectSolutions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleApprove = async (solutionId: string) => {
    try {
      await approveSolution(solutionId, 'current-user-id'); // TODO: Remplacer par l'ID de l'utilisateur connecté
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
    }
  };

  const handleReject = async (solutionId: string) => {
    try {
      await rejectSolution(solutionId);
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (solutions.length === 0) {
    return (
      <Box mt={2}>
        <Typography variant="body1" color="text.secondary">
          Aucune solution technique n'a été proposée pour ce projet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="h5" gutterBottom>
        Solutions Techniques
      </Typography>
      <Grid container spacing={2}>
        {solutions.map((solution: TechnicalSolution) => (
          <Grid item xs={12} key={solution.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{solution.title}</Typography>
                  <Chip
                    label={solution.status}
                    color={getStatusColor(solution.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {solution.description}
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Détails Techniques:
                  </Typography>
                  <Typography variant="body2">
                    {JSON.stringify(solution.technical_details, null, 2)}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Impact Économique:
                  </Typography>
                  <Typography variant="body2">
                    {JSON.stringify(solution.economic_impact, null, 2)}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Impact Environnemental:
                  </Typography>
                  <Typography variant="body2">
                    {JSON.stringify(solution.environmental_impact, null, 2)}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                {solution.status === 'proposed' && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleApprove(solution.id)}
                    >
                      Approuver
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleReject(solution.id)}
                    >
                      Rejeter
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TechnicalSolutionsList; 