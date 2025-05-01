import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  useTheme,
  Divider,
} from '@mui/material';
import { supabase, getRedirectUrl } from '../lib/supabase';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setError(message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      navigate('/projects');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setLoading(true);
    setError(null);
    
    try {
      // Nettoyer le stockage local avant la connexion
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectUrl(),
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error(`Erreur de connexion avec ${provider}:`, err);
      setError(`Une erreur est survenue lors de la connexion avec ${provider}`);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 4
          }}
        >
          Connexion
        </Typography>

        {error && (
          <Alert severity={error.includes('réussie') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin('google')}
            sx={{ mb: 2 }}
          >
            Continuer avec Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LinkedInIcon />}
            onClick={() => handleSocialLogin('linkedin')}
            sx={{ 
              backgroundColor: '#0077B5',
              color: 'white',
              '&:hover': {
                backgroundColor: '#006399',
              }
            }}
          >
            Continuer avec LinkedIn
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ou
          </Typography>
        </Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
            sx={{ 
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </Box>
      </Paper>
    </Container>
  );
} 