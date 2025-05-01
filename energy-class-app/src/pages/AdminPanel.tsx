import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { alpha } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  display_name?: string;
  project_count: number;
}

export function AdminPanel() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
          setError("Vous n'avez pas les droits d'administrateur");
          setLoading(false);
          return;
        }
        fetchUsers();
      } catch (err) {
        setError("Erreur lors de la vérification des droits d'administration");
        setLoading(false);
      }
    };

    if (!loading) return;
    checkAccess();
  }, [loading]);

  const fetchUsers = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .rpc('get_user_details');

      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError);
        throw usersError;
      }

      console.log('Données utilisateurs reçues:', JSON.stringify(users, null, 2));
      console.log('Structure du premier utilisateur:', users?.[0] ? Object.keys(users[0]) : 'Aucun utilisateur');
      setUsers(users || []);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenDialog = (user: UserRole) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: currentRole === 'admin' ? 'user' : 'admin' })
        .eq('user_id', userId);

      if (error) throw error;

      setSuccess(`Rôle de l'utilisateur mis à jour avec succès`);
      setTimeout(() => setSuccess(null), 3000);
      handleCloseDialog();
      const { data: users } = await supabase.rpc('get_user_details');
      if (users) setUsers(users);
    } catch (err) {
      setError("Erreur lors de la mise à jour du rôle");
      console.error(err);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Administration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[100],
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                Email
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  fontWeight: 600
                }}>
                  Nom
                </TableCell>
              )}
              <TableCell sx={{ 
                backgroundColor: theme.palette.grey[100],
                fontWeight: 600
              }}>
                Rôle
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ 
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: 600
                  }}>
                    Projets
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: theme.palette.grey[100],
                    fontWeight: 600
                  }}>
                    Date d'inscription
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                sx={{
                  backgroundColor: user.role === 'admin' 
                    ? alpha('#f44336', 0.04)
                    : 'inherit',
                  '&:hover': {
                    backgroundColor: user.role === 'admin' 
                      ? alpha('#f44336', 0.08)
                      : theme.palette.action.hover
                  }
                }}
              >
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {user.email}
                </TableCell>
                {!isMobile && (
                  <TableCell>{user.display_name || '-'}</TableCell>
                )}
                <TableCell>
                  <Box
                    component="button"
                    onClick={() => handleOpenDialog(user)}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      backgroundColor: user.role === 'admin' 
                        ? alpha('#f44336', 0.1)
                        : alpha('#2196f3', 0.1),
                      color: user.role === 'admin' 
                        ? 'error.main'
                        : 'primary.main',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: user.role === 'admin' 
                          ? alpha('#f44336', 0.2)
                          : alpha('#2196f3', 0.2),
                      }
                    }}
                  >
                    {user.role === 'admin' ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                    {user.role}
                  </Box>
                </TableCell>
                {!isMobile && (
                  <>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.project_count} projet{user.project_count !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="role-dialog-title"
      >
        <DialogTitle id="role-dialog-title">
          Modifier le rôle utilisateur
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.role === 'admin' 
              ? `Êtes-vous sûr de vouloir rétrograder ${selectedUser?.email} au rôle d'utilisateur ?`
              : `Êtes-vous sûr de vouloir promouvoir ${selectedUser?.email} au rôle d'administrateur ?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={() => selectedUser && toggleAdminRole(selectedUser.user_id, selectedUser.role)}
            color={selectedUser?.role === 'admin' ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            {selectedUser?.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 