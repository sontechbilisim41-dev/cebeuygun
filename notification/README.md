# Notification Service

Comprehensive multi-channel notification service with orchestration, templating, and reliability features for real-time communication across push notifications, SMS, and email channels.

## 🎯 Features

- **Multi-Channel Support**: FCM push notifications, SMS (Twilio), and email (SendGrid/SES)
- **Template Engine**: Handlebars-based dynamic message templating with localization
- **Event-Driven Architecture**: Kafka consumer for order.* events with automatic notification triggers
- **Intelligent Orchestration**: Priority-based queuing with rate limiting and quiet hours
- **Reliability**: Comprehensive retry policies with exponential backoff and circuit breakers
- **Performance**: Sub-200ms event queuing with Bull queue management

## 🛠 Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify for high-performance HTTP handling
- **Database**: PostgreSQL for persistent storage and audit trails
- **Queue**: Bull (Redis-based) for reliable message queuing
- **Messaging**: Kafka consumer for event processing
- **Templating**: Handlebars with custom helpers for Turkish localization
- **Channels**: Firebase Admin SDK, Twilio, SendGrid/AWS SES

## 📊 API Endpoints

### **Core Notification Endpoints**

#### `POST /api/v1/notifications/send`
Send notification to single user across multiple channels.

**Request:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "eventType": "order_delivered",
  "channels": ["push", "sms"],
  "priority": "high",
  "data": {
    "orderId": "123e4567-e89b-12d3-a456-426614174001",
    "orderStatus": "delivered",
    "totalAmount": 5000,
    "currency": "TRY"
  },
  "metadata": {
    "orderId": "123e4567-e89b-12d3-a456-426614174001",
    "source": "order_service"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification processed successfully",
  "data": {
    "requestId": "123e4567-e89b-12d3-a456-426614174002",
    "queuedDeliveries": 2,
    "skippedChannels": [],
    "processingTime": 45
  }
}
```

#### `POST /api/v1/notifications/bulk`
Send notifications to multiple users simultaneously.

**Request:**
```json
{
  "userIds": ["user1", "user2", "user3"],
  "eventType": "flash_sale",
  "channels": ["push", "email"],
  "priority": "normal",
  "data": {
    "campaignName": "Flash Sale",
    "discountPercentage": 50,
    "validUntil": "2025-01-19T23:59:59Z"
  },
  "metadata": {
    "campaignId": "123e4567-e89b-12d3-a456-426614174003",
    "source": "marketing"
  }
}
```

#### `GET /api/v1/notifications/metrics`
Get notification delivery metrics and analytics.

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `channel`: Optional channel filter

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSent": 15420,
    "totalDelivered": 14891,
    "totalFailed": 529,
    "deliveryRate": 96.57,
    "averageProcessingTime": 156,
    "channelBreakdown": {
      "push": {
        "sent": 8500,
        "delivered": 8234,
        "failed": 266,
        "deliveryRate": 96.87
      },
      "sms": {
        "sent": 4200,
        "delivered": 4089,
        "failed": 111,
        "deliveryRate": 97.36
      },
      "email": {
        "sent": 2720,
        "delivered": 2568,
        "failed": 152,
        "deliveryRate": 94.41
      }
    }
  }
}
```

### **Template Management**

#### `POST /api/v1/notifications/templates`
Create new notification template.

#### `GET /api/v1/notifications/templates`
List notification templates with filtering.

### **Queue Management**

#### `GET /api/v1/notifications/queue/stats`
Get queue statistics and health.

## 🔄 **Event Processing**

### **Kafka Topics Consumed**
- `order.created` - New order notifications
- `order.paid` - Payment confirmation notifications
- `order.assigned` - Courier assignment notifications
- `order.picked_up` - Pickup confirmation notifications
- `order.on_the_way` - Delivery in progress notifications
- `order.delivered` - Delivery completion notifications
- `order.canceled` - Order cancellation notifications
- `courier.assigned` - Courier assignment notifications
- `payment.failed` - Payment failure notifications

### **Event Processing Flow**
1. **Event Reception**: Kafka message received and parsed
2. **User Lookup**: Contact information retrieved from database
3. **Template Rendering**: Dynamic content generation with Handlebars
4. **Channel Selection**: Available channels determined based on user preferences
5. **Queue Management**: Deliveries queued by priority with Bull
6. **Delivery Processing**: Messages sent through appropriate channels
7. **Status Tracking**: Delivery status updated with retry handling

## 🎨 **Template System**

### **Handlebars Helpers**
- **`formatDate`**: Turkish date formatting
- **`formatCurrency`**: Turkish Lira formatting
- **`formatTime`**: Time formatting
- **`formatETA`**: Estimated time formatting
- **`orderStatus`**: Order status localization
- **Conditional helpers**: `eq`, `gt`, `lt` for logic
- **String helpers**: `uppercase`, `lowercase`, `truncate`

### **Template Variables**
- **Order Data**: `orderId`, `orderStatus`, `totalAmount`, `currency`
- **Timing**: `estimatedDeliveryTime`, `estimatedETA`
- **User Data**: `customerName`, `courierName`, `courierPhone`
- **Campaign Data**: `campaignName`, `discountPercentage`, `validUntil`

## 🛡 **Reliability Features**

### **Retry Mechanism**
- **Exponential Backoff**: 1s → 2s → 4s → 8s delays
- **Max Attempts**: 3 attempts per delivery
- **Retryable Errors**: Network timeouts, service unavailable
- **Non-Retryable**: Invalid phone numbers, blocked emails

### **Rate Limiting**
- **Push**: 1000/minute, 10000/hour per user
- **SMS**: 100/minute, 1000/hour per user  
- **Email**: 500/minute, 5000/hour per user
- **Global**: Service-level rate limiting

### **Quiet Hours**
- **Configurable Hours**: 22:00-08:00 default
- **Channel Filtering**: Email allowed during quiet hours
- **Timezone Support**: User-specific timezone handling
- **Override**: Urgent notifications bypass quiet hours

## 🚀 **Performance Features**

### **Queue Management**
- **Priority Queues**: Urgent, High, Normal, Low priorities
- **Concurrency Control**: Priority-based worker allocation
- **Backpressure**: Queue size monitoring and throttling
- **Job Cleanup**: Automatic cleanup of completed/failed jobs

### **Caching Strategy**
- **Template Cache**: Compiled Handlebars templates
- **Contact Cache**: User contact information
- **Rate Limit Cache**: Redis-based rate limiting
- **Metrics Cache**: Performance metrics aggregation

## 🔧 **Configuration**

### **Channel Configuration**
- **FCM**: Firebase service account and project ID
- **Twilio**: Account SID, auth token, from number
- **SendGrid**: API key and sender configuration
- **AWS SES**: Region, access keys, sender configuration

### **Performance Tuning**
- **Target Queue Time**: 200ms for event processing
- **Batch Size**: 50 notifications per batch
- **Concurrency**: 10 concurrent workers per priority
- **Cache TTL**: 5 minutes for templates and contact info

## 🧪 **Testing**

### **Mock Providers**
- **Mock FCM**: Testing without Firebase dependency
- **Mock SMS**: Simulated SMS delivery
- **Mock Email**: Simulated email delivery
- **Event Simulation**: Kafka event testing

### **Test Scenarios**
- **Multi-channel delivery**: All channels working correctly
- **Failure handling**: Retry logic and error recovery
- **Rate limiting**: Throttling and backpressure
- **Quiet hours**: Time-based delivery filtering
- **Template rendering**: Dynamic content generation

## 🚀 **Development**

### **Setup**
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### **Testing**
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### **Building**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 **Docker Deployment**

```bash
# Build image
docker build -t notification-service .

# Run container
docker run -p 8008:8008 \
  -e KAFKA_BROKERS=kafka:9092 \
  -e REDIS_URL=redis://redis:6379 \
  -e FCM_ENABLED=true \
  notification-service
```

## 📊 **Monitoring**

### **Health Checks**
- Database connectivity
- Kafka consumer status
- Channel provider health
- Queue processing capacity

### **Metrics**
- Delivery success rates by channel
- Processing time percentiles
- Queue depth and throughput
- Error rates and retry statistics

### **Logging**
- Structured JSON logging with Winston
- Delivery tracking with audit trail
- Performance monitoring
- Error tracking with stack traces

## 🔒 **Security**

### **Data Protection**
- Row Level Security (RLS) for user data
- Contact information encryption
- Secure credential management
- Audit logging for compliance

### **Access Control**
- JWT-based authentication
- Role-based template management
- User-specific data access
- Admin-only configuration endpoints

This Notification Service provides enterprise-grade multi-channel communication with comprehensive reliability features, intelligent orchestration, and high-performance delivery capabilities optimized for Turkish e-commerce platforms.