import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
}) => {
  if (error) {
    return (
      <View style={[styles.container, styles.error]}>
        <Ionicons name="warning" size={16} color="#EF4444" />
        <Text style={styles.errorText}>Bağlantı Hatası</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isConnected ? styles.connected : styles.disconnected]}>
      <View style={[styles.indicator, isConnected ? styles.indicatorConnected : styles.indicatorDisconnected]} />
      <Text style={[styles.text, isConnected ? styles.connectedText : styles.disconnectedText]}>
        {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: '#ECFDF5',
  },
  disconnected: {
    backgroundColor: '#FEF2F2',
  },
  error: {
    backgroundColor: '#FEF2F2',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorConnected: {
    backgroundColor: '#10B981',
  },
  indicatorDisconnected: {
    backgroundColor: '#EF4444',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  connectedText: {
    color: '#065F46',
  },
  disconnectedText: {
    color: '#991B1B',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#991B1B',
    marginLeft: 4,
  },
});