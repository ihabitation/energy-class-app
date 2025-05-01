import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';

type ProjectShare = Database['public']['Tables']['project_shares']['Row'];

interface ProjectShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function ProjectShareDialog({ open, onClose, projectId }: ProjectShareDialogProps) {
  const { getProjectShares, shareProject, removeProjectShare, updateProjectShare } = useAuth();
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPermission, setNewUserPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, projectId]);

  const loadShares = async () => {
    try {
      const projectShares = await getProjectShares(projectId);
      setShares(projectShares);
    } catch (err) {
      setError('Erreur lors du chargement des partages');
    }
  };

  const handleAddShare = async () => {
    if (!newUserEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Rechercher l'utilisateur par email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUserEmail)
        .single();

      if (userError || !users) {
        throw new Error('Utilisateur non trouvé');
      }

      await shareProject(projectId, users.id, newUserPermission);
      await loadShares();
      setNewUserEmail('');
      setNewUserPermission('read');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du partage');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeProjectShare(shareId);
      await loadShares();
    } catch (err) {
      setError('Erreur lors de la suppression du partage');
    }
  };

  const handleUpdatePermission = async (shareId: string, permission: 'read' | 'write' | 'admin') => {
    try {
      await updateProjectShare(shareId, permission);
      await loadShares();
    } catch (err) {
      setError('Erreur lors de la mise à jour des permissions');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gérer les partages</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ajouter un utilisateur
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Email de l'utilisateur"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              fullWidth
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Permission</InputLabel>
              <Select
                value={newUserPermission}
                label="Permission"
                onChange={(e) => setNewUserPermission(e.target.value as 'read' | 'write' | 'admin')}
              >
                <MenuItem value="read">Lecture</MenuItem>
                <MenuItem value="write">Écriture</MenuItem>
                <MenuItem value="admin">Administration</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddShare}
              disabled={loading || !newUserEmail}
            >
              Ajouter
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Utilisateurs partagés
        </Typography>
        <List>
          {shares.map((share) => (
            <ListItem key={share.id}>
              <ListItemText
                primary={share.shared_with}
                secondary={`Permission: ${share.permission}`}
              />
              <ListItemSecondaryAction>
                <FormControl sx={{ mr: 2, minWidth: 120 }}>
                  <Select
                    value={share.permission}
                    size="small"
                    onChange={(e) => handleUpdatePermission(share.id, e.target.value as 'read' | 'write' | 'admin')}
                  >
                    <MenuItem value="read">Lecture</MenuItem>
                    <MenuItem value="write">Écriture</MenuItem>
                    <MenuItem value="admin">Administration</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveShare(share.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
} 