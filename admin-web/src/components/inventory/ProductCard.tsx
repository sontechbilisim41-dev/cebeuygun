import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Chip,
  Avatar,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isOutOfStock: boolean;
  category: string;
  image?: string;
  isModified?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPriceChange: (productId: string, price: number) => void;
  onStockChange: (productId: string, stock: number) => void;
  onOutOfStockToggle: (productId: string, isOutOfStock: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPriceChange,
  onStockChange,
  onOutOfStockToggle,
}) => {
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

  const getStockIcon = (stock: number, isOutOfStock: boolean) => {
    if (isOutOfStock || stock === 0) return <ErrorIcon />;
    if (stock < 10) return <WarningIcon />;
    return <CheckIcon />;
  };

  return (
    <Card 
      sx={{
        bgcolor: product.isModified ? 'warning.50' : 'inherit',
        border: product.isModified ? 2 : 1,
        borderColor: product.isModified ? 'warning.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        {/* Product Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={product.image}
            sx={{ width: 60, height: 60, borderRadius: 2 }}
            variant="rounded"
          >
            📦
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              SKU: {product.sku}
            </Typography>
            <Chip 
              label={product.category} 
              size="small" 
              color="primary" 
              variant="outlined"
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
        </Box>

        {/* Editable Fields */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Fiyat (₺)"
              type="number"
              value={product.price / 100}
              onChange={(e) => onPriceChange(product.id, parseFloat(e.target.value) * 100)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: product.isModified ? 'warning.100' : 'inherit',
                },
              }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              label="Stok Adedi"
              type="number"
              value={product.stock}
              onChange={(e) => onStockChange(product.id, parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 1 }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: product.isModified ? 'warning.100' : 'inherit',
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Status and Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={getStockStatusText(product.stock, product.isOutOfStock)}
            color={getStockStatusColor(product.stock, product.isOutOfStock)}
            size="small"
            icon={getStockIcon(product.stock, product.isOutOfStock)}
            sx={{ fontWeight: 600 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={product.isOutOfStock}
                onChange={(e) => onOutOfStockToggle(product.id, e.target.checked)}
                color="error"
              />
            }
            label="Tükendi"
            labelPlacement="start"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontWeight: 600,
                color: product.isOutOfStock ? 'error.main' : 'text.primary',
              },
            }}
          />
        </Box>

        {/* Last Updated */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Son güncelleme: {new Date(product.lastUpdated).toLocaleString('tr-TR')}
        </Typography>
      </CardContent>
    </Card>
  );
};