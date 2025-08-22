import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Avatar,
  Stack,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Fab,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Edit as EditIcon,
  Block as SuspendIcon,
  Store as StoreIcon,
  Restaurant as RestaurantIcon,
  LocalGroceryStore as MarketIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  Star as StarIcon,
  TrendingUp as SalesIcon,
  Assignment as OrdersIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useSellerManagement } from '@/hooks/useSellerManagement';

interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: 'marketplace' | 'restaurant' | 'market';
  category: string;
  address: {
    street: string;
    district: string;
    city: string;
    postalCode: string;
  };
  taxNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'active';
  applicationDate: string;
  approvalDate?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }>;
  performance: {
    totalSales: number;
    totalOrders: number;
    averageRating: number;
    completionRate: number;
  };
  notes?: string;
  rejectionReason?: string;
}

const SellerManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    pendingSellers,
    activeSellers,
    loading,
    error,
    searchQuery,
    statusFilter,
    typeFilter,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    approveSeller,
    rejectSeller,
    suspendSeller,
    refreshSellers,
  } = useSellerManagement();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSellerDetail = (seller: Seller) => {
    setSelectedSeller(seller);
    setDetailModalOpen(true);
  };

  const handleApprovalAction = (seller: Seller, action: 'approve' | 'reject') => {
    setSelectedSeller(seller);
    setApprovalAction(action);
    setApprovalNote('');
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedSeller) return;

    try {
      if (approvalAction === 'approve') {
        await approveSeller(selectedSeller.id, approvalNote);
        setSuccessMessage('Satıcı başarıyla onaylandı');
      } else {
        await rejectSeller(selectedSeller.id, approvalNote);
        setSuccessMessage('Satıcı başvurusu reddedildi');
      }
      
      setApprovalModalOpen(false);
      setSelectedSeller(null);
      setApprovalNote('');
    } catch (error) {
      console.error('Approval action error:', error);
    }
  };

  const handleSuspendSeller = async (sellerId: string) => {
    try {
      await suspendSeller(sellerId);
      setSuccessMessage('Satıcı askıya alındı');
    } catch (error) {
      console.error('Suspend seller error:', error);
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <RestaurantIcon />;
      case 'market': return <MarketIcon />;
      default: return <StoreIcon />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'active': return 'success';
      case 'rejected': return 'error';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'active': return 'Aktif';
      case 'rejected': return 'Reddedildi';
      case 'suspended': return 'Askıya Alındı';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const renderStatisticsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="warning.main">
              {pendingSellers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Onay Bekleyen
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="success.main">
              {activeSellers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktif Satıcı
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="info.main">
              {activeSellers.filter(s => s.businessType === 'restaurant').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Restoran
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="primary.main">
              {activeSellers.filter(s => s.businessType === 'market').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Market
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilterSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="İşletme adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Durum"
              >
                <MenuItem value="all">Tüm Durumlar</MenuItem>
                <MenuItem value="pending">Onay Bekleyen</MenuItem>
                <MenuItem value="approved">Onaylandı</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="suspended">Askıya Alındı</MenuItem>
                <MenuItem value="rejected">Reddedildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>İşletme Türü</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="İşletme Türü"
              >
                <MenuItem value="all">Tüm Türler</MenuItem>
                <MenuItem value="marketplace">Pazaryeri Satıcısı</MenuItem>
                <MenuItem value="restaurant">Restoran</MenuItem>
                <MenuItem value="market">Market</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshSellers}
              disabled={loading}
              fullWidth={isMobile}
            >
              Yenile
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPendingSellersTable = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>İşletme Adı</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Tür</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Başvuru Tarihi</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Durum</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingSellers.map((seller) => (
            <TableRow 
              key={seller.id}
              sx={{
                bgcolor: seller.status === 'pending' ? 'warning.50' : 'inherit',
                '&:hover': { bgcolor: seller.status === 'pending' ? 'warning.100' : 'grey.50' },
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.100' }}>
                    {getBusinessTypeIcon(seller.businessType)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {seller.businessName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {seller.ownerName}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={getBusinessTypeText(seller.businessType)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(seller.applicationDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(seller.status)}
                  color={getStatusColor(seller.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Detayları Gör">
                    <IconButton
                      size="small"
                      onClick={() => handleSellerDetail(seller)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {seller.status === 'pending' && (
                    <>
                      <Tooltip title="Onayla">
                        <IconButton
                          size="small"
                          onClick={() => handleApprovalAction(seller, 'approve')}
                          color="success"
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Reddet">
                        <IconButton
                          size="small"
                          onClick={() => handleApprovalAction(seller, 'reject')}
                          color="error"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderActiveSellersCards = () => (
    <Grid container spacing={2}>
      {activeSellers.map((seller) => (
        <Grid item xs={12} sm={6} md={4} key={seller.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { 
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => handleSellerDetail(seller)}
          >
            <CardContent>
              {/* Seller Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.100', width: 50, height: 50 }}>
                  {getBusinessTypeIcon(seller.businessType)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    {seller.businessName}
                  </Typography>
                  <Chip
                    label={getBusinessTypeText(seller.businessType)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Chip
                  label={getStatusText(seller.status)}
                  color={getStatusColor(seller.status) as any}
                  size="small"
                />
              </Box>

              {/* Performance Metrics */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="700" color="success.main">
                      {formatCurrency(seller.performance.totalSales)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Satış
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="700" color="primary.main">
                      {seller.performance.totalOrders}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sipariş Sayısı
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Rating and Location */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon color="warning" fontSize="small" />
                  <Typography variant="body2" fontWeight="600">
                    {seller.performance.averageRating.toFixed(1)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {seller.address.district}, {seller.address.city}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSellerDetailModal = () => {
    if (!selectedSeller) return null;

    return (
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="700">
              {selectedSeller.businessName} - Detaylar
            </Typography>
            <Chip
              label={getStatusText(selectedSeller.status)}
              color={getStatusColor(selectedSeller.status) as any}
              size="medium"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={0} sx={{ mb: 3 }}>
            <Tab label="Genel Bilgiler" />
            <Tab label="Belgeler" />
            <Tab label="Performans" />
            <Tab label="İşlemler" />
          </Tabs>

          {/* Genel Bilgiler */}
          <Grid container spacing={3}>
            {/* İşletme Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    İşletme Bilgileri
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Firma Ünvanı</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedSeller.businessName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Sahip/Yetkili</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedSeller.ownerName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Vergi Kimlik No</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedSeller.taxNumber}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">İşletme Türü</Typography>
                      <Typography variant="body2" fontWeight="600">{getBusinessTypeText(selectedSeller.businessType)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Kategori</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedSeller.category}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* İletişim Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon />
                    İletişim Bilgileri
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="primary" />
                      <Typography variant="body2">{selectedSeller.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="primary" />
                      <Typography variant="body2">{selectedSeller.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body2">{selectedSeller.address.street}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedSeller.address.district}, {selectedSeller.address.city} {selectedSeller.address.postalCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Belgeler */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocumentIcon />
                    Yüklenen Belgeler ({selectedSeller.documents.length})
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {selectedSeller.documents.map((doc) => (
                      <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
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

            {/* Performans Metrikleri */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SalesIcon />
                    Performans Metrikleri
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="700" color="success.main">
                          {formatCurrency(selectedSeller.performance.totalSales)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Toplam Satış
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="700" color="primary.main">
                          {selectedSeller.performance.totalOrders}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Toplam Sipariş
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="700" color="warning.main">
                          {selectedSeller.performance.averageRating.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ortalama Puan
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="700" color="info.main">
                          %{selectedSeller.performance.completionRate}
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
          </Grid>

          {/* Admin Notları */}
          {selectedSeller.notes && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Admin Notu:</strong> {selectedSeller.notes}
              </Typography>
            </Alert>
          )}

          {selectedSeller.rejectionReason && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Red Sebebi:</strong> {selectedSeller.rejectionReason}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          {selectedSeller.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleApprovalAction(selectedSeller, 'approve')}
              >
                Onayla
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleApprovalAction(selectedSeller, 'reject')}
              >
                Reddet
              </Button>
            </>
          )}
          
          {selectedSeller.status === 'active' && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<SuspendIcon />}
              onClick={() => handleSuspendSeller(selectedSeller.id)}
            >
              Askıya Al
            </Button>
          )}
          
          <Button onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderApprovalModal = () => (
    <Dialog open={approvalModalOpen} onClose={() => setApprovalModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {approvalAction === 'approve' ? 'Satıcıyı Onayla' : 'Başvuruyu Reddet'}
      </DialogTitle>
      <DialogContent>
        {selectedSeller && (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>{selectedSeller.businessName}</strong> işletmesinin başvurusunu{' '}
              {approvalAction === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label={approvalAction === 'approve' ? 'Onay Notu (İsteğe Bağlı)' : 'Red Sebebi (Zorunlu)'}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder={
                approvalAction === 'approve' 
                  ? 'Onay ile ilgili notunuzu yazabilirsiniz...'
                  : 'Red sebebini detaylı olarak açıklayın...'
              }
              sx={{ mt: 2 }}
              required={approvalAction === 'reject'}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setApprovalModalOpen(false)}>
          İptal
        </Button>
        <Button
          variant="contained"
          color={approvalAction === 'approve' ? 'success' : 'error'}
          onClick={handleApprovalSubmit}
          disabled={approvalAction === 'reject' && !approvalNote.trim()}
        >
          {approvalAction === 'approve' ? 'Onayla' : 'Reddet'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon />
          Satıcı Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Platform satıcılarını onaylayın ve yönetin
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Pending Approval Alert */}
      {pendingSellers.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setSelectedTab(0)}
            >
              İncele
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>{pendingSellers.length} satıcı</strong> onay bekliyor. 
            Başvuruları inceleyip onaylayın veya reddedin.
          </Typography>
        </Alert>
      )}

      {/* Filter Section */}
      {renderFilterSection()}

      {/* Main Content */}
      <Card>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={pendingSellers.length} color="warning">
                Onay Bekleyen Satıcılar
              </Badge>
            } 
          />
          <Tab label={`Aktif Satıcılar (${activeSellers.length})`} />
        </Tabs>

        <CardContent>
          {/* Onay Bekleyen Satıcılar Tab */}
          {selectedTab === 0 && (
            <Box>
              {pendingSellers.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Onay bekleyen satıcı bulunmuyor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tüm başvurular işlenmiş durumda
                  </Typography>
                </Box>
              ) : (
                renderPendingSellersTable()
              )}
            </Box>
          )}

          {/* Aktif Satıcılar Tab */}
          {selectedTab === 1 && (
            <Box>
              {activeSellers.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <StoreIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Henüz aktif satıcı bulunmuyor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Satıcı başvurularını onaylayarak platform büyütün
                  </Typography>
                </Box>
              ) : (
                renderActiveSellersCards()
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Seller Detail Modal */}
      {renderSellerDetailModal()}

      {/* Approval Modal */}
      {renderApprovalModal()}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerManagement;