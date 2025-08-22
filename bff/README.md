# BFF (Backend for Frontend) Service

A comprehensive Backend-for-Frontend service that serves as a unified gateway for mobile and web clients, aggregating multiple microservice calls into optimized endpoints.

## Features

- **Unified API Gateway**: Single entry point for all frontend applications
- **Service Aggregation**: Combines multiple microservice responses into optimized payloads
- **Real-time Communication**: WebSocket support with Socket.IO for live updates
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Request Validation**: Comprehensive input validation using Zod schemas
- **Rate Limiting**: Protection against abuse with configurable limits
- **Health Monitoring**: Service health checks and monitoring endpoints

## Tech Stack

- **Framework**: Fastify with TypeScript
- **Validation**: Zod schemas for type-safe validation
- **HTTP Client**: Undici for high-performance HTTP requests
- **WebSocket**: Socket.IO for real-time communication
- **Testing**: Vitest for unit and e2e tests
- **Logging**: Winston for structured logging

## API Endpoints

### Core Endpoints

#### `GET /api/feed`
Aggregates data from multiple services to provide a unified feed for the frontend.

**Query Parameters:**
- `location` (optional): User location for nearby products
- `categoryId` (optional): Filter by category
- `limit` (optional): Number of items to return (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "featuredProducts": [...],
    "campaigns": [...],
    "categories": [...],
    "nearbyProducts": [...]
  }
}
```

#### `POST /api/checkout`
Handles the complete checkout process with validation and service orchestration.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "notes": "Extra spicy"
    }
  ],
  "deliveryAddress": {
    "latitude": 41.0082,
    "longitude": 28.9784,
    "address": "Street Address",
    "city": "Istanbul",
    "district": "Beyoğlu"
  },
  "paymentMethodId": "pm_123",
  "couponCode": "SAVE20",
  "notes": "Please ring the bell"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "totalAmount": { "currency": "TRY", "amount": 5000 },
    "estimatedDeliveryTime": 30,
    "paymentStatus": "completed"
  }
}
```

#### `GET /api/orders/:id`
Retrieves comprehensive order details with related data aggregation.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "status": "confirmed",
    "items": [...],
    "totalAmount": { "currency": "TRY", "amount": 5000 },
    "deliveryAddress": {...},
    "courier": {...},
    "tracking": {...}
  }
}
```

#### `PATCH /api/orders/:id/status`
Updates order status (restricted to sellers, couriers, and admins).

**Request Body:**
```json
{
  "status": "preparing",
  "notes": "Started preparation"
}
```

### WebSocket Events

#### Connection
```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

#### Order Updates
```javascript
// Subscribe to order updates
socket.emit('subscribe:orders');

// Listen for updates
socket.on('order_update', (data) => {
  console.log('Order updated:', data);
});
```

#### Courier Location Tracking
```javascript
// Subscribe to courier location (customers)
socket.emit('subscribe:courier_location', orderId);

// Listen for location updates
socket.on('courier_location_update', (data) => {
  console.log('Courier location:', data.location);
});

// Send location updates (couriers)
socket.emit('courier:location_update', {
  orderId: 'uuid',
  location: { latitude: 41.0082, longitude: 28.9784 }
});
```

## Development

### Setup
```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm run dev
```

### Testing
```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run tests in watch mode
pnpm run test --watch
```

### Building
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BFF_SERVICE_PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `*_SERVICE_URL` | Microservice URLs | Various |
| `CORS_ORIGINS` | Allowed CORS origins | Comma-separated |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window | `1 minute` |

### Service Discovery

The BFF automatically discovers and connects to microservices based on environment variables:

- `AUTH_SERVICE_URL`
- `CATALOG_SERVICE_URL`
- `PRICING_SERVICE_URL`
- `PROMOTION_SERVICE_URL`
- `ORDER_SERVICE_URL`
- `INVENTORY_SERVICE_URL`

## Architecture

### Request Flow

1. **Authentication**: JWT token validation
2. **Rate Limiting**: Request throttling
3. **Validation**: Input validation with Zod
4. **Service Calls**: Parallel microservice requests
5. **Data Aggregation**: Combine responses
6. **Response**: Unified response to client

### Error Handling

- **Validation Errors**: 400 with detailed field errors
- **Authentication Errors**: 401 with clear messages
- **Authorization Errors**: 403 with permission details
- **Rate Limit Errors**: 429 with retry information
- **Service Errors**: 503 with service status
- **Server Errors**: 500 with sanitized messages

### Logging

Structured logging with Winston:
- Request/response logging
- Error tracking with stack traces
- Performance metrics
- Service health monitoring

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

Response includes:
- Overall service status
- Individual microservice health
- System metrics (uptime, memory)

### Metrics

The service exposes metrics for:
- Request latency
- Error rates
- Service availability
- WebSocket connections
- Cache hit rates

## Security

- **JWT Authentication**: Stateless token validation
- **Role-Based Access**: Endpoint-level authorization
- **Rate Limiting**: DDoS protection
- **Input Validation**: XSS/injection prevention
- **CORS**: Cross-origin request control
- **Helmet**: Security headers

## Performance

- **Connection Pooling**: Efficient HTTP connections
- **Parallel Requests**: Concurrent service calls
- **Response Caching**: Redis-based caching
- **Compression**: Gzip response compression
- **Keep-Alive**: Persistent connections