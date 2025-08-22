import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  Star as StarIcon,
  TrendingUp as SalesIcon,
  Assignment as OrdersIcon,
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface SellerDetailViewProps {
  seller: any;
  onSuspend: (sellerId: string) => Promise<void>;
  onActivate: (sellerId: string) => Promise<void>;
  onUpdateNotes: (sellerId: string, notes: string) => Promise<void>;
}

export const SellerDetailView: React.FC<SellerDetailViewProps> = ({
  seller,
  onSuspend,
  onActivate,
  onUpdateNotes,
}) => {
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState(seller.notes || '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <RestaurantIcon />;
      case 'market': return <LocalGroceryStoreIcon />;
      default: return <BusinessIcon />;
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

  const handleNotesUpdate = async () => {
    try {
      await onUpdateNotes(seller.id, notes);
      setNotesModalOpen(false);
    } catch (error) {
      console.error('Notes update error:', error);
    }
  };

  return (
    <Box>
      {/* Seller Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.100' }}>
              {getBusinessTypeIcon(seller.businessType)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="700" gutterBottom>
                {seller.businessName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {seller.ownerName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={getBusinessTypeText(seller.businessType)}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={seller.category}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Başvuru Tarihi
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {formatDate(seller.applicationDate)}
              </Typography>
              {seller.approvalDate && (
                <>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Onay Tarihi
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {formatDate(seller.approvalDate)}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {seller.status === 'active' && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<SuspendIcon />}
                onClick={() => onSuspend(seller.id)}
              >
                Askıya Al
              </Button>
            )}
            
            {seller.status === 'suspended' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<ActivateIcon />}
                onClick={() => onActivate(seller.id)}
              >
                Aktifleştir
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setNotesModalOpen(true)}
            >
              Not Ekle/Düzenle
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* İletişim Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon />
                İletişim Bilgileri
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={seller.email}
                    secondary="E-posta Adresi"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={seller.phone}
                    secondary="Telefon Numarası"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${seller.address.street}, ${seller.address.district}`}
                    secondary={`${seller.address.city} ${seller.address.postalCode}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={seller.taxNumber}
                    secondary="Vergi Kimlik Numarası"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performans Metrikleri */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SalesIcon />
                Performans Metrikleri
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="700" color="success.main">
                      {formatCurrency(seller.performance.totalSales)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Satış
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="700" color="primary.main">
                      {seller.performance.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Sipariş
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="700" color="warning.main">
                      {seller.performance.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama Puan
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="700" color="info.main">
                      %{seller.performance.completionRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tamamlama Oranı
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Yüklenen Belgeler */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DocumentIcon />
                Yüklenen Belgeler ({seller.documents.length})
              </Typography>
              
              <Grid container spacing={2}>
                {seller.documents.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { bgcolor: 'grey.50' },
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DocumentIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="600">
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(doc.uploadDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Notları */}
        {(seller.notes || seller.rejectionReason) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin Notları
                </Typography>
                
                {seller.notes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Not:</strong> {seller.notes}
                    </Typography>
                  </Alert>
                )}
                
                {seller.rejectionReason && (
                  <Alert severity="error">
                    <Typography variant="body2">
                      <strong>Red Sebebi:</strong> {seller.rejectionReason}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onClose={() => setNotesModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Admin Notu Ekle/Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Admin Notu"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Satıcı hakkında notunuzu yazın..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesModalOpen(false)}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleNotesUpdate}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};