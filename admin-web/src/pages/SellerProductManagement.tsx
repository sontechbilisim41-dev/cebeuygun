import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Fab,
  Snackbar,
  Alert,
  InputAdornment,
  FormControlLabel,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSellerProductManagement } from '@/hooks/useSellerProductManagement';
import { ProductForm } from '@/components/seller/ProductForm';
import { BulkUploadModal } from '@/components/seller/BulkUploadModal';
import { ProductStatusChip } from '@/components/seller/ProductStatusChip';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  isOutOfStock: boolean;
  images: string[];
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
  menuCategory?: string;
  lastUpdated: string;
  isModified?: boolean;
}

const SellerProductManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    products,
    categories,
    loading,
    error,
    hasChanges,
    searchQuery,
    categoryFilter,
    setSearchQuery,
    setCategoryFilter,
    updateProduct,
    saveChanges,
    refreshProducts,
    addProduct,
    deleteProduct,
  } = useSellerProductManagement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Navigation menu items
  const menuItems = [
    { id: 'products', label: 'Ürünlerim', icon: <InventoryIcon />, active: true },
    { id: 'categories', label: 'Kategoriler', icon: <CategoryIcon /> },
    { id: 'analytics', label: 'Satış Analizi', icon: <AnalyticsIcon /> },
    { id: 'store', label: 'Mağaza Ayarları', icon: <StoreIcon /> },
    { id: 'settings', label: 'Hesap Ayarları', icon: <SettingsIcon /> },
    { id: 'help', label: 'Yardım', icon: <HelpIcon /> },
  ];

  const handleSaveChanges = async () => {
    try {
      await saveChanges();
      setSaveSuccess(true);
    } catch (error) {
      console.error('Save changes error:', error);
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleProductAdd = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleProductFormClose = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleProductFormSave = async (productData: any) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      handleProductFormClose();
      setSaveSuccess(true);
    } catch (error) {
      console.error('Product save error:', error);
    }
  };

  const getChangedProductsCount = () => {
    return products.filter(p => p.isModified).length;
  };

  const getOutOfStockCount = () => {
    return products.filter(p => p.isOutOfStock || p.stock === 0).length;
  };

  const getLowStockCount = () => {
    return products.filter(p => !p.isOutOfStock && p.stock > 0 && p.stock < 10).length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount / 100);
  };

  const renderNavigationMenu = () => (
    <List sx={{ pt: 0 }}>
      {menuItems.map((item) => (
        <ListItemButton
          key={item.id}
          selected={item.active}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: 'primary.100',
              color: 'primary.main',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText 
            primary={item.label}
            primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }}
          />
          {item.id === 'products' && hasChanges && (
            <Badge badgeContent={getChangedProductsCount()} color="warning" />
          )}
        </ListItemButton>
      ))}
    </List>
  );

  const renderStatisticsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="primary">
              {products.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Ürün
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="error.main">
              {getOutOfStockCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tükenen Ürün
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="warning.main">
              {getLowStockCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Az Stok
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="700" color="info.main">
              {getChangedProductsCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Değişen Ürün
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
              placeholder="Ürün adı ile ara..."
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
              <InputLabel>Kategori</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Kategori"
              >
                <MenuItem value="all">Tüm Kategoriler</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setBulkUploadOpen(true)}
              fullWidth={isMobile}
            >
              Excel ile Yükle
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleProductAdd}
              fullWidth={isMobile}
              size="large"
              sx={{ fontWeight: 600 }}
            >
              Yeni Ürün Ekle
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Ürün</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Kategori</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Fiyat (₺)</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Stok</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Durum</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Yayında</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow 
              key={product.id}
              sx={{
                bgcolor: product.isModified ? 'warning.50' : 'inherit',
                '&:hover': { bgcolor: product.isModified ? 'warning.100' : 'grey.50' },
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={product.images[0]}
                    sx={{ width: 50, height: 50, borderRadius: 2 }}
                    variant="rounded"
                  >
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.description.substring(0, 50)}...
                    </Typography>
                    {product.isModified && (
                      <Chip 
                        label="Değiştirildi" 
                        size="small" 
                        color="warning" 
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{product.category}</Typography>
                {product.menuCategory && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {product.menuCategory}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={product.price / 100}
                  onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) * 100 })}
                  size="small"
                  sx={{ width: 120 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={product.stock}
                  onChange={(e) => updateProduct(product.id, { stock: parseInt(e.target.value) || 0 })}
                  size="small"
                  sx={{ width: 100 }}
                  InputProps={{
                    inputProps: { min: 0, step: 1 }
                  }}
                />
              </TableCell>
              <TableCell>
                <ProductStatusChip 
                  stock={product.stock} 
                  isOutOfStock={product.isOutOfStock}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.isActive}
                  onChange={(e) => updateProduct(product.id, { isActive: e.target.checked })}
                  color="primary"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Düzenle">
                    <IconButton
                      size="small"
                      onClick={() => handleProductEdit(product)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Switch
                    checked={!product.isOutOfStock}
                    onChange={(e) => updateProduct(product.id, { isOutOfStock: !e.target.checked })}
                    color="error"
                    size="small"
                  />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {products.map((product) => (
        <Card 
          key={product.id}
          sx={{
            bgcolor: product.isModified ? 'warning.50' : 'inherit',
            border: product.isModified ? 2 : 1,
            borderColor: product.isModified ? 'warning.main' : 'divider',
          }}
        >
          <CardContent>
            {/* Product Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={product.images[0]}
                sx={{ width: 60, height: 60, borderRadius: 2 }}
                variant="rounded"
              >
                <ImageIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.category}
                </Typography>
                <ProductStatusChip 
                  stock={product.stock} 
                  isOutOfStock={product.isOutOfStock}
                />
                {product.isModified && (
                  <Chip 
                    label="Değiştirildi" 
                    size="small" 
                    color="warning" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <IconButton
                onClick={() => handleProductEdit(product)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Box>

            {/* Editable Fields */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label="Fiyat (₺)"
                  type="number"
                  value={product.price / 100}
                  onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) * 100 })}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Stok Adedi"
                  type="number"
                  value={product.stock}
                  onChange={(e) => updateProduct(product.id, { stock: parseInt(e.target.value) || 0 })}
                  fullWidth
                  size="small"
                  InputProps={{
                    inputProps: { min: 0, step: 1 }
                  }}
                />
              </Grid>
            </Grid>

            {/* Status Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={product.isActive}
                    onChange={(e) => updateProduct(product.id, { isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Yayında"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={!product.isOutOfStock}
                    onChange={(e) => updateProduct(product.id, { isOutOfStock: !e.target.checked })}
                    color="error"
                  />
                }
                label="Stokta"
                labelPlacement="start"
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderMainContent = () => (
    <Box sx={{ flex: 1, p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon />
          Stok & Fiyat Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ürünlerinizin stok miktarlarını ve fiyatlarını yönetin
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Save Changes Alert */}
      {hasChanges && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleSaveChanges}
              startIcon={<SaveIcon />}
            >
              Kaydet
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>{getChangedProductsCount()} ürün</strong> değiştirildi. 
            Değişiklikleri kaydetmeyi unutmayın!
          </Typography>
        </Alert>
      )}

      {/* Filter Section */}
      {renderFilterSection()}

      {/* Product List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Ürün Listesi ({products.length})
            </Typography>
            
            {hasChanges && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={loading}
                sx={{ fontWeight: 600 }}
              >
                Değişiklikleri Kaydet ({getChangedProductsCount()})
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Ürünler yükleniyor...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <InventoryIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz ürün eklenmemiş
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                İlk ürününüzü eklemek için başlayın
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleProductAdd}
                sx={{ mt: 2 }}
              >
                İlk Ürünü Ekle
              </Button>
            </Box>
          ) : (
            isMobile ? renderMobileCards() : renderDesktopTable()
          )}
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Satıcı Paneli
            </Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileMenuOpen : true}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="700" color="primary">
              Satıcı Paneli
            </Typography>
            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Mağaza Yönetimi
          </Typography>
        </Box>

        {/* Navigation Menu */}
        {renderNavigationMenu()}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          mt: isMobile ? 8 : 0,
        }}
      >
        {renderMainContent()}
      </Box>

      {/* Floating Action Button for Mobile */}
      {isMobile && hasChanges && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={handleSaveChanges}
          disabled={loading}
        >
          <SaveIcon />
        </Fab>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onClose={handleProductFormClose}
        onSave={handleProductFormSave}
        product={editingProduct}
        categories={categories}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onUpload={(file) => {
          // Handle bulk upload
          setBulkUploadOpen(false);
          setSaveSuccess(true);
        }}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Değişiklikler başarıyla kaydedildi!
        </Alert>
      </Snackbar>

      {/* Error Display */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default SellerProductManagement;