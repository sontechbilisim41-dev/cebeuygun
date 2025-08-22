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
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Chip,
  Tooltip,
  InputAdornment,
  Fab,
  useMediaQuery,
  useTheme,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useStockPriceManagement } from '@/hooks/useStockPriceManagement';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isOutOfStock: boolean;
  category: string;
  image?: string;
  lastUpdated: string;
  isModified?: boolean;
}

const StockPriceManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    products,
    loading,
    error,
    hasChanges,
    searchQuery,
    setSearchQuery,
    updateProduct,
    saveChanges,
    refreshProducts,
    exportTemplate,
    importFromExcel,
  } = useStockPriceManagement();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  const handleSaveChanges = async () => {
    try {
      await saveChanges();
      setSaveSuccess(true);
    } catch (error) {
      console.error('Save changes error:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      await importFromExcel(selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSaveSuccess(true);
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    updateProduct(productId, { price: newPrice });
  };

  const handleStockChange = (productId: string, newStock: number) => {
    updateProduct(productId, { stock: newStock });
  };

  const handleOutOfStockToggle = (productId: string, isOutOfStock: boolean) => {
    updateProduct(productId, { isOutOfStock });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount / 100);
  };

  const getStockStatusColor = (stock: number, isOutOfStock: boolean) => {
    if (isOutOfStock) return 'error';
    if (stock === 0) return 'error';
    if (stock < 10) return 'warning';
    if (stock < 50) return 'info';
    return 'success';
  };

  const getStockStatusText = (stock: number, isOutOfStock: boolean) => {
    if (isOutOfStock) return 'Tükendi';
    if (stock === 0) return 'Stok Yok';
    if (stock < 10) return 'Az Stok';
    return 'Stokta';
  };

  const renderDesktopTable = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Ürün Adı</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>SKU</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Kategori</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Fiyat (₺)</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Stok Adedi</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Durum</TableCell>
            <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Tükendi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow 
              key={product.id}
              sx={{
                bgcolor: product.isModified ? 'warning.50' : 'inherit',
                '&:hover': { bgcolor: product.isModified ? 'warning.100' : 'grey.50' },
                transition: 'background-color 0.2s ease',
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {product.image && (
                    <Box
                      component="img"
                      src={product.image}
                      sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                    />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {product.name}
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
                <Typography variant="body2" fontFamily="monospace">
                  {product.sku}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {product.category}
                </Typography>
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={product.price / 100}
                  onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) * 100)}
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
                  onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{ width: 100 }}
                  InputProps={{
                    inputProps: { min: 0, step: 1 }
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={getStockStatusText(product.stock, product.isOutOfStock)}
                  color={getStockStatusColor(product.stock, product.isOutOfStock)}
                  size="small"
                  icon={product.stock < 10 ? <WarningIcon /> : <CheckIcon />}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={product.isOutOfStock}
                  onChange={(e) => handleOutOfStockToggle(product.id, e.target.checked)}
                  color="error"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {filteredProducts.map((product) => (
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
              {product.image && (
                <Box
                  component="img"
                  src={product.image}
                  sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover' }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku} • {product.category}
                </Typography>
                {product.isModified && (
                  <Chip 
                    label="Değiştirildi" 
                    size="small" 
                    color="warning" 
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Box>

            {/* Editable Fields */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Fiyat (₺)"
                  type="number"
                  value={product.price / 100}
                  onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) * 100)}
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
                  onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                  fullWidth
                  size="small"
                  InputProps={{
                    inputProps: { min: 0, step: 1 }
                  }}
                />
              </Grid>
            </Grid>

            {/* Status and Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Chip
                label={getStockStatusText(product.stock, product.isOutOfStock)}
                color={getStockStatusColor(product.stock, product.isOutOfStock)}
                size="small"
                icon={product.stock < 10 ? <WarningIcon /> : <CheckIcon />}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={product.isOutOfStock}
                    onChange={(e) => handleOutOfStockToggle(product.id, e.target.checked)}
                    color="error"
                  />
                }
                label="Tükendi"
                labelPlacement="start"
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderUploadDialog = () => (
    <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon />
          Excel ile Toplu Güncelleme
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Stok ve fiyatları toplu güncellemek için şablon dosyasını indirip doldurun, sonra yükleyin.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportTemplate}
            fullWidth
          >
            Şablon Dosyasını İndir
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Sonra
            </Typography>
          </Divider>

          <Box
            sx={{
              border: 2,
              borderColor: selectedFile ? 'success.main' : 'grey.300',
              borderStyle: 'dashed',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: selectedFile ? 'success.50' : 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            
            {selectedFile ? (
              <Box>
                <CheckIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" color="success.main" gutterBottom>
                  Dosya Seçildi
                </Typography>
                <Typography variant="body2">
                  {selectedFile.name}
                </Typography>
              </Box>
            ) : (
              <Box>
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Excel Dosyasını Seçin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  .xlsx, .xls veya .csv formatında
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUploadDialogOpen(false)}>
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleFileUpload}
          disabled={!selectedFile}
          startIcon={<UploadIcon />}
        >
          Yükle ve Güncelle
        </Button>
      </DialogActions>
    </Dialog>
  );

  const getChangedProductsCount = () => {
    return products.filter(p => p.isModified).length;
  };

  const getOutOfStockCount = () => {
    return products.filter(p => p.isOutOfStock || p.stock === 0).length;
  };

  const getLowStockCount = () => {
    return products.filter(p => !p.isOutOfStock && p.stock > 0 && p.stock < 10).length;
  };

  return (
    <Box sx={{ p: 3 }}>
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 2 }}>
                  <InventoryIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="700">
                    {products.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Ürün
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'error.100', borderRadius: 2 }}>
                  <TrendingDownIcon color="error" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="700">
                    {getOutOfStockCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tükenen Ürün
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'warning.100', borderRadius: 2 }}>
                  <WarningIcon color="warning" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="700">
                    {getLowStockCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Az Stok
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'info.100', borderRadius: 2 }}>
                  <EditIcon color="info" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="700">
                    {getChangedProductsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Değişen Ürün
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 2 
          }}>
            {/* Search */}
            <TextField
              placeholder="Ürün adı, SKU veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: isMobile ? 'auto' : 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSaveChanges}
                disabled={!hasChanges || loading}
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                Değişiklikleri Kaydet
                {hasChanges && (
                  <Chip 
                    label={getChangedProductsCount()} 
                    size="small" 
                    sx={{ ml: 1, bgcolor: 'white', color: 'primary.main' }}
                  />
                )}
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Excel ile Yükle
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={refreshProducts}
                disabled={loading}
              >
                Yenile
              </Button>
            </Box>
          </Box>

          {/* Changes Alert */}
          {hasChanges && (
            <Alert 
              severity="warning" 
              sx={{ mt: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleSaveChanges}>
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
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="600">
              Ürün Listesi ({filteredProducts.length})
            </Typography>
            
            {searchQuery && (
              <Chip
                label={`"${searchQuery}" için ${filteredProducts.length} sonuç`}
                onDelete={() => setSearchQuery('')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <InventoryIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz ürün eklenmemiş'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Farklı anahtar kelimeler deneyin' : 'İlk ürününüzü eklemek için başlayın'}
              </Typography>
            </Box>
          ) : (
            isMobile ? renderMobileCards() : renderDesktopTable()
          )}
        </CardContent>
      </Card>

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
          {loading ? <CircularProgress size={24} /> : <SaveIcon />}
        </Fab>
      )}

      {/* Upload Dialog */}
      {renderUploadDialog()}

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

export default StockPriceManagement;