import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import { supabase } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .limit(1);

        if (error) {
          throw error;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
        setError(errorMessage);
        console.error('Erreur de connexion Supabase:', err);
      }
    };

    testConnection();
  }, []);

  if (error) {
  return (
    <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
    </Box>
  );
  }

  return null;
};

export default SupabaseTest; 