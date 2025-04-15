import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('URL Supabase:', process.env.REACT_APP_SUPABASE_URL);
        console.log('Clé anonyme:', process.env.REACT_APP_SUPABASE_ANON_KEY);

        // Test de connexion en récupérant la liste des projets
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }

        setConnectionStatus('Connexion réussie !');
        console.log('Données récupérées:', data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
        setError(errorMessage);
        console.error('Erreur détaillée:', err);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Test de connexion Supabase
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Test de connexion en cours...</Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {connectionStatus && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {connectionStatus}
        </Alert>
      )}
    </Box>
  );
};

export default SupabaseTest; 