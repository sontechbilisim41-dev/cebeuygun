import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Store
import { store, persistor } from '@/store';

// Navigation
import { AppNavigator } from '@/navigation/AppNavigator';

// Components
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Services
import { notificationService } from '@/services/notificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          // Add custom fonts here if needed
        });

        // Initialize notification service
        await notificationService.requestPermissions();
        await notificationService.registerForPushNotifications();

        // Setup notification listeners
        const { notificationListener, responseListener } = notificationService.setupNotificationListeners();

        // Cleanup function
        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner text="Yükleniyor..." overlay />} persistor={persistor}>
        <StatusBar style="auto" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}