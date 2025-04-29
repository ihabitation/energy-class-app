import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackButtonProps {
  to: string;
  hasUnsavedChanges?: boolean;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  hasUnsavedChanges = false,
  label = 'Retour'
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate(to);
    }
  };

  const handleConfirmBack = () => {
    setShowConfirmDialog(false);
    navigate(to);
  };

  const handleCancelBack = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ 
          mb: 2,
          fontSize: isMobile ? '0.875rem' : '1rem',
          textTransform: 'none'
        }}
      >
        {label}
      </Button>

      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelBack}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirmer le retour
        </DialogTitle>
        <DialogContent>
          <Typography>
            Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter cette page ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelBack}
            color="primary"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmBack}
            color="error"
            variant="contained"
          >
            Quitter sans sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BackButton; 