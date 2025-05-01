import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '../lib/supabase';
import GoogleIcon from '@mui/icons-material/Google';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        navigate('/login', { 
          state: { 
            message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.' 
          } 
        });
      }
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(`Erreur de connexion avec ${provider}:`, err);
      setError(`Une erreur est survenue lors de la connexion avec ${provider}`);
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
          Inscription
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
            autoComplete="new-password"
            helperText="Le mot de passe doit contenir au moins 6 caractères"
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            sx={{ 
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Déjà un compte ? Se connecter
          </Link>
        </Box>
      </Paper>
    </Container>
  );
} 