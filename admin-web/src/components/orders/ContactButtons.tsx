import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Message as MessageIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

interface ContactButtonsProps {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  courier?: {
    name: string;
    phone: string;
  };
  seller: {
    name: string;
    phone: string;
  };
  onContactCustomer: () => void;
  onContactCourier: () => void;
  onContactSeller: () => void;
  onStartSupport: () => void;
}

export const ContactButtons: React.FC<ContactButtonsProps> = ({
  customer,
  courier,
  seller,
  onContactCustomer,
  onContactCourier,
  onContactSeller,
  onStartSupport,
}) => {
  const handleWhatsAppCustomer = () => {
    const phone = customer.phone.replace(/\D/g, '');
    const message = encodeURIComponent('Merhaba, siparişiniz hakkında bilgi vermek istiyorum.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleEmailCustomer = () => {
    const subject = encodeURIComponent('Sipariş Bilgilendirme');
    const body = encodeURIComponent('Merhaba, siparişiniz hakkında bilgi vermek istiyorum.');
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📞 İletişim Seçenekleri
      </Typography>
      
      <Stack spacing={2}>
        {/* Customer Contact */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              👤 Müşteri: {customer.name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={onContactCustomer}
                color="primary"
                size="small"
              >
                Ara
              </Button>
              <Button
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                onClick={handleWhatsAppCustomer}
                color="success"
                size="small"
              >
                WhatsApp
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={handleEmailCustomer}
                size="small"
              >
                E-posta
              </Button>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={onStartSupport}
                color="info"
                size="small"
              >
                Destek Chat
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Courier Contact */}
        {courier ? (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                🚗 Kurye: {courier.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<PhoneIcon />}
                  onClick={onContactCourier}
                  color="secondary"
                  size="small"
                >
                  Kurye ile İletişime Geç
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  size="small"
                >
                  Mesaj Gönder
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="warning">
            Bu sipariş için henüz kurye atanmamış.
          </Alert>
        )}

        {/* Seller Contact */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              🏪 Satıcı: {seller.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={onContactSeller}
                size="small"
              >
                Satıcı ile İletişime Geç
              </Button>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                size="small"
              >
                Mesaj Gönder
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Emergency Actions */}
        <Alert severity="error">
          <Typography variant="subtitle2" gutterBottom>
            🚨 Acil Durum İşlemleri
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="error" size="small">
              Siparişi İptal Et
            </Button>
            <Button variant="outlined" color="error" size="small">
              Kurye Değiştir
            </Button>
          </Stack>
        </Alert>
      </Stack>
    </Box>
  );
};