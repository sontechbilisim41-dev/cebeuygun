import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface QuickActionsProps {
  hasActiveOrder: boolean;
  isOnline: boolean;
  onEarningsPress: () => void;
  onOrdersPress: () => void;
  onSettingsPress: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  hasActiveOrder,
  isOnline,
  onEarningsPress,
  onOrdersPress,
  onSettingsPress,
}) => {
  const actions = [
    {
      id: 'earnings',
      icon: 'wallet-outline',
      title: 'Kazançlar',
      subtitle: 'Günlük/haftalık',
      color: '#2ed573',
      onPress: onEarningsPress,
    },
    {
      id: 'orders',
      icon: 'list-outline',
      title: 'Siparişler',
      subtitle: hasActiveOrder ? 'Aktif var' : 'Geçmiş',
      color: '#667eea',
      onPress: onOrdersPress,
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      title: 'Ayarlar',
      subtitle: 'Profil & tercihler',
      color: '#5f27cd',
      onPress: onSettingsPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hızlı Erişim</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color="#a4b0be" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f3542',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
});