import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, MapPin, Navigation, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CourierLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

interface OrderStatus {
  status: string;
  estimatedArrival?: string;
  notes?: string;
  timestamp: string;
}

interface OrderTrackerProps {
  orderId: string;
  courierLocation: CourierLocation | null;
  orderStatus: OrderStatus | null;
  isConnected: boolean;
}

// Custom courier icon
const courierIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="4"/>
      <path d="M12 16L14.5 18.5L20 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Destination icon
const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="4"/>
      <path d="M16 8V24M8 16H24" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Map controller component
function MapController({ courierLocation }: { courierLocation: CourierLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (courierLocation) {
      map.setView([courierLocation.latitude, courierLocation.longitude], 15);
    }
  }, [courierLocation, map]);
  
  return null;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orderId,
  courierLocation,
  orderStatus,
  isConnected,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  
  // Default center (Istanbul)
  const defaultCenter: [number, number] = [41.0082, 28.9784];
  const mapCenter = courierLocation 
    ? [courierLocation.latitude, courierLocation.longitude] as [number, number]
    : defaultCenter;

  // Mock destination (in real app, this would come from order data)
  const destination = { latitude: 41.0200, longitude: 28.9850 };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'Bilinmiyor';
    return `${Math.round(speed)} km/h`;
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} saniye önce`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} dakika önce`;
    } else {
      return date.toLocaleTimeString('tr-TR');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Gerçek Zamanlı Takip</span>
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
              </span>
            </div>
            
            {/* Last Update */}
            {courierLocation && (
              <div className="text-sm text-gray-500">
                Son güncelleme: {formatLastUpdate(courierLocation.timestamp)}
              </div>
            )}
          </div>
        </div>
        
        {/* Courier Info */}
        {courierLocation && (
          <div className="mt-3 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Hız:</span>
              <span className="font-medium">{formatSpeed(courierLocation.speed)}</span>
            </div>
            
            {courierLocation.accuracy && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Doğruluk:</span>
                <span className="font-medium">±{Math.round(courierLocation.accuracy)}m</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="h-96 relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController courierLocation={courierLocation} />
          
          {/* Courier Marker */}
          {courierLocation && (
            <Marker
              position={[courierLocation.latitude, courierLocation.longitude]}
              icon={courierIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Kurye Konumu</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Hız:</strong> {formatSpeed(courierLocation.speed)}</p>
                    {courierLocation.heading && (
                      <p><strong>Yön:</strong> {Math.round(courierLocation.heading)}°</p>
                    )}
                    <p><strong>Son Güncelleme:</strong> {formatLastUpdate(courierLocation.timestamp)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Destination Marker */}
          <Marker
            position={[destination.latitude, destination.longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-2">Teslimat Adresi</h3>
                <p className="text-sm text-gray-600">
                  Sipariş #{orderId.slice(-8)} teslimat noktası
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        {/* Loading Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Bağlantı kuruluyor...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              courierLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className="text-sm font-medium text-gray-900">
              {courierLocation ? 'Kurye Aktif' : 'Konum Bekleniyor'}
            </span>
          </div>
          
          {orderStatus && (
            <div className="text-sm text-gray-600">
              Durum: <span className="font-medium">{orderStatus.status}</span>
              {orderStatus.estimatedArrival && (
                <span className="ml-2">
                  • Tahmini: {new Date(orderStatus.estimatedArrival).toLocaleTimeString('tr-TR')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};