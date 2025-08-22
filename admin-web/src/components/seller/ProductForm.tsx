import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Restaurant as RestaurantIcon,
  Store as StoreIcon,
  LocalGroceryStore as GroceryIcon,
} from '@mui/icons-material';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  product?: any;
  categories: Array<{ id: string; name: string; type?: string }>;
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSave,
  product,
  categories,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    menuCategory: '',
    price: 0,
    stock: 0,
    isActive: true,
    isOutOfStock: false,
    images: [] as string[],
    variants: [] as ProductVariant[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const menuCategories = [
    'Çorbalar',
    'Salatalar',
    'Ana Yemekler',
    'Kebaplar',
    'Pideler',
    'Tatlılar',
    'İçecekler',
    'Aperatifler',
    'Kahvaltı',
    'Atıştırmalıklar',
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        menuCategory: product.menuCategory || '',
        price: product.price || 0,
        stock: product.stock || 0,
        isActive: product.isActive ?? true,
        isOutOfStock: product.isOutOfStock ?? false,
        images: product.images || [],
        variants: product.variants || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        menuCategory: '',
        price: 0,
        stock: 0,
        isActive: true,
        isOutOfStock: false,
        images: [],
        variants: [],
      });
    }
    setActiveStep(0);
    setErrors({});
  }, [product, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gerekli';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ürün açıklaması gerekli';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Açıklama 500 karakterden uzun olamaz';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gerekli';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Geçerli bir fiyat girin';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stok miktarı negatif olamaz';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'En az bir ürün görseli gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: '',
      price: formData.price,
      stock: 0,
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(variant =>
        variant.id === variantId ? { ...variant, ...updates } : variant
      ),
    }));
  };

  const removeVariant = (variantId: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== variantId),
    }));
  };

  const addImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType) {
      case 'food': return <RestaurantIcon />;
      case 'grocery': return <GroceryIcon />;
      default: return <StoreIcon />;
    }
  };

  const isRestaurantCategory = () => {
    const selectedCategory = categories.find(c => c.id === formData.category);
    return selectedCategory?.type === 'food';
  };

  const steps = [
    {
      label: 'Temel Bilgiler',
      description: 'Ürün adı, açıklama ve kategori',
    },
    {
      label: 'Fiyat & Stok',
      description: 'Fiyatlandırma ve stok yönetimi',
    },
    {
      label: 'Görseller',
      description: 'Ürün fotoğrafları',
    },
    {
      label: 'Varyantlar',
      description: 'Renk, beden gibi seçenekler',
    },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="700">
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Basic Information */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                Temel Bilgiler
              </Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Ürün Adı *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="Örn: Margherita Pizza (Büyük)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Ürün Açıklaması *"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description || `${formData.description.length}/500 karakter`}
                    placeholder="Ürününüzün detaylı açıklamasını yazın..."
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Kategori Seç *</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Kategori Seç *"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(category.type || 'product')}
                            {category.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {isRestaurantCategory() && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Menü Kategorisi</InputLabel>
                      <Select
                        value={formData.menuCategory}
                        onChange={(e) => handleInputChange('menuCategory', e.target.value)}
                        label="Menü Kategorisi"
                      >
                        {menuCategories.map((menuCat) => (
                          <MenuItem key={menuCat} value={menuCat}>
                            {menuCat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                  disabled={!formData.name || !formData.description || !formData.category}
                >
                  Devam Et
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Price & Stock */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                Fiyat & Stok
              </Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fiyat (TL) *"
                    type="number"
                    value={formData.price / 100}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) * 100)}
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Stok Miktarı *"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    fullWidth
                    error={!!errors.stock}
                    helperText={errors.stock}
                    InputProps={{
                      inputProps: { min: 0, step: 1 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Ürün Yayında"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isOutOfStock}
                          onChange={(e) => handleInputChange('isOutOfStock', e.target.checked)}
                          color="error"
                        />
                      }
                      label="Tükendi"
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={() => setActiveStep(0)}>
                  Geri
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                  disabled={formData.price <= 0}
                >
                  Devam Et
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Images */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                Ürün Görselleri
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  En az 1, en fazla 5 görsel ekleyebilirsiniz
                </Typography>
                
                {/* Image Upload Area */}
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                  }}
                  onClick={() => {
                    // Mock image upload - in real app would open file picker
                    const mockImages = [
                      'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
                      'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
                    ];
                    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
                    addImage(randomImage);
                  }}
                >
                  <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Görsel Yükle
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sürükle bırak veya tıklayarak seç
                  </Typography>
                </Card>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Yüklenen Görseller ({formData.images.length}/5)
                    </Typography>
                    <Grid container spacing={1}>
                      {formData.images.map((image, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Card variant="outlined">
                            <Box sx={{ position: 'relative' }}>
                              <Box
                                component="img"
                                src={image}
                                sx={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'error.dark' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {errors.images && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errors.images}
                  </Alert>
                )}
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={() => setActiveStep(1)}>
                  Geri
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(3)}
                  disabled={formData.images.length === 0}
                >
                  Devam Et
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Variants */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                Varyantlar (İsteğe Bağlı)
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ürününüzün farklı seçenekleri varsa (renk, beden, boyut) ekleyebilirsiniz
                </Typography>

                {formData.variants.length === 0 ? (
                  <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Henüz varyant eklenmemiş
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addVariant}
                    >
                      İlk Varyantı Ekle
                    </Button>
                  </Card>
                ) : (
                  <Box>
                    {formData.variants.map((variant, index) => (
                      <Card key={variant.id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              Varyant {index + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeVariant(variant.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                label="Varyant Adı"
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                                fullWidth
                                size="small"
                                placeholder="Örn: Kırmızı, Büyük, XL"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                label="Fiyat (₺)"
                                type="number"
                                value={variant.price / 100}
                                onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) * 100 })}
                                fullWidth
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                                }}
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                label="Stok"
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                                fullWidth
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addVariant}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Yeni Varyant Ekle
                    </Button>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={() => setActiveStep(2)}>
                  Geri
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Ürün Ekle')}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};