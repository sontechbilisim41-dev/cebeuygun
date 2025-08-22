import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Store as StoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface OrderSummaryCardProps {
  order: {
    orderNumber: string;
    date: string;
    customer: { name: string; phone: string };
    seller: { name: string; type: string };
    type: string;
    amount: {
      subtotal: number;
      deliveryFee: number;
      tax: number;
      total: number;
      currency: string;
    };
    status: string;
    deliveryAddress: {
      fullAddress: string;
      district: string;
      city: string;
    };
    paymentMethod: { details: string };
  };
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: order.amount.currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'product': return 'Ürün';
      case 'food': return 'Yemek';
      case 'grocery': return 'Market';
      default: return type;
    }
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

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Sipariş #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(order.date)}
            </Typography>
          </Box>
          <Chip
            label={getStatusText(order.status)}
            color={getStatusColor(order.status) as any}
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Customer Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="600">Müşteri</Typography>
            </Box>
            <Typography variant="body2">{order.customer.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {order.customer.phone}
            </Typography>
          </Grid>

          {/* Seller Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StoreIcon color="secondary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="600">Satıcı</Typography>
            </Box>
            <Typography variant="body2">{order.seller.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getTypeText(order.type)}
            </Typography>
          </Grid>

          {/* Payment Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PaymentIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="600">Ödeme</Typography>
            </Box>
            <Typography variant="body2" fontWeight="700" color="success.main">
              {formatCurrency(order.amount.total)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.paymentMethod.details}
            </Typography>
          </Grid>

          {/* Delivery Address */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon color="error" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="600">Teslimat</Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
              {order.deliveryAddress.fullAddress}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.deliveryAddress.district}, {order.deliveryAddress.city}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Amount Breakdown */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Ara Toplam</Typography>
            <Typography variant="body2" fontWeight="600">
              {formatCurrency(order.amount.subtotal)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Teslimat Ücreti</Typography>
            <Typography variant="body2" fontWeight="600">
              {formatCurrency(order.amount.deliveryFee)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Vergi</Typography>
            <Typography variant="body2" fontWeight="600">
              {formatCurrency(order.amount.tax)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Genel Toplam</Typography>
            <Typography variant="h6" fontWeight="700" color="primary">
              {formatCurrency(order.amount.total)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};