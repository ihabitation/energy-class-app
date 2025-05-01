import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function UserMenu() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const admin = await isAdmin();
        setIsUserAdmin(admin);
      }
    };
    checkAdminStatus();
  }, [user, isAdmin]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      handleClose();
      
      // Déconnexion de Supabase
      await supabase.auth.signOut();
      
      // Nettoyer le stockage local
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Redirection vers la page de connexion avec un paramètre pour forcer une nouvelle connexion
      window.location.href = '/login?force_new=true';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    handleClose();
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        >
          Connexion
        </Typography>
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/register')}
        >
          Inscription
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <IconButton
        size="large"
        aria-label="menu utilisateur"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar
          sx={{ width: 32, height: 32 }}
          alt={user.email || 'Utilisateur'}
          src={user.user_metadata?.avatar_url}
        />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </MenuItem>
        <Divider />
        {isUserAdmin && (
          <MenuItem onClick={handleAdminPanel}>
            Administration
          </MenuItem>
        )}
        <MenuItem onClick={handleSignOut}>Déconnexion</MenuItem>
      </Menu>
    </>
  );
} 