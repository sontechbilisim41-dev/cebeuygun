import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  estimatedArrival?: string;
}

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

interface OrderInfoProps {
  order: Order;
  orderStatus: OrderStatus | null;
  courierLocation: CourierLocation | null;
}

export const OrderInfo: React.FC<OrderInfoProps> = ({
  order,
  orderStatus,
  courierLocation,
}) => {
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

  const currentStatus = orderStatus?.status || order.status;

  return (
    <View style={styles.container}>
      {/* Status Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Sipariş Durumu</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(currentStatus) }]} />
          <Text style={styles.statusText}>{getStatusText(currentStatus)}</Text>
          
          {orderStatus?.timestamp && (
            <Text style={styles.timestampText}>
              {formatLastUpdate(orderStatus.timestamp)}
            </Text>
          )}
        </View>
        
        {orderStatus?.notes && (
          <Text style={styles.notesText}>{orderStatus.notes}</Text>
        )}
      </View>

      {/* Courier Location Section */}
      {courierLocation && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Kurye Bilgileri</Text>
          </View>
          
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Hız:</Text>
              <Text style={styles.locationValue}>
                {courierLocation.speed ? `${Math.round(courierLocation.speed)} km/h` : 'Durgun'}
              </Text>
            </View>
            
            {courierLocation.heading && (
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Yön:</Text>
                <Text style={styles.locationValue}>
                  {Math.round(courierLocation.heading)}°
                </Text>
              </View>
            )}
            
            {courierLocation.accuracy && (
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Doğruluk:</Text>
                <Text style={styles.locationValue}>
                  ±{Math.round(courierLocation.accuracy)}m
                </Text>
              </View>
            )}
            
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Son Güncelleme:</Text>
              <Text style={styles.locationValue}>
                {formatLastUpdate(courierLocation.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Estimated Arrival */}
      {(orderStatus?.estimatedArrival || order.estimatedArrival) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Tahmini Varış</Text>
          </View>
          
          <Text style={styles.arrivalTime}>
            {new Date(orderStatus?.estimatedArrival || order.estimatedArrival!).toLocaleTimeString('tr-TR')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  timestampText: {
    fontSize: 12,
    color: '#6B7280',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  locationInfo: {
    space: 8,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  arrivalTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
  },
});