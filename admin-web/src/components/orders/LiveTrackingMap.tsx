import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExIDlIMTNWMkgxMVY5Wk0xMyAxMEgxMVYyMkgxM1YxMFpNNiA5SDhWMkg2VjlaTTggMTBINlYyMkg4VjEwWiIgZmlsbD0iI0ZGNTcyMiIvPgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const customerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSA5VjIySDNWOUMzIDYuNzkgNC43OSA1IDcgNUgxN0MxOS4yMSA1IDIxIDYuNzkgMjEgOVoiIGZpbGw9IiMyMTk2RjMiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const courierIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDdIMTVWNS41QzE1IDQuNjcgMTQuMzMgNCAxMy41IDRIMTAuNUM5LjY3IDQgOSA0LjY3IDkgNS41VjdINUMzLjkgNyAzIDcuOSAzIDlWMTlDMyAyMC4xIDMuOSAyMSA1IDIxSDE5QzIwLjEgMjEgMjEgMjAuMSAyMSAxOVY5QzIxIDcuOSAyMC4xIDcgMTkgN1oiIGZpbGw9IiM0Q0FGNTASCZ8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface LiveTrackingMapProps {
  order: {
    seller: { name: string };
    deliveryAddress: {
      fullAddress: string;
      coordinates: { lat: number; lng: number };
    };
    courier?: {
      name: string;
      vehicle: string;
      currentLocation: { lat: number; lng: number };
    };
  };
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ order }) => {
  const [courierPosition, setCourierPosition] = useState(
    order.courier?.currentLocation || { lat: 41.0200, lng: 28.9900 }
  );

  // Simulate real-time courier movement
  useEffect(() => {
    if (!order.courier) return;

    const interval = setInterval(() => {
      setCourierPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [order.courier]);

  const restaurantPosition = { lat: 41.0082, lng: 28.9784 }; // Mock restaurant position
  const customerPosition = order.deliveryAddress.coordinates;

  const routePositions = [
    [restaurantPosition.lat, restaurantPosition.lng],
    [courierPosition.lat, courierPosition.lng],
    [customerPosition.lat, customerPosition.lng],
  ] as [number, number][];

  if (!order.courier) {
    return (
      <Alert severity="info">
        Bu sipariş için henüz kurye atanmamış veya teslimat takibi mevcut değil.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🗺️ Canlı Teslimat Takibi
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Kurye</Typography>
              <Typography variant="body1" fontWeight="600">
                {order.courier.name} - {order.courier.vehicle}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">Tahmini Varış</Typography>
              <Typography variant="body1" fontWeight="600" color="primary">
                ~15 dakika
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer
          center={[courierPosition.lat, courierPosition.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Restaurant/Store Marker */}
          <Marker position={[restaurantPosition.lat, restaurantPosition.lng]} icon={restaurantIcon}>
            <Popup>
              <div>
                <strong>🏪 {order.seller.name}</strong><br />
                Alım Noktası
              </div>
            </Popup>
          </Marker>
          
          {/* Customer Address Marker */}
          <Marker position={[customerPosition.lat, customerPosition.lng]} icon={customerIcon}>
            <Popup>
              <div>
                <strong>📍 Teslimat Adresi</strong><br />
                {order.deliveryAddress.fullAddress}
              </div>
            </Popup>
          </Marker>
          
          {/* Courier Location Marker */}
          <Marker position={[courierPosition.lat, courierPosition.lng]} icon={courierIcon}>
            <Popup>
              <div>
                <strong>🚗 {order.courier.name}</strong><br />
                {order.courier.vehicle}<br />
                <small>Canlı Konum</small>
              </div>
            </Popup>
          </Marker>
          
          {/* Route Line */}
          <Polyline
            positions={routePositions}
            color="#2196f3"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        </MapContainer>
      </Box>
    </Box>
  );
};