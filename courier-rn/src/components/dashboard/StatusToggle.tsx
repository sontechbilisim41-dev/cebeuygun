import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Courier } from '@/types';

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: (isOnline: boolean) => void;
  courierStatus: Courier['status'];
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  isOnline,
  onToggle,
  courierStatus,
}) => {
  const animatedValue = React.useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOnline ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOnline]);

  const getStatusText = () => {
    if (!isOnline) return 'Çevrimdışı';
    
    switch (courierStatus) {
      case 'ACTIVE': return 'Aktif - Sipariş Alıyor';
      case 'BUSY': return 'Meşgul - Teslimat Yapıyor';
      case 'INACTIVE': return 'Pasif';
      case 'OFFLINE': return 'Çevrimdışı';
      case 'UNAVAILABLE': return 'Müsait Değil';
      default: return 'Bilinmeyen Durum';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return '#6c757d';
    
    switch (courierStatus) {
      case 'ACTIVE': return '#2ed573';
      case 'BUSY': return '#ffa502';
      case 'INACTIVE': return '#6c757d';
      case 'OFFLINE': return '#ff4757';
      case 'UNAVAILABLE': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const toggleBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e9ecef', '#2ed573'],
  });

  const toggleTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 34],
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusInfo}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        <Text style={styles.statusDescription}>
          {isOnline 
            ? 'Yeni siparişler için hazırsınız' 
            : 'Sipariş almak için çevrimiçi olun'
          }
        </Text>
      </View>

      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => onToggle(!isOnline)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleBackground,
            { backgroundColor: toggleBackgroundColor },
          ]}
        >
          <Animated.View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: toggleTranslateX }] },
            ]}
          >
            <Ionicons
              name={isOnline ? 'checkmark' : 'close'}
              size={16}
              color={isOnline ? '#2ed573' : '#6c757d'}
            />
          </Animated.View>
        </Animated.View>
        
        <Text style={styles.toggleLabel}>
          {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusInfo: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f3542',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleBackground: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'absolute',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
});