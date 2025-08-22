import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface SellerApprovalModalProps {
  open: boolean;
  onClose: () => void;
  seller: any;
  action: 'approve' | 'reject';
  onSubmit: (note: string) => Promise<void>;
}

export const SellerApprovalModal: React.FC<SellerApprovalModalProps> = ({
  open,
  onClose,
  seller,
  action,
  onSubmit,
}) => {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === 'reject' && !note.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(note);
      setNote('');
      onClose();
    } catch (error) {
      console.error('Approval submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getBusinessTypeText = (type: string) => {
    switch (type) {
      case 'marketplace': return 'Pazaryeri Satıcısı';
      case 'restaurant': return 'Restoran';
      case 'market': return 'Market';
      default: return type;
    }
  };

  if (!seller) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {action === 'approve' ? (
            <ApproveIcon color="success" />
          ) : (
            <RejectIcon color="error" />
          )}
          <Typography variant="h6" fontWeight="700">
            {action === 'approve' ? 'Satıcıyı Onayla' : 'Başvuruyu Reddet'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Seller Summary */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.100' }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {seller.businessName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {seller.ownerName} - {getBusinessTypeText(seller.businessType)}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{seller.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{seller.phone}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="primary" />
                  <Typography variant="body2">
                    {seller.address.street}, {seller.address.district}, {seller.address.city}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Documents Summary */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocumentIcon />
              Yüklenen Belgeler ({seller.documents.length})
            </Typography>
            
            <List dense>
              {seller.documents.map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemIcon>
                    <DocumentIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={doc.name}
                    secondary={`Yükleme: ${new Date(doc.uploadDate).toLocaleDateString('tr-TR')}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Action Confirmation */}
        <Alert 
          severity={action === 'approve' ? 'success' : 'warning'}
          icon={action === 'approve' ? <ApproveIcon /> : <WarningIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            {action === 'approve' 
              ? 'Bu satıcıyı onayladığınızda platformda satış yapmaya başlayabilecek.'
              : 'Bu başvuruyu reddettiğinizde satıcı platformda satış yapamayacak.'
            }
          </Typography>
        </Alert>

        {/* Note Input */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={action === 'approve' ? 'Onay Notu (İsteğe Bağlı)' : 'Red Sebebi (Zorunlu)'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            action === 'approve' 
              ? 'Onay ile ilgili notunuzu yazabilirsiniz...'
              : 'Red sebebini detaylı olarak açıklayın...'
          }
          required={action === 'reject'}
          error={action === 'reject' && !note.trim()}
          helperText={
            action === 'reject' && !note.trim() 
              ? 'Red sebebi zorunludur' 
              : ''
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          İptal
        </Button>
        <Button
          variant="contained"
          color={action === 'approve' ? 'success' : 'error'}
          onClick={handleSubmit}
          disabled={submitting || (action === 'reject' && !note.trim())}
          startIcon={action === 'approve' ? <ApproveIcon /> : <RejectIcon />}
        >
          {submitting 
            ? 'İşleniyor...' 
            : action === 'approve' 
              ? 'Onayla' 
              : 'Reddet'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};