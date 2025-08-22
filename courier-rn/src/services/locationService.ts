import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { store } from '@/store';
import { updateCurrentLocation, updateLocationDetails } from '@/store/slices/locationSlice';
import { addToSyncQueue } from '@/store/slices/networkSlice';
import { LocationUpdate } from '@/types';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    if (location) {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: Date.now(),
      };

      // Update store
      store.dispatch(updateCurrentLocation(locationData));
      store.dispatch(updateLocationDetails({
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed,
        heading: location.coords.heading,
      }));

      // Queue location update for sync
      const state = store.getState();
      if (state.auth.courier?.id && state.auth.isOnline) {
        const locationUpdate: LocationUpdate = {
          courierId: state.auth.courier.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
          timestamp: new Date().toISOString(),
          orderId: state.orders.activeOrder?.id,
        };

        store.dispatch(addToSyncQueue({
          action: 'location/sendLocationUpdate',
          payload: locationUpdate,
        }));
      }
    }
  }
});

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isBackgroundTaskStarted = false;

  async requestPermissions(): Promise<boolean> {
    try {
      // Request foreground permission first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission denied');
      }

      // Request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied');
        return false; // Still allow app to work with foreground only
      }

      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get current location error:', error);
      throw new Error('Unable to get current location');
    }
  }

  async startTracking(orderId?: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission required');
      }

      // Start foreground tracking
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // 15 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: Date.now(),
          };

          store.dispatch(updateCurrentLocation(locationData));
          store.dispatch(updateLocationDetails({
            accuracy: location.coords.accuracy || 0,
            speed: location.coords.speed,
            heading: location.coords.heading,
          }));
        }
      );

      // Start background tracking
      await this.startBackgroundLocationTask();
      
      console.log('Location tracking started');
    } catch (error) {
      console.error('Start tracking error:', error);
      throw error;
    }
  }

  async stopTracking(): Promise<void> {
    try {
      // Stop foreground tracking
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }

      // Stop background tracking
      await this.stopBackgroundLocationTask();
      
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Stop tracking error:', error);
      throw error;
    }
  }

  private async startBackgroundLocationTask(): Promise<void> {
    try {
      const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      if (!isTaskDefined) {
        console.error('Background location task is not defined');
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        console.log('Background location task already started');
        return;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 20, // 20 meters
        deferredUpdatesInterval: 60000, // 1 minute
        foregroundService: {
          notificationTitle: 'Teslimat Takibi',
          notificationBody: 'Konumunuz teslimat için takip ediliyor',
          notificationColor: '#667eea',
        },
      });

      this.isBackgroundTaskStarted = true;
      console.log('Background location task started');
    } catch (error) {
      console.error('Start background location task error:', error);
    }
  }

  private async stopBackgroundLocationTask(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        this.isBackgroundTaskStarted = false;
        console.log('Background location task stopped');
      }
    } catch (error) {
      console.error('Stop background location task error:', error);
    }
  }

  async sendLocationUpdate(locationUpdate: LocationUpdate): Promise<void> {
    // This would normally send to the API
    // For now, we'll just log it
    console.log('Sending location update:', locationUpdate);
    
    // In a real implementation, this would call the API
    // await apiClient.post('/location/update', locationUpdate);
  }

  async getLocationPermissionStatus(): Promise<Location.PermissionStatus> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  }

  async getBackgroundPermissionStatus(): Promise<Location.PermissionStatus> {
    const { status } = await Location.getBackgroundPermissionsAsync();
    return status;
  }

  isBackgroundTaskRunning(): boolean {
    return this.isBackgroundTaskStarted;
  }

  async calculateDistance(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): Promise<number> {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * 
      Math.cos(this.toRadians(to.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return `${address.street || ''} ${address.streetNumber || ''}, ${address.district || ''}, ${address.city || ''}`.trim();
      }

      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }
}

export const locationService = new LocationService();