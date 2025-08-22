import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocket } from './src/hooks/useWebSocket';
import { ConnectionStatus } from './src/components/ConnectionStatus';
import { OrderInfo } from './src/components/OrderInfo';

interface Order {
  id: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  estimatedArrival?: string;
}

const mockOrders: Order[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'assigned',
    customerName: 'Ahmet Yılmaz',
    deliveryAddress: 'Beyoğlu, İstanbul',
    estimatedArrival: '2025-01-18T15:30:00Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    status: 'on_the_way',
    customerName: 'Fatma Demir',
    deliveryAddress: 'Kadıköy, İstanbul',
    estimatedArrival: '2025-01-18T15:45:00Z',
  },
];

export default function App() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(mockOrders[0].id);
  const [selectedOrder, setSelectedOrder] = useState<Order>(mockOrders[0]);
  const [showOrderList, setShowOrderList] = useState(false);

  const {
    isConnected,
    courierLocation,
    orderStatus,
    connectionError,
    subscribeToOrder,
  } = useWebSocket();

  useEffect(() => {
    const order = mockOrders.find(o => o.id === selectedOrderId);
    if (order) {
      setSelectedOrder(order);
      subscribeToOrder(selectedOrderId);
    }
  }, [selectedOrderId, subscribeToOrder]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderList(false);
  };

  // Default map region (Istanbul)
  const defaultRegion = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mapRegion = courierLocation
    ? {
        latitude: courierLocation.latitude,
        longitude: courierLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : defaultRegion;

  // Mock destination
  const destination = { latitude: 41.0200, longitude: 28.9850 };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={24} color="#3B82F6" />
          <Text style={styles.headerTitle}>Sipariş Takip</Text>
        </View>
        <ConnectionStatus isConnected={isConnected} error={connectionError} />
      </View>

      {/* Order Selector */}
      <View style={styles.orderSelector}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => setShowOrderList(!showOrderList)}
        >
          <View style={styles.orderButtonContent}>
            <View>
              <Text style={styles.orderButtonTitle}>
                Sipariş #{selectedOrder.id.slice(-8)}
              </Text>
              <Text style={styles.orderButtonSubtitle}>
                {selectedOrder.customerName}
              </Text>
            </View>
            <Ionicons 
              name={showOrderList ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </View>
        </TouchableOpacity>

        {showOrderList && (
          <ScrollView style={styles.orderList}>
            {mockOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderItem,
                  selectedOrderId === order.id && styles.orderItemSelected,
                ]}
                onPress={() => handleOrderSelect(order.id)}
              >
                <View style={styles.orderItemContent}>
                  <Text style={styles.orderItemTitle}>
                    #{order.id.slice(-8)}
                  </Text>
                  <Text style={styles.orderItemCustomer}>
                    {order.customerName}
                  </Text>
                  <Text style={styles.orderItemAddress}>
                    {order.deliveryAddress}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* Courier Marker */}
          {courierLocation && (
            <Marker
              coordinate={{
                latitude: courierLocation.latitude,
                longitude: courierLocation.longitude,
              }}
              title="Kurye"
              description={`Hız: ${courierLocation.speed ? Math.round(courierLocation.speed) : 0} km/h`}
              pinColor="#3B82F6"
            />
          )}

          {/* Destination Marker */}
          <Marker
            coordinate={destination}
            title="Teslimat Adresi"
            description={selectedOrder.deliveryAddress}
            pinColor="#EF4444"
          />
        </MapView>

        {/* Map Overlay Info */}
        {courierLocation && (
          <View style={styles.mapOverlay}>
            <View style={styles.courierInfo}>
              <Ionicons name="car" size={16} color="#3B82F6" />
              <Text style={styles.courierInfoText}>
                {courierLocation.speed ? `${Math.round(courierLocation.speed)} km/h` : 'Durgun'}
              </Text>
              {courierLocation.accuracy && (
                <Text style={styles.accuracyText}>
                  ±{Math.round(courierLocation.accuracy)}m
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Order Info */}
      <OrderInfo
        order={selectedOrder}
        orderStatus={orderStatus}
        courierLocation={courierLocation}
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return '#10B981';
    case 'on_the_way':
      return '#3B82F6';
    case 'picked_up':
      return '#F59E0B';
    case 'assigned':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'Teslim Edildi';
    case 'on_the_way':
      return 'Yolda';
    case 'picked_up':
      return 'Alındı';
    case 'assigned':
      return 'Kurye Atandı';
    default:
      return 'Hazırlanıyor';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  orderSelector: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderButton: {
    padding: 16,
  },
  orderButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  orderList: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  orderItemCustomer: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItemAddress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
  accuracyText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 8,
  },
});