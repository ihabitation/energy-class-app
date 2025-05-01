import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';
import CategoryList from '../components/CategoryList';
import { useCategories } from '../contexts/CategoryContext';
import { useAssessment } from '../contexts/AssessmentContext';
import { calculateFinalClass, getCategories } from '../services/energyClassService';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FinalClassDisplay from '../components/FinalClassDisplay';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Category } from '../types/energyClass';

const Assessment: React.FC = () => {
  const { categories, setCategories } = useCategories();
  const { getAssessment, updateGlobalResults, loadProjectAssessment } = useAssessment();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const assessment = projectId ? getAssessment(projectId) : {};
  const navigate = useNavigate();

  const enabledCategories = categories.filter(cat => cat.isEnabled).map(cat => cat.id);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError("ID du projet manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const adminStatus = await isAdmin();
        console.log('Status admin:', adminStatus);
        console.log('ID du projet:', projectId);

        if (adminStatus) {
          // Pour un admin, charger le projet directement depuis Supabase
          console.log('Chargement du projet en tant qu\'admin...');
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

          if (error) {
            console.error('Erreur Supabase lors du chargement du projet:', error);
            throw error;
          }

          if (!data) {
            console.error('Aucun projet trouvé avec l\'ID:', projectId);
            throw new Error("Projet non trouvé");
          }

          console.log('Projet chargé (admin):', data);
          setProject(data);
          
          // Charger les évaluations du projet
          console.log('Chargement des évaluations...');
          await loadProjectAssessment(projectId);
          console.log('Évaluations chargées pour le projet');

          // Charger les catégories activées
          console.log('Chargement des catégories...');
          const { data: globalResults, error: globalError } = await supabase
            .from('global_results')
            .select('category_id, is_enabled')
            .eq('project_id', projectId);

          if (globalError) {
            console.error('Erreur lors du chargement des catégories:', globalError);
            throw globalError;
          }

          if (!globalResults || globalResults.length === 0) {
            console.log('Aucune catégorie trouvée, initialisation des catégories par défaut...');
            // Initialiser les catégories par défaut pour l'administrateur
            const initialCategories = getCategories();
            const defaultEntries = initialCategories.map(category => ({
              project_id: projectId,
              category_id: category.id,
              is_enabled: true,
              last_updated: new Date().toISOString()
            }));

            const { error: insertError } = await supabase
              .from('global_results')
              .insert(defaultEntries);

            if (insertError) {
              console.error('Erreur lors de l\'initialisation des catégories:', insertError);
              throw insertError;
            }

            // Mettre à jour le contexte avec les catégories activées
            setCategories(prevCategories => prevCategories.map(category => ({
              ...category,
              isEnabled: true
            })));
          } else {
            console.log('Catégories chargées:', globalResults);
            // Mettre à jour le contexte des catégories avec les résultats de Supabase
            setCategories(prevCategories => prevCategories.map(category => ({
              ...category,
              isEnabled: globalResults.find(r => r.category_id === category.id)?.is_enabled ?? false
            })));
          }
        } else {
          // Pour un utilisateur normal, utiliser le contexte des projets
          const userProject = projects.find(p => p.id === projectId);
          console.log('Projet chargé (utilisateur):', userProject);
          
          if (!userProject) {
            throw new Error("Projet non trouvé dans le contexte utilisateur");
          }
          
          setProject(userProject);
          // Charger les évaluations du projet
          await loadProjectAssessment(projectId);
          console.log('Évaluations chargées pour le projet');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        setError(error instanceof Error ? error.message : "Erreur lors du chargement du projet");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, isAdmin, projects, loadProjectAssessment]);

  useEffect(() => {
    if (projectId && enabledCategories.length > 0 && project) {
      updateGlobalResults(projectId, enabledCategories);
    }
  }, [projectId, enabledCategories.join(','), assessment, project]);

  console.log('État actuel:', {
    loading,
    error,
    project,
    projectId,
    assessment,
    enabledCategories
  });

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!projectId || !project) {
    return (
      <Container>
        <Typography color="error">Projet non trouvé</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects/' + projectId)}
          sx={{ 
            alignSelf: 'flex-start',
            color: 'primary.main',
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          RETOUR AU PROJET
        </Button>

        <FinalClassDisplay projectId={projectId} project={project} />

        <Typography
          variant="h2"
          sx={{
            fontSize: '2rem',
            fontWeight: 'normal'
          }}
        >
          Catégories à évaluer
        </Typography>

        <CategoryList
          projectId={projectId}
          assessment={assessment}
        />
      </Box>
    </Container>
  );
};

export default Assessment; 