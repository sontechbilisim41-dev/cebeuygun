import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Location } from '@/types';

interface LocationStatusProps {
  currentLocation: Location | null;
  isTracking: boolean;
  hasPermission: boolean;
  onRequestPermission: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({
  currentLocation,
  isTracking,
  hasPermission,
  onRequestPermission,
}) => {
  const getLocationStatusText = () => {
    if (!hasPermission) return 'Konum izni gerekli';
    if (!currentLocation) return 'Konum alınıyor...';
    if (isTracking) return 'Konum takip ediliyor';
    return 'Konum hazır';
  };

  const getLocationStatusColor = () => {
    if (!hasPermission) return '#ff4757';
    if (!currentLocation) return '#ffa502';
    if (isTracking) return '#2ed573';
    return '#667eea';
  };

  const getLocationAccuracyText = () => {
    if (!currentLocation) return '';
    
    const accuracy = currentLocation.accuracy || 0;
    if (accuracy < 10) return 'Yüksek doğruluk';
    if (accuracy < 50) return 'Orta doğruluk';
    return 'Düşük doğruluk';
  };

  const handleLocationPress = () => {
    if (!hasPermission) {
      Alert.alert(
        'Konum İzni',
        'Konum takibi için izin vermeniz gerekiyor. İzin vermek istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'İzin Ver', onPress: onRequestPermission },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleLocationPress}
      disabled={hasPermission}
      activeOpacity={hasPermission ? 1 : 0.7}
    >
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getLocationStatusColor() }]} />
          <Text style={styles.statusText}>{getLocationStatusText()}</Text>
          
          {!hasPermission && (
            <Ionicons name="chevron-forward" size={16} color="#667eea" />
          )}
        </View>

        {currentLocation && (
          <View style={styles.locationDetails}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6c757d" />
              <Text style={styles.coordinatesText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="radio-outline" size={14} color="#6c757d" />
              <Text style={styles.accuracyText}>
                {getLocationAccuracyText()} ({(currentLocation.accuracy || 0).toFixed(0)}m)
              </Text>
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="time-outline" size={14} color="#6c757d" />
              <Text style={styles.timestampText}>
                {new Date(currentLocation.timestamp).toLocaleTimeString('tr-TR')}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#2f3542',
  },
  locationDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: '#6c757d',
  },
  timestampText: {
    fontSize: 12,
    color: '#6c757d',
  },
});