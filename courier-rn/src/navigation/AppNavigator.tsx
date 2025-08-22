import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectIsAuthenticated, loadStoredAuth } from '@/store/slices/authSlice';
import { initializeNetworkListener } from '@/store/slices/networkSlice';

// Screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { OrdersScreen } from '@/screens/orders/OrdersScreen';
import { OrderDetailsScreen } from '@/screens/orders/OrderDetailsScreen';
import { NavigationScreen } from '@/screens/orders/NavigationScreen';
import { DeliveryConfirmationScreen } from '@/screens/orders/DeliveryConfirmationScreen';
import { EarningsScreen } from '@/screens/earnings/EarningsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { WorkingHoursScreen } from '@/screens/profile/WorkingHoursScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { SupportScreen } from '@/screens/support/SupportScreen';

// Components
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Types
import { RootStackParamList, TabParamList } from '@/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Orders':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Earnings':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#a4b0be',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ tabBarLabel: 'Siparişler' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{ tabBarLabel: 'Kazançlar' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize network listener
        await dispatch(initializeNetworkListener());
        
        // Try to load stored authentication
        await dispatch(loadStoredAuth());
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner text="Uygulama başlatılıyor..." overlay />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="OrderDetails" 
              component={OrderDetailsScreen}
              options={{
                headerShown: true,
                title: 'Sipariş Detayları',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="Navigation" 
              component={NavigationScreen}
              options={{
                headerShown: true,
                title: 'Navigasyon',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="DeliveryConfirmation" 
              component={DeliveryConfirmationScreen}
              options={{
                headerShown: true,
                title: 'Teslimat Onayı',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Ayarlar',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="WorkingHours" 
              component={WorkingHoursScreen}
              options={{
                headerShown: true,
                title: 'Çalışma Saatleri',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Bildirimler',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
            <Stack.Screen 
              name="Support" 
              component={SupportScreen}
              options={{
                headerShown: true,
                title: 'Destek',
                headerStyle: {
                  backgroundColor: '#667eea',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: '700',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const handleMessage = (message: WebSocketMessage) => {
  // This function is defined outside the component to avoid recreating it
  console.log('Handling WebSocket message:', message);
};