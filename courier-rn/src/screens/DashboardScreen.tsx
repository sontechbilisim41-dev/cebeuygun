import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { OrderCard } from '@/components/orders/OrderCard';
import { EarningsCard } from '@/components/dashboard/EarningsCard';
import { StatusToggle } from '@/components/dashboard/StatusToggle';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LocationStatus } from '@/components/dashboard/LocationStatus';

// Store
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectUser,
  selectCourier,
  selectIsAuthenticated,
  selectIsOnline,
  updateCourierStatus,
  updateOnlineStatus,
} from '@/store/slices/authSlice';
import {
  selectActiveOrder,
  selectAvailableOrders,
  selectOrdersLoading,
  fetchAvailableOrders,
  fetchActiveOrders,
} from '@/store/slices/ordersSlice';
import {
  selectCurrentLocation,
  selectIsTracking,
  selectHasPermission,
  requestLocationPermission,
  startLocationTracking,
  stopLocationTracking,
} from '@/store/slices/locationSlice';
import {
  selectIsConnected,
  selectSyncQueue,
  selectIsSyncing,
} from '@/store/slices/networkSlice';
import {
  selectUnreadCount,
} from '@/store/slices/notificationSlice';

// API
import { useGetAnalyticsQuery, useGetDailyEarningsQuery } from '@/store/api/earningsApi';

// Types
import { RootStackParamList } from '@/types';

const { width } = Dimensions.get('window');

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const courier = useAppSelector(selectCourier);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOnline = useAppSelector(selectIsOnline);
  const activeOrder = useAppSelector(selectActiveOrder);
  const availableOrders = useAppSelector(selectAvailableOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const currentLocation = useAppSelector(selectCurrentLocation);
  const isTracking = useAppSelector(selectIsTracking);
  const hasLocationPermission = useAppSelector(selectHasPermission);
  const isConnected = useAppSelector(selectIsConnected);
  const syncQueue = useAppSelector(selectSyncQueue);
  const isSyncing = useAppSelector(selectIsSyncing);
  const unreadNotifications = useAppSelector(selectUnreadCount);
  
  const [refreshing, setRefreshing] = useState(false);
  
  // API queries
  const { data: analytics } = useGetAnalyticsQuery({ period: 'today' });
  const { data: dailyEarnings } = useGetDailyEarningsQuery({ days: 7 });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAvailableOrders());
      dispatch(fetchActiveOrders());
    }
  }, [isAuthenticated, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAvailableOrders()),
        dispatch(fetchActiveOrders()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusToggle = async (newOnlineStatus: boolean) => {
    try {
      if (newOnlineStatus) {
        // Going online - check location permission
        if (!hasLocationPermission) {
          const granted = await dispatch(requestLocationPermission()).unwrap();
          if (!granted) {
            Alert.alert(
              'Konum İzni Gerekli',
              'Çevrimiçi olmak için konum izni vermeniz gerekiyor.',
              [{ text: 'Tamam' }]
            );
            return;
          }
        }
        
        // Start location tracking
        await dispatch(startLocationTracking());
        await dispatch(updateOnlineStatus(true));
        await dispatch(updateCourierStatus('ACTIVE'));
      } else {
        // Going offline
        await dispatch(stopLocationTracking());
        await dispatch(updateOnlineStatus(false));
        await dispatch(updateCourierStatus('INACTIVE'));
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'Durum değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleNavigationPress = () => {
    if (activeOrder) {
      navigation.navigate('Navigation', { orderId: activeOrder.id });
    }
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const formatEarnings = (amount: number, currency: string) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        </View>
        
        <View style={styles.headerRight}>
          {/* Sync Status */}
          {!isConnected && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline" size={16} color="#ff4757" />
            </View>
          )}
          
          {isSyncing && (
            <View style={styles.syncIndicator}>
              <LoadingSpinner size="small" color="#667eea" />
            </View>
          )}
          
          {syncQueue.length > 0 && (
            <View style={styles.queueIndicator}>
              <Text style={styles.queueCount}>{syncQueue.length}</Text>
            </View>
          )}
          
          {/* Notifications */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <Ionicons name="notifications-outline" size={24} color="#2f3542" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {/* Status Toggle */}
        <View style={styles.statusSection}>
          <StatusToggle
            isOnline={isOnline}
            onToggle={handleStatusToggle}
            courierStatus={courier?.status || 'INACTIVE'}
          />
        </View>

        {/* Location Status */}
        <LocationStatus
          currentLocation={currentLocation}
          isTracking={isTracking}
          hasPermission={hasLocationPermission}
          onRequestPermission={() => dispatch(requestLocationPermission())}
        />

        {/* Active Order */}
        {activeOrder && (
          <View style={styles.activeOrderSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aktif Sipariş</Text>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={handleNavigationPress}
              >
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={styles.navigationButtonText}>Navigasyon</Text>
              </TouchableOpacity>
            </View>
            
            <OrderCard
              order={activeOrder}
              onPress={() => handleOrderPress(activeOrder.id)}
              showActions={true}
              isActive={true}
            />
          </View>
        )}

        {/* Quick Actions */}
        <QuickActions
          hasActiveOrder={!!activeOrder}
          isOnline={isOnline}
          onEarningsPress={() => navigation.navigate('Earnings')}
          onOrdersPress={() => navigation.navigate('Orders')}
          onSettingsPress={() => navigation.navigate('Settings')}
        />

        {/* Today's Earnings */}
        {dailyEarnings?.data && (
          <View style={styles.earningsSection}>
            <Text style={styles.sectionTitle}>Bugünkü Kazanç</Text>
            <EarningsCard
              totalAmount={dailyEarnings.data.totalAmount}
              orderCount={dailyEarnings.data.orderCount}
              averagePerOrder={dailyEarnings.data.averagePerOrder}
              onPress={() => navigation.navigate('Earnings')}
            />
          </View>
        )}

        {/* Available Orders */}
        {isOnline && availableOrders.length > 0 && (
          <View style={styles.availableOrdersSection}>
            <Text style={styles.sectionTitle}>
              Mevcut Siparişler ({availableOrders.length})
            </Text>
            
            {availableOrders.slice(0, 3).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order.id)}
                showActions={false}
                isActive={false}
              />
            ))}
            
            {availableOrders.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Orders')}
              >
                <Text style={styles.viewAllButtonText}>
                  Tümünü Gör ({availableOrders.length - 3} daha)
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#667eea" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Statistics */}
        {analytics?.data && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Bugünkü İstatistikler</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color="#2ed573" />
                <Text style={styles.statValue}>{analytics.data.completedOrders}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color="#ffa502" />
                <Text style={styles.statValue}>{analytics.data.totalOrders}</Text>
                <Text style={styles.statLabel}>Toplam Sipariş</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color="#ff6b6b" />
                <Text style={styles.statValue}>{analytics.data.averageRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Ortalama Puan</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="speedometer" size={24} color="#5f27cd" />
                <Text style={styles.statValue}>{analytics.data.totalDistance.toFixed(1)}km</Text>
                <Text style={styles.statLabel}>Mesafe</Text>
              </View>
            </View>
          </View>
        )}

        {/* Empty State */}
        {isOnline && availableOrders.length === 0 && !activeOrder && !ordersLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle" size={60} color="#a4b0be" />
            <Text style={styles.emptyStateTitle}>Yeni sipariş bekleniyor</Text>
            <Text style={styles.emptyStateDescription}>
              Çevrimiçi durumdasınız. Yeni siparişler geldiğinde bildirim alacaksınız.
            </Text>
          </View>
        )}

        {/* Offline State */}
        {!isOnline && (
          <View style={styles.offlineState}>
            <Ionicons name="moon" size={60} color="#a4b0be" />
            <Text style={styles.offlineStateTitle}>Çevrimdışı Durumdasınız</Text>
            <Text style={styles.offlineStateDescription}>
              Sipariş almak için çevrimiçi duruma geçin.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f3542',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  offlineIndicator: {
    padding: 4,
  },
  syncIndicator: {
    padding: 4,
  },
  queueIndicator: {
    backgroundColor: '#ffa502',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  queueCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: 20,
  },
  activeOrderSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f3542',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  navigationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  earningsSection: {
    padding: 20,
    paddingTop: 0,
  },
  availableOrdersSection: {
    padding: 20,
    paddingTop: 0,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f3542',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  offlineState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  offlineStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
    marginTop: 16,
    marginBottom: 8,
  },
  offlineStateDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});