import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
} from '@mui/material';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  notes?: string;
}

interface OrderItemsListProps {
  items: OrderItem[];
  currency: string;
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({ 
  items, 
  currency 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        🛍️ Sipariş Ürünleri ({items.length} ürün)
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Ürün</strong></TableCell>
              <TableCell align="center"><strong>Adet</strong></TableCell>
              <TableCell align="right"><strong>Birim Fiyat</strong></TableCell>
              <TableCell align="right"><strong>Toplam</strong></TableCell>
              <TableCell><strong>Notlar</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {item.image ? (
                      <Avatar 
                        src={item.image} 
                        sx={{ width: 50, height: 50 }}
                        variant="rounded"
                      />
                    ) : (
                      <Avatar 
                        sx={{ width: 50, height: 50, bgcolor: 'grey.200' }}
                        variant="rounded"
                      >
                        📦
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ürün #{index + 1}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={item.quantity} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="500">
                    {formatCurrency(item.unitPrice)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="700" color="primary">
                    {formatCurrency(item.totalPrice)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {item.notes ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {item.notes}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {/* Total Row */}
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell colSpan={3}>
                <Typography variant="h6" fontWeight="700">
                  Genel Toplam
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" fontWeight="700" color="primary">
                  {formatCurrency(getTotalAmount())}
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};