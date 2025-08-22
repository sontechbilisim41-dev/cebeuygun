import React from 'react';
import { Chip, Box } from '@mui/material';

interface OrderTypeChipProps {
  type: 'product' | 'food' | 'grocery';
  size?: 'small' | 'medium';
}

export const OrderTypeChip: React.FC<OrderTypeChipProps> = ({ 
  type, 
  size = 'small' 
}) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'product':
        return {
          label: 'Ürün',
          color: 'primary' as const,
          emoji: '📦',
          bgColor: '#e3f2fd',
        };
      case 'food':
        return {
          label: 'Yemek',
          color: 'warning' as const,
          emoji: '🍕',
          bgColor: '#fff3e0',
        };
      case 'grocery':
        return {
          label: 'Market',
          color: 'success' as const,
          emoji: '🛒',
          bgColor: '#e8f5e8',
        };
      default:
        return {
          label: type,
          color: 'default' as const,
          emoji: '📋',
          bgColor: '#f5f5f5',
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <span style={{ fontSize: size === 'small' ? 16 : 20 }}>
        {config.emoji}
      </span>
      <Chip
        label={config.label}
        color={config.color}
        size={size}
        sx={{
          fontWeight: 600,
          backgroundColor: config.bgColor,
        }}
      />
    </Box>
  );
};