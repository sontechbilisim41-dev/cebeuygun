# Courier Mobile Application

A comprehensive React Native application for delivery personnel with real-time order management, GPS tracking, and earnings tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- React Native development environment
- iOS Simulator or Android Emulator
- Expo CLI

### Installation

1. **Install dependencies**
   ```bash
   cd apps/courier-rn
   npm install
   ```

2. **Start the application**
   ```bash
   npm start
   ```

3. **Run on device**
   ```bash
   # iOS
   npx expo run:ios
   
   # Android
   npx expo run:android
   ```

## 📱 Core Features

### 🔄 **Online/Offline Status Management**
- Seamless mode switching with location permission handling
- Battery-optimized background location tracking
- Automatic sync when connection is restored

### 📦 **Order Management**
- Real-time order notifications with accept/decline functionality
- Complete delivery workflow: Accept → Pickup → En Route → Delivered
- Order history and analytics

### 🗺️ **GPS Navigation & Tracking**
- Integrated GPS navigation with route optimization
- Background location tracking with throttled updates
- Real-time location sharing with customers

### 📸 **Delivery Confirmation**
- Photo capture for delivery proof
- Digital signature collection
- Verification code system
- Customer presence confirmation

### 💰 **Earnings Tracking**
- Real-time earnings calculation
- Daily, weekly, and monthly reports
- Payment method management
- Payout request system

### 📞 **Communication Features**
- Masked phone number calling for privacy
- In-app messaging system
- Emergency contact integration

### ⏰ **Work Management**
- Shift/slot planning system
- Working hours configuration
- Availability management

## 🛠 Technical Architecture

### **State Management**
- **Redux Toolkit** with RTK Query for API calls
- **Redux Persist** for offline data persistence
- **Custom Middleware** for offline queue management

### **Location Services**
- **Expo Location** with background task support
- **Battery optimization** with configurable accuracy
- **Automatic permission handling**

### **Real-time Features**
- **WebSocket** integration for live order updates
- **Push notifications** via Firebase Cloud Messaging
- **Background sync** for offline operations

### **Security**
- **Expo SecureStore** for sensitive data
- **Token-based authentication** with auto-refresh
- **Encrypted local storage**

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── dashboard/      # Dashboard-specific components
│   └── orders/         # Order-related components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── orders/        # Order management screens
│   ├── earnings/      # Earnings screens
│   └── profile/       # Profile and settings
├── store/             # Redux store configuration
│   ├── slices/        # Redux slices
│   ├── api/           # RTK Query APIs
│   └── middleware/    # Custom middleware
├── services/          # External service integrations
│   ├── mockData/      # Mock data for development
│   └── ...           # API clients and utilities
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🔧 Environment Configuration

### **Development Mode**
The app includes a comprehensive mock data system for development:

```typescript
// Toggle between mock and real services
const useMockData = true; // Set in settings
```

### **Environment Variables**
Create a `.env` file in the project root:

```env
API_BASE_URL=https://api.courierapp.com
WS_URL=wss://api.courierapp.com/ws
GOOGLE_MAPS_API_KEY=your_google_maps_key
MINIO_ENDPOINT=https://storage.courierapp.com
FCM_SENDER_ID=your_fcm_sender_id
CODEPUSH_DEPLOYMENT_KEY_IOS=your_ios_key
CODEPUSH_DEPLOYMENT_KEY_ANDROID=your_android_key
```

## 🧪 Demo Credentials

For testing the application with mock data:

```
Email: courier@example.com
Password: password123
```

## 📊 Features Demonstration

### **Complete Order Flow**
1. **Login** with demo credentials
2. **Toggle Online Status** to start receiving orders
3. **Accept Order** from available orders list
4. **Navigate** to pickup location
5. **Confirm Pickup** with verification
6. **Navigate** to delivery location
7. **Confirm Delivery** with photo/signature
8. **View Earnings** in dashboard

### **Offline Capabilities**
- Order acceptance/rejection queued when offline
- Location updates stored locally
- Automatic sync when connection restored
- Visual indicators for sync status

### **Real-time Features**
- Live order notifications
- GPS location sharing
- Order status updates
- Earnings updates

## 🔒 Security Features

- **Secure token storage** with biometric protection
- **Certificate pinning** for API communications
- **Data encryption** for sensitive information
- **Privacy protection** with masked phone numbers

## 📈 Performance Optimizations

- **Battery optimization** for location tracking
- **Efficient re-renders** with proper memoization
- **Image optimization** with caching
- **Background task management**

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0)
- **Cross-platform**: Identical functionality on both platforms

## 🚀 Deployment

### **Development Build**
```bash
npx expo build:ios
npx expo build:android
```

### **Production Build**
```bash
npx expo build:ios --release-channel production
npx expo build:android --release-channel production
```

### **CodePush Updates**
```bash
# iOS
npx code-push release-react CourierApp-iOS ios

# Android
npx code-push release-react CourierApp-Android android
```

## 📋 Requirements Checklist

✅ **Core Features**
- [x] Online/Offline status toggle
- [x] Real-time order notifications
- [x] GPS navigation integration
- [x] Delivery confirmation system
- [x] Earnings tracking

✅ **Technical Requirements**
- [x] React Native 0.74+
- [x] TypeScript implementation
- [x] Background location services
- [x] Camera functionality
- [x] Digital signature capture
- [x] CodePush integration

✅ **Delivery Workflow**
- [x] Order acceptance
- [x] Pickup confirmation
- [x] En route status
- [x] Delivery completion

✅ **Quality Standards**
- [x] Offline operation support
- [x] Network connectivity handling
- [x] Background location tracking
- [x] Production-ready architecture

## 🆘 Support

For technical support or questions:
- Check the documentation in `/docs`
- Review the mock data examples
- Test with the provided demo credentials

## 📄 License

This project is proprietary software. All rights reserved.