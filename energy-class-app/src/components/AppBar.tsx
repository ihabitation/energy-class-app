import { AppBar as MuiAppBar, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

export function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MuiAppBar 
      position="fixed" 
      color="default" 
      elevation={1}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ 
        minHeight: isMobile ? '56px' : '64px',
        px: isMobile ? 2 : 3
      }}>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 600
          }}
          onClick={() => navigate('/')}
        >
          Energy Class
        </Typography>

        {!isMobile && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span>Bienvenue,</span>
              <span style={{ fontWeight: 500, color: 'text.primary' }}>
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'}
              </span>
            </Typography>
          </Box>
        )}

        <Box sx={{ ml: isMobile ? 0 : 2 }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
} 