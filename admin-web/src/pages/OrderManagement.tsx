import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Grid,
  Divider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Avatar,
  Stack,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  LocationOn as LocationIcon,
  Restaurant as RestaurantIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelIcon,
  Schedule as PendingIcon,
  DirectionsCar as CourierIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Types
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    type: 'restaurant' | 'store' | 'market';
    phone: string;
  };
  type: 'product' | 'food' | 'grocery';
  amount: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: 'received' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  deliveryAddress: {
    fullAddress: string;
    district: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  paymentMethod: {
    type: 'card' | 'cash' | 'wallet';
    details: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    notes?: string;
  }>;
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  courier?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    currentLocation: { lat: number; lng: number };
  };
  notes: string[];
}

interface FilterState {
  dateFrom: Date | null;
  dateTo: Date | null;
  status: string;
  sellerName: string;
  customerName: string;
  orderType: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: null,
    dateTo: null,
    status: 'all',
    sellerName: '',
    customerName: '',
    orderType: 'all',
  });

  // Mock data - in real app this would come from API
  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const loadOrders = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.date) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.date) <= filters.dateTo!
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Seller name filter
    if (filters.sellerName) {
      filtered = filtered.filter(order =>
        order.seller.name.toLowerCase().includes(filters.sellerName.toLowerCase())
      );
    }

    // Customer name filter
    if (filters.customerName) {
      filtered = filtered.filter(order =>
        order.customer.name.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Order type filter
    if (filters.orderType !== 'all') {
      filtered = filtered.filter(order => order.type === filters.orderType);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'info';
      case 'preparing': return 'warning';
      case 'ready': return 'primary';
      case 'delivering': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Sipariş Alındı';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'delivering': return 'Teslim Ediliyor';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'product': return 'Ürün';
      case 'food': return 'Yemek';
      case 'grocery': return 'Market';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'food': return '🍕';
      case 'grocery': return '🛒';
      default: return '📋';
    }
  };

  const handleOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Update order status
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus as any,
            timeline: [
              ...order.timeline,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: 'Admin tarafından güncellendi'
              }
            ]
          }
        : order
    ));
  };

  const handleContactCourier = (courier: any) => {
    window.open(`tel:${courier.phone}`);
  };

  const handleContactCustomer = (customer: any) => {
    window.open(`tel:${customer.phone}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const renderFilterSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          Filtreler
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Başlangıç Tarihi"
                value={filters.dateFrom}
                onChange={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <DatePicker
                label="Bitiş Tarihi"
                value={filters.dateTo}
                onChange={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sipariş Durumu</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Sipariş Durumu"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="received">Sipariş Alındı</MenuItem>
                <MenuItem value="preparing">Hazırlanıyor</MenuItem>
                <MenuItem value="ready">Hazır</MenuItem>
                <MenuItem value="delivering">Teslim Ediliyor</MenuItem>
                <MenuItem value="delivered">Teslim Edildi</MenuItem>
                <MenuItem value="cancelled">İptal Edildi</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Satıcı/Mağaza Adı"
              value={filters.sellerName}
              onChange={(e) => setFilters(prev => ({ ...prev, sellerName: e.target.value }))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Müşteri Adı"
              value={filters.customerName}
              onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sipariş Türü</InputLabel>
              <Select
                value={filters.orderType}
                onChange={(e) => setFilters(prev => ({ ...prev, orderType: e.target.value }))}
                label="Sipariş Türü"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="product">Ürün</MenuItem>
                <MenuItem value="food">Yemek</MenuItem>
                <MenuItem value="grocery">Market</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadOrders}
            disabled={loading}
          >
            Yenile
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => {/* Export functionality */}}
          >
            Dışa Aktar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderOrdersTable = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Sipariş Listesi ({filteredOrders.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['all', 'received', 'preparing', 'delivering', 'delivered'].map(status => {
              const count = status === 'all' 
                ? filteredOrders.length 
                : filteredOrders.filter(o => o.status === status).length;
              
              return (
                <Chip
                  key={status}
                  label={`${getStatusText(status === 'all' ? 'all' : status)} (${count})`}
                  color={filters.status === status ? 'primary' : 'default'}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                  size="small"
                />
              );
            })}
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Sipariş No</strong></TableCell>
                <TableCell><strong>Tarih/Saat</strong></TableCell>
                <TableCell><strong>Müşteri</strong></TableCell>
                <TableCell><strong>Satıcı/Mağaza</strong></TableCell>
                <TableCell><strong>Tür</strong></TableCell>
                <TableCell><strong>Tutar</strong></TableCell>
                <TableCell><strong>Durum</strong></TableCell>
                <TableCell><strong>Detay</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      #{order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {order.customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {order.seller.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.seller.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{getTypeIcon(order.type)}</span>
                      <Typography variant="body2">
                        {getTypeText(order.type)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {formatCurrency(order.amount.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOrderDetail(order)}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderOrderDetailDialog = () => {
    if (!selectedOrder) return null;

    return (
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="700">
              Sipariş Detayı - #{selectedOrder.orderNumber}
            </Typography>
            <Chip
              label={getStatusText(selectedOrder.status)}
              color={getStatusColor(selectedOrder.status) as any}
              size="medium"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Genel Bilgiler" />
            <Tab label="Ürünler" />
            <Tab label="Teslimat Takibi" />
            <Tab label="İletişim" />
          </Tabs>

          {/* Genel Bilgiler Tab */}
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {/* Delivery Address - Prominently Highlighted */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    📍 Teslimat Adresi
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedOrder.deliveryAddress.fullAddress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.deliveryAddress.district}, {selectedOrder.deliveryAddress.city}
                  </Typography>
                  {selectedOrder.deliveryAddress.instructions && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      <strong>Özel Talimatlar:</strong> {selectedOrder.deliveryAddress.instructions}
                    </Typography>
                  )}
                </Alert>
              </Grid>

              {/* Customer & Seller Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      👤 Müşteri Bilgileri
                    </Typography>
                    <Typography><strong>Ad:</strong> {selectedOrder.customer.name}</Typography>
                    <Typography><strong>Telefon:</strong> {selectedOrder.customer.phone}</Typography>
                    <Typography><strong>E-posta:</strong> {selectedOrder.customer.email}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🏪 Satıcı Bilgileri
                    </Typography>
                    <Typography><strong>Mağaza:</strong> {selectedOrder.seller.name}</Typography>
                    <Typography><strong>Telefon:</strong> {selectedOrder.seller.phone}</Typography>
                    <Typography><strong>Tür:</strong> {getTypeText(selectedOrder.type)}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      💳 Ödeme Bilgileri
                    </Typography>
                    <Typography><strong>Yöntem:</strong> {selectedOrder.paymentMethod.details}</Typography>
                    <Typography><strong>Ara Toplam:</strong> {formatCurrency(selectedOrder.amount.subtotal)}</Typography>
                    <Typography><strong>Teslimat Ücreti:</strong> {formatCurrency(selectedOrder.amount.deliveryFee)}</Typography>
                    <Typography><strong>Vergi:</strong> {formatCurrency(selectedOrder.amount.tax)}</Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      <strong>Toplam: {formatCurrency(selectedOrder.amount.total)}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Admin Controls */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ⚙️ Yönetim İşlemleri
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Durum Güncelle</InputLabel>
                      <Select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                        label="Durum Güncelle"
                      >
                        <MenuItem value="received">Sipariş Alındı</MenuItem>
                        <MenuItem value="preparing">Hazırlanıyor</MenuItem>
                        <MenuItem value="ready">Hazır</MenuItem>
                        <MenuItem value="delivering">Teslim Ediliyor</MenuItem>
                        <MenuItem value="delivered">Teslim Edildi</MenuItem>
                        <MenuItem value="cancelled">İptal Et</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Admin Notu Ekle"
                      placeholder="Sipariş hakkında not ekleyin..."
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Ürünler Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🛍️ Sipariş Ürünleri
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ürün</TableCell>
                      <TableCell align="center">Adet</TableCell>
                      <TableCell align="right">Birim Fiyat</TableCell>
                      <TableCell align="right">Toplam</TableCell>
                      <TableCell>Notlar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {item.image && (
                              <Avatar src={item.image} sx={{ width: 40, height: 40 }} />
                            )}
                            <Typography variant="body2" fontWeight="500">
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {formatCurrency(item.totalPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.notes || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Teslimat Takibi Tab */}
          {selectedTab === 2 && (
            <Grid container spacing={3}>
              {/* Order Timeline */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  📋 Sipariş Zaman Çizelgesi
                </Typography>
                <Timeline>
                  {selectedOrder.timeline.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={getStatusColor(event.status) as any}>
                          {event.status === 'delivered' && <CompletedIcon />}
                          {event.status === 'cancelled' && <CancelIcon />}
                          {event.status === 'delivering' && <DeliveryIcon />}
                          {!['delivered', 'cancelled', 'delivering'].includes(event.status) && <PendingIcon />}
                        </TimelineDot>
                        {index < selectedOrder.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight="600">
                          {getStatusText(event.status)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(event.timestamp)}
                        </Typography>
                        {event.note && (
                          <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                            {event.note}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Grid>

              {/* Live Map */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  🗺️ Canlı Takip
                </Typography>
                <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {selectedOrder.courier && (
                    <MapContainer
                      center={[selectedOrder.deliveryAddress.coordinates.lat, selectedOrder.deliveryAddress.coordinates.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Restaurant/Store Marker */}
                      <Marker position={[41.0082, 28.9784]}>
                        <Popup>
                          <div>
                            <strong>{selectedOrder.seller.name}</strong><br />
                            Alım Noktası
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Customer Address Marker */}
                      <Marker position={[selectedOrder.deliveryAddress.coordinates.lat, selectedOrder.deliveryAddress.coordinates.lng]}>
                        <Popup>
                          <div>
                            <strong>Teslimat Adresi</strong><br />
                            {selectedOrder.deliveryAddress.fullAddress}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Courier Location Marker */}
                      {selectedOrder.courier && (
                        <Marker position={[selectedOrder.courier.currentLocation.lat, selectedOrder.courier.currentLocation.lng]}>
                          <Popup>
                            <div>
                              <strong>{selectedOrder.courier.name}</strong><br />
                              Kurye - {selectedOrder.courier.vehicle}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      
                      {/* Route Line */}
                      <Polyline
                        positions={[
                          [41.0082, 28.9784],
                          [selectedOrder.courier?.currentLocation.lat || 41.0200, selectedOrder.courier?.currentLocation.lng || 28.9900],
                          [selectedOrder.deliveryAddress.coordinates.lat, selectedOrder.deliveryAddress.coordinates.lng]
                        ]}
                        color="blue"
                        weight={3}
                        opacity={0.7}
                      />
                    </MapContainer>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {/* İletişim Tab */}
          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📞 İletişim Seçenekleri
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<PhoneIcon />}
                        onClick={() => handleContactCustomer(selectedOrder.customer)}
                        fullWidth
                        color="primary"
                      >
                        Müşteri ile İletişime Geç
                      </Button>
                      
                      {selectedOrder.courier && (
                        <Button
                          variant="contained"
                          startIcon={<CourierIcon />}
                          onClick={() => handleContactCourier(selectedOrder.courier)}
                          fullWidth
                          color="secondary"
                        >
                          Kurye ile İletişime Geç
                        </Button>
                      )}
                      
                      <Button
                        variant="outlined"
                        startIcon={<PhoneIcon />}
                        onClick={() => window.open(`tel:${selectedOrder.seller.phone}`)}
                        fullWidth
                      >
                        Satıcı ile İletişime Geç
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<MessageIcon />}
                        fullWidth
                      >
                        Müşteri Desteği Başlat
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📝 Sipariş Notları
                    </Typography>
                    
                    {selectedOrder.notes.length > 0 ? (
                      <Box sx={{ mb: 2 }}>
                        {selectedOrder.notes.map((note, index) => (
                          <Alert key={index} severity="info" sx={{ mb: 1 }}>
                            {note}
                          </Alert>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Henüz not eklenmemiş
                      </Typography>
                    )}
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Yeni Not Ekle"
                      placeholder="Sipariş hakkında not ekleyin..."
                    />
                    <Button variant="contained" sx={{ mt: 1 }}>
                      Not Ekle
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            📋 Tüm Siparişler
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Platform genelindeki tüm siparişleri görüntüleyin ve yönetin
          </Typography>
        </Box>

        {/* Filters Section */}
        {renderFilterSection()}

        {/* Orders Table */}
        {renderOrdersTable()}

        {/* Order Detail Dialog */}
        {renderOrderDetailDialog()}
      </Box>
    </LocalizationProvider>
  );
};

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: 'order-001',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-20T18:30:00Z',
    customer: {
      id: 'cust-001',
      name: 'Ahmet Yılmaz',
      phone: '+90 555 123 4567',
      email: 'ahmet@example.com',
    },
    seller: {
      id: 'seller-001',
      name: 'Pizza Palace',
      type: 'restaurant',
      phone: '+90 212 555 0101',
    },
    type: 'food',
    amount: {
      subtotal: 4500,
      deliveryFee: 500,
      tax: 810,
      total: 5810,
      currency: 'TRY',
    },
    status: 'delivering',
    deliveryAddress: {
      fullAddress: 'Maslak Mah. Büyükdere Cad. No:255 Daire:12',
      district: 'Şişli',
      city: 'İstanbul',
      coordinates: { lat: 41.0369, lng: 28.9857 },
      instructions: 'Kapıcıya bırakabilirsiniz',
    },
    paymentMethod: {
      type: 'card',
      details: 'Kredi Kartı (**** 1234)',
    },
    items: [
      {
        id: 'item-001',
        name: 'Margherita Pizza (Büyük)',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ],
    timeline: [
      { status: 'received', timestamp: '2024-01-20T18:30:00Z' },
      { status: 'preparing', timestamp: '2024-01-20T18:35:00Z' },
      { status: 'ready', timestamp: '2024-01-20T18:50:00Z' },
      { status: 'delivering', timestamp: '2024-01-20T19:00:00Z', note: 'Kurye yola çıktı' },
    ],
    courier: {
      id: 'courier-001',
      name: 'Mehmet Kaya',
      phone: '+90 555 987 6543',
      vehicle: 'Motosiklet',
      currentLocation: { lat: 41.0200, lng: 28.9900 },
    },
    notes: ['Müşteri acil teslimat talep etti'],
  },
  {
    id: 'order-002',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-20T17:15:00Z',
    customer: {
      id: 'cust-002',
      name: 'Ayşe Demir',
      phone: '+90 555 789 0123',
      email: 'ayse@example.com',
    },
    seller: {
      id: 'seller-002',
      name: 'CarrefourSA',
      type: 'market',
      phone: '+90 212 555 0202',
    },
    type: 'grocery',
    amount: {
      subtotal: 12500,
      deliveryFee: 800,
      tax: 2250,
      total: 15550,
      currency: 'TRY',
    },
    status: 'delivered',
    deliveryAddress: {
      fullAddress: 'Eminönü Mah. Hobyar Cad. No:45 Kat:3',
      district: 'Fatih',
      city: 'İstanbul',
      coordinates: { lat: 41.0138, lng: 28.9497 },
    },
    paymentMethod: {
      type: 'cash',
      details: 'Nakit Ödeme',
    },
    items: [
      {
        id: 'item-002',
        name: 'Süt 1L',
        quantity: 2,
        unitPrice: 800,
        totalPrice: 1600,
      },
      {
        id: 'item-003',
        name: 'Ekmek',
        quantity: 3,
        unitPrice: 300,
        totalPrice: 900,
      },
      {
        id: 'item-004',
        name: 'Domates 1kg',
        quantity: 2,
        unitPrice: 1500,
        totalPrice: 3000,
      },
    ],
    timeline: [
      { status: 'received', timestamp: '2024-01-20T17:15:00Z' },
      { status: 'preparing', timestamp: '2024-01-20T17:20:00Z' },
      { status: 'ready', timestamp: '2024-01-20T17:35:00Z' },
      { status: 'delivering', timestamp: '2024-01-20T17:45:00Z' },
      { status: 'delivered', timestamp: '2024-01-20T18:10:00Z', note: 'Başarıyla teslim edildi' },
    ],
    notes: [],
  },
  {
    id: 'order-003',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-20T19:45:00Z',
    customer: {
      id: 'cust-003',
      name: 'Can Özkan',
      phone: '+90 555 456 7890',
      email: 'can@example.com',
    },
    seller: {
      id: 'seller-003',
      name: 'TechStore',
      type: 'store',
      phone: '+90 212 555 0303',
    },
    type: 'product',
    amount: {
      subtotal: 299900,
      deliveryFee: 0,
      tax: 53982,
      total: 353882,
      currency: 'TRY',
    },
    status: 'preparing',
    deliveryAddress: {
      fullAddress: 'Levent Mah. Büyükdere Cad. No:120 Plaza A Blok Kat:15',
      district: 'Beşiktaş',
      city: 'İstanbul',
      coordinates: { lat: 41.0431, lng: 29.0061 },
      instructions: 'Ofis saatleri: 09:00-18:00',
    },
    paymentMethod: {
      type: 'card',
      details: 'Kredi Kartı (**** 5678)',
    },
    items: [
      {
        id: 'item-005',
        name: 'iPhone 15 Pro Max 256GB',
        quantity: 1,
        unitPrice: 299900,
        totalPrice: 299900,
        image: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ],
    timeline: [
      { status: 'received', timestamp: '2024-01-20T19:45:00Z' },
      { status: 'preparing', timestamp: '2024-01-20T19:50:00Z', note: 'Ürün hazırlanıyor' },
    ],
    notes: ['Yüksek değerli ürün - özel dikkat'],
  },
];

export default OrderManagement;