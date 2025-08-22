import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Money } from '@/types';

interface EarningsCardProps {
  totalAmount: Money;
  orderCount: number;
  averagePerOrder: Money;
  onPress: () => void;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  totalAmount,
  orderCount,
  averagePerOrder,
  onPress,
}) => {
  const formatPrice = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#2ed573', '#17c0eb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="wallet" size={24} color="#fff" />
            </View>
            <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
              <Text style={styles.detailsButtonText}>Detaylar</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.earningsSection}>
            <Text style={styles.earningsLabel}>Bugünkü Kazanç</Text>
            <Text style={styles.earningsAmount}>
              {formatPrice(totalAmount.amount, totalAmount.currency)}
            </Text>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orderCount}</Text>
              <Text style={styles.statLabel}>Sipariş</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatPrice(averagePerOrder.amount, averagePerOrder.currency)}
              </Text>
              <Text style={styles.statLabel}>Ortalama</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  earningsSection: {
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
});