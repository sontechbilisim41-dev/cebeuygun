import { useEffect, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  updateCurrentLocation,
  updateLocationDetails,
  setTrackingStatus,
  setPermissionStatus,
  requestLocationPermission,
  startLocationTracking,
  stopLocationTracking,
  selectIsTracking,
  selectHasPermission,
  selectCurrentLocation,
} from '@/store/slices/locationSlice';
import { selectIsOnline } from '@/store/slices/authSlice';
import { locationService } from '@/services/locationService';

export const useLocation = () => {
  const dispatch = useAppDispatch();
  const isTracking = useAppSelector(selectIsTracking);
  const hasPermission = useAppSelector(selectHasPermission);
  const currentLocation = useAppSelector(selectCurrentLocation);
  const isOnline = useAppSelector(selectIsOnline);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - check if we still have permission
        checkPermissions();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Auto-start tracking when online and has permission
  useEffect(() => {
    if (isOnline && hasPermission && !isTracking) {
      startTracking();
    } else if (!isOnline && isTracking) {
      stopTracking();
    }
  }, [isOnline, hasPermission]);

  const checkPermissions = useCallback(async () => {
    try {
      const foregroundStatus = await locationService.getLocationPermissionStatus();
      const backgroundStatus = await locationService.getBackgroundPermissionStatus();
      
      const hasFullPermission = 
        foregroundStatus === Location.PermissionStatus.GRANTED &&
        backgroundStatus === Location.PermissionStatus.GRANTED;
      
      dispatch(setPermissionStatus(hasFullPermission));
      
      return hasFullPermission;
    } catch (error) {
      console.error('Check permissions error:', error);
      dispatch(setPermissionStatus(false));
      return false;
    }
  }, [dispatch]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await dispatch(requestLocationPermission()).unwrap();
      return granted;
    } catch (error) {
      console.error('Request permissions error:', error);
      Alert.alert(
        'Konum İzni Hatası',
        'Konum izni alınırken bir hata oluştu. Lütfen uygulama ayarlarından konum iznini manuel olarak verin.',
        [
          { text: 'Tamam' },
          { 
            text: 'Ayarlara Git', 
            onPress: () => {
              // Open app settings
              // This would require expo-linking or similar
            }
          },
        ]
      );
      return false;
    }
  }, [dispatch]);

  const startTracking = useCallback(async (orderId?: string): Promise<boolean> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return false;
      }

      await dispatch(startLocationTracking(orderId)).unwrap();
      return true;
    } catch (error) {
      console.error('Start tracking error:', error);
      Alert.alert(
        'Konum Takibi Hatası',
        'Konum takibi başlatılırken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
  }, [dispatch, hasPermission, requestPermissions]);

  const stopTracking = useCallback(async (): Promise<boolean> => {
    try {
      await dispatch(stopLocationTracking()).unwrap();
      return true;
    } catch (error) {
      console.error('Stop tracking error:', error);
      return false;
    }
  }, [dispatch]);

  const getCurrentLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      const location = await locationService.getCurrentLocation();
      
      dispatch(updateCurrentLocation(location));
      dispatch(updateLocationDetails({
        accuracy: location.accuracy,
      }));

      return location;
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert(
        'Konum Hatası',
        'Mevcut konum alınırken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
      return null;
    }
  }, [dispatch, hasPermission, requestPermissions]);

  const calculateDistance = useCallback(
    (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number => {
      return locationService.calculateDistance(from, to);
    },
    []
  );

  const getAddressFromCoordinates = useCallback(
    async (latitude: number, longitude: number): Promise<string> => {
      try {
        return await locationService.getAddressFromCoordinates(latitude, longitude);
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    },
    []
  );

  return {
    // State
    isTracking,
    hasPermission,
    currentLocation,
    
    // Actions
    requestPermissions,
    startTracking,
    stopTracking,
    getCurrentLocation,
    checkPermissions,
    
    // Utilities
    calculateDistance,
    getAddressFromCoordinates,
  };
};