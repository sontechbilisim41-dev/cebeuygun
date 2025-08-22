import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Cancel as CancelIcon,
  Schedule as PendingIcon,
  LocalShipping as DeliveryIcon,
  Restaurant as PreparingIcon,
} from '@mui/icons-material';

interface OrderStatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ 
  status, 
  size = 'small' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'received':
        return {
          label: 'Sipariş Alındı',
          color: 'info' as const,
          icon: <PendingIcon />,
        };
      case 'preparing':
        return {
          label: 'Hazırlanıyor',
          color: 'warning' as const,
          icon: <PreparingIcon />,
        };
      case 'ready':
        return {
          label: 'Hazır',
          color: 'primary' as const,
          icon: <CheckCircle />,
        };
      case 'delivering':
        return {
          label: 'Teslim Ediliyor',
          color: 'secondary' as const,
          icon: <DeliveryIcon />,
        };
      case 'delivered':
        return {
          label: 'Teslim Edildi',
          color: 'success' as const,
          icon: <CompletedIcon />,
        };
      case 'cancelled':
        return {
          label: 'İptal Edildi',
          color: 'error' as const,
          icon: <CancelIcon />,
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: <PendingIcon />,
        };
    }
  };

  const config = getStatusConfig(status);

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