import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import {
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

interface StockStatusIndicatorProps {
  stock: number;
  isOutOfStock: boolean;
  showText?: boolean;
  size?: 'small' | 'medium';
}

export const StockStatusIndicator: React.FC<StockStatusIndicatorProps> = ({
  stock,
  isOutOfStock,
  showText = true,
  size = 'small',
}) => {
  const getStockConfig = () => {
    if (isOutOfStock) {
      return {
        label: 'Tükendi',
        color: 'error' as const,
        icon: <ErrorIcon />,
        description: 'Ürün müşterilere gösterilmiyor',
      };
    }
    
    if (stock === 0) {
      return {
        label: 'Stok Yok',
        color: 'error' as const,
        icon: <ErrorIcon />,
        description: 'Stok tükendi, yenileme gerekli',
      };
    }
    
    if (stock < 10) {
      return {
        label: 'Az Stok',
        color: 'warning' as const,
        icon: <WarningIcon />,
        description: 'Stok azalıyor, yenileme önerilir',
      };
    }
    
    if (stock < 50) {
      return {
        label: 'Orta Stok',
        color: 'info' as const,
        icon: <InventoryIcon />,
        description: 'Stok durumu normal',
      };
    }
    
    return {
      label: 'Bol Stok',
      color: 'success' as const,
      icon: <CheckIcon />,
      description: 'Stok durumu iyi',
    };
  };

  const config = getStockConfig();

  if (!showText) {
    return (
      <Chip
        label={config.label}
        color={config.color}
        size={size}
        icon={config.icon}
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <Box>
      <Chip
        label={config.label}
        color={config.color}
        size={size}
        icon={config.icon}
        sx={{ fontWeight: 600, mb: 0.5 }}
      />
      <Typography variant="caption" color="text.secondary" display="block">
        {config.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Mevcut: {stock} adet
      </Typography>
    </Box>
  );
};