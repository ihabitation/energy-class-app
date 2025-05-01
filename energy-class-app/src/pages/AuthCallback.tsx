import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        console.log('Début du callback d\'authentification');
        
        // Récupérer la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur lors de la récupération de la session:', sessionError);
          throw sessionError;
        }

        console.log('Session récupérée:', session);

        if (!isMounted) return;

        if (session) {
          // Vérifier si l'utilisateur est admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (roleError) {
            console.error('Erreur lors de la vérification du rôle:', roleError);
            throw roleError;
          }

          const isAdmin = roleData?.role === 'admin';

          if (isAdmin) {
            console.log('Utilisateur admin détecté, redirection vers /admin');
            navigate('/admin', { replace: true });
            return;
          }

          // Pour les utilisateurs normaux, vérifier les projets
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

          if (projectsError) {
            console.error('Erreur lors de la récupération des projets:', projectsError);
            throw projectsError;
          }

          console.log('Projets récupérés:', projects);

          if (!isMounted) return;

          // Rediriger vers la page appropriée
          if (projects && projects.length > 0) {
            navigate('/projects', { replace: true });
          } else {
            navigate('/projects/new', { replace: true });
          }
        } else {
          console.log('Aucune session trouvée, redirection vers /login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors du callback d\'authentification:', error);
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (!isProcessing) {
    return null;
  }

  return (
    <Container sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Connexion en cours...
      </Typography>
    </Container>
  );
} 