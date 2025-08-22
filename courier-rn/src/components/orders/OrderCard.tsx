import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Order } from '@/types';

const { width } = Dimensions.get('window');

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  showActions?: boolean;
  isActive?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  showActions = false,
  isActive = false,
}) => {
  const formatPrice = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'assigned': return '#667eea';
      case 'accepted': return '#2ed573';
      case 'picked_up': return '#5f27cd';
      case 'en_route': return '#00d2d3';
      case 'delivered': return '#2ed573';
      case 'cancelled': return '#ff4757';
      case 'failed': return '#ff4757';
      default: return '#a4b0be';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'assigned': return 'Atandı';
      case 'accepted': return 'Kabul Edildi';
      case 'picked_up': return 'Alındı';
      case 'en_route': return 'Yolda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      case 'failed': return 'Başarısız';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent': return 'flash';
      case 'high': return 'arrow-up';
      case 'normal': return 'remove';
      case 'low': return 'arrow-down';
      default: return 'remove';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ffa502';
      case 'normal': return '#667eea';
      case 'low': return '#a4b0be';
      default: return '#a4b0be';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.activeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.restaurantName, isActive && styles.activeText]}>
              {order.restaurantName}
            </Text>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderId, isActive && styles.activeSubText]}>
                #{order.id.slice(-6)}
              </Text>
              <View style={styles.separator} />
              <View style={styles.priorityBadge}>
                <Ionicons 
                  name={getPriorityIcon(order.priority)} 
                  size={12} 
                  color={isActive ? '#fff' : getPriorityColor(order.priority)} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : getStatusColor(order.status) }]}>
              <Text style={[styles.statusText, isActive && { color: '#fff' }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Ionicons 
              name="person" 
              size={16} 
              color={isActive ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.customerName, isActive && styles.activeSubText]}>
              {order.customerName}
            </Text>
          </View>
          
          <View style={styles.customerInfo}>
            <Ionicons 
              name="call" 
              size={16} 
              color={isActive ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.customerPhone, isActive && styles.activeSubText]}>
              {order.customerPhone}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <Ionicons 
                name="restaurant" 
                size={14} 
                color={isActive ? '#fff' : '#2ed573'} 
              />
            </View>
            <Text style={[styles.addressText, isActive && styles.activeSubText]} numberOfLines={2}>
              {order.pickupAddress.address}
            </Text>
          </View>
          
          <View style={styles.routeLine} />
          
          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <Ionicons 
                name="location" 
                size={14} 
                color={isActive ? '#fff' : '#ff4757'} 
              />
            </View>
            <Text style={[styles.addressText, isActive && styles.activeSubText]} numberOfLines={2}>
              {order.deliveryAddress.address}
            </Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons 
                name="cash" 
                size={16} 
                color={isActive ? '#fff' : '#2ed573'} 
              />
              <Text style={[styles.detailValue, isActive && styles.activeText]}>
                {formatPrice(order.totalAmount.amount, order.totalAmount.currency)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons 
                name="location" 
                size={16} 
                color={isActive ? '#fff' : '#667eea'} 
              />
              <Text style={[styles.detailValue, isActive && styles.activeText]}>
                {order.distance.toFixed(1)} km
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons 
                name="time" 
                size={16} 
                color={isActive ? '#fff' : '#ffa502'} 
              />
              <Text style={[styles.detailValue, isActive && styles.activeText]}>
                {order.estimatedDuration} dk
              </Text>
            </View>
          </View>
        </View>

        {/* Times */}
        <View style={styles.timesSection}>
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, isActive && styles.activeSubText]}>
              Alım Zamanı
            </Text>
            <Text style={[styles.timeValue, isActive && styles.activeText]}>
              {formatTime(order.estimatedPickupTime)}
            </Text>
          </View>
          
          <View style={styles.timeItem}>
            <Text style={[styles.timeLabel, isActive && styles.activeSubText]}>
              Teslimat Zamanı
            </Text>
            <Text style={[styles.timeValue, isActive && styles.activeText]}>
              {formatTime(order.estimatedDeliveryTime)}
            </Text>
          </View>
        </View>

        {/* Items Count */}
        <View style={styles.itemsSection}>
          <Ionicons 
            name="bag" 
            size={14} 
            color={isActive ? '#fff' : '#6c757d'} 
          />
          <Text style={[styles.itemsText, isActive && styles.activeSubText]}>
            {order.items.length} ürün
          </Text>
          
          {order.specialInstructions && (
            <>
              <View style={styles.separator} />
              <Ionicons 
                name="chatbubble" 
                size={14} 
                color={isActive ? '#fff' : '#ffa502'} 
              />
              <Text style={[styles.instructionsText, isActive && styles.activeSubText]}>
                Özel not var
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  activeContainer: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  activeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f3542',
    marginBottom: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dee2e6',
  },
  priorityBadge: {
    padding: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  customerSection: {
    marginBottom: 12,
    gap: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f3542',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  addressSection: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#2f3542',
    lineHeight: 18,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#dee2e6',
    marginLeft: 11,
    marginVertical: 4,
  },
  detailsSection: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f3542',
  },
  timesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f3542',
  },
  itemsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemsText: {
    fontSize: 12,
    color: '#6c757d',
  },
  instructionsText: {
    fontSize: 12,
    color: '#ffa502',
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
  },
  activeSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});