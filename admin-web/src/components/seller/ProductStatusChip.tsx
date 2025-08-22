import React from 'react';
import { Chip } from '@mui/material';
import {
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

interface ProductStatusChipProps {
  stock: number;
  isOutOfStock: boolean;
  size?: 'small' | 'medium';
}

export const ProductStatusChip: React.FC<ProductStatusChipProps> = ({
  stock,
  isOutOfStock,
  size = 'small',
}) => {
  const getStatusConfig = () => {
    if (isOutOfStock) {
      return {
        label: 'Tükendi',
        color: 'error' as const,
        icon: <ErrorIcon />,
      };
    }
    
    if (stock === 0) {
      return {
        label: 'Stok Yok',
        color: 'error' as const,
        icon: <ErrorIcon />,
      };
    }
    
    if (stock < 10) {
      return {
        label: 'Az Stok',
        color: 'warning' as const,
        icon: <WarningIcon />,
      };
    }
    
    if (stock < 50) {
      return {
        label: 'Orta Stok',
        color: 'info' as const,
        icon: <InventoryIcon />,
      };
    }
    
    return {
      label: 'Bol Stok',
      color: 'success' as const,
      icon: <CheckIcon />,
    };
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{ 
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        },
      }}
    />
  );
};