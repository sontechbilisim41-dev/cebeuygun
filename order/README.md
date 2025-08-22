# Order Service

Comprehensive order management service for the e-commerce platform with cart management, order lifecycle, and event-driven architecture using the outbox pattern.

## 🎯 Features

- **Cart Management**: Add/remove/modify items with single-vendor constraint
- **Dynamic Pricing**: Real-time calculation with taxes, fees, and discounts
- **Order Lifecycle**: Complete state machine from creation to delivery
- **Event Sourcing**: Outbox pattern with Kafka for reliable event publishing
- **State Validation**: Enforced order status transitions with database constraints
- **ACID Compliance**: Transactional consistency across all operations

## 🏗 Architecture

### **State Machine**
```
CREATED → PAID → ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
    ↓       ↓        ↓          ↓           ↓
  CANCELED ← CANCELED ← CANCELED ← CANCELED ← CANCELED
```

### **Business Rules**
- **Single Vendor Constraint**: Each cart can only contain items from one seller
- **Small Cart Fee**: Applied to orders below minimum threshold
- **Express Delivery**: Higher delivery fee for express items
- **State Transitions**: Only valid transitions allowed (enforced at DB level)

## 🛠 Tech Stack

- **Language**: Go 1.22
- **Framework**: Gin HTTP framework
- **Database**: PostgreSQL with ACID transactions
- **Cache**: Redis for session and temporary data
- **Messaging**: Kafka with outbox pattern
- **Validation**: Go Playground Validator
- **Documentation**: Swagger/OpenAPI 3.0

## 📊 API Endpoints

### Cart Management

- `GET /api/v1/cart/{customer_id}` - Get customer cart
- `POST /api/v1/cart/{customer_id}/items` - Add item to cart
- `PUT /api/v1/cart/{customer_id}/items/{item_id}` - Update cart item
- `DELETE /api/v1/cart/{customer_id}/items/{item_id}` - Remove item from cart
- `DELETE /api/v1/cart/{customer_id}/clear` - Clear entire cart
- `GET /api/v1/cart/{customer_id}/summary` - Get cart summary with pricing

### Order Management

- `POST /api/v1/orders/{customer_id}` - Create order from cart
- `GET /api/v1/orders/{id}` - Get order details
- `GET /api/v1/orders/customer/{customer_id}` - Get customer orders
- `GET /api/v1/orders/seller/{seller_id}` - Get seller orders
- `PATCH /api/v1/orders/{id}/status` - Update order status
- `PATCH /api/v1/orders/{id}/assign-courier` - Assign courier
- `POST /api/v1/orders/{id}/payment` - Process payment

## 🗄 Database Schema

### Core Tables

**carts**: Shopping cart management
- Single cart per customer
- Seller constraint enforcement
- Automatic cleanup triggers

**cart_items**: Cart item management
- Product and variant references
- Quantity and pricing
- Single seller validation

**orders**: Order lifecycle management
- Complete order information
- Status tracking with validation
- Delivery address and timing

**order_items**: Order item details
- Immutable order item records
- Pricing snapshot at order time

**outbox_events**: Event sourcing
- Reliable event publishing
- Transactional consistency
- Automatic cleanup

### Business Constraints

- **Single Vendor**: Database trigger prevents multi-vendor carts
- **Status Transitions**: Database trigger validates state changes
- **Pricing Validation**: Check constraints ensure positive values
- **RLS Security**: Row-level security for multi-tenant access

## 🔄 Event Architecture

### Outbox Pattern Implementation

1. **Transactional Write**: Events written to outbox table in same transaction
2. **Background Processor**: Polls outbox table every 5 seconds
3. **Kafka Publishing**: Publishes events to appropriate topics
4. **Cleanup**: Removes old published events

### Event Topics

- `order.created` - New order placed
- `order.paid` - Payment processed
- `order.assigned` - Courier assigned
- `order.picked_up` - Order picked up by courier
- `order.on_the_way` - Order in transit
- `order.delivered` - Order delivered successfully
- `order.canceled` - Order canceled

### Event Payload Structure

```json
{
  "order_id": "uuid",
  "customer_id": "uuid",
  "seller_id": "uuid",
  "status": "PAID",
  "total_amount": "59.99",
  "currency": "TRY",
  "items": [...],
  "timestamp": "2025-01-01T12:00:00Z",
  "metadata": {...}
}
```

## 💰 Pricing Engine

### Dynamic Calculation

- **Subtotal**: Sum of all item prices
- **Tax Amount**: Configurable tax rate (default 18%)
- **Delivery Fee**: Standard or express delivery pricing
- **Small Cart Fee**: Applied when below minimum order amount
- **Discount Amount**: Coupon and promotion discounts
- **Total Amount**: Final calculated total

### Business Rules

- Minimum order amount: 50 TRY (configurable)
- Small cart fee: 5 TRY (configurable)
- Express delivery fee: 20 TRY vs 10 TRY standard
- Tax rate: 18% (configurable)

## 🔒 Security & Validation

### Input Validation
- Zod schemas for all API requests
- UUID validation for all IDs
- Business rule validation (quantities, prices)
- Status transition validation

### Database Security
- Row Level Security (RLS) enabled
- Role-based access policies
- Constraint validation at DB level
- Audit trails with timestamps

### State Machine Validation
- Database triggers prevent invalid transitions
- Application-level validation
- Comprehensive error messages
- State transition logging

## 🚀 Development

### Setup
```bash
# Install dependencies
go mod download

# Copy environment variables
cp .env.example .env

# Run migrations
migrate -path migrations -database "postgres://..." up

# Start development server
go run cmd/main.go
```

### Testing
```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...

# Run integration tests
go test -tags=integration ./...
```

### Building
```bash
# Build binary
go build -o order cmd/main.go

# Build Docker image
docker build -t order-service .
```

## 📈 Monitoring & Observability

### Health Checks
- Database connectivity
- Redis connectivity
- Kafka connectivity
- Service dependencies

### Metrics
- Order creation rate
- Status transition timing
- Cart abandonment rate
- Payment success rate
- Event publishing latency

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking with stack traces
- Performance metrics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ORDER_SERVICE_PORT` | Service port | `8004` |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `KAFKA_BROKERS` | Kafka broker list | `localhost:9092` |
| `MIN_ORDER_AMOUNT` | Minimum order threshold | `50.00` |
| `SMALL_CART_FEE` | Small cart penalty fee | `5.00` |
| `TAX_RATE` | Tax percentage | `18.00` |
| `DELIVERY_FEE` | Standard delivery fee | `10.00` |
| `EXPRESS_DELIVERY_FEE` | Express delivery fee | `20.00` |

### Business Rule Configuration
- All pricing rules configurable via environment
- Tax rates and fees adjustable per region
- Minimum order thresholds customizable
- Delivery pricing flexible

## 🎯 Acceptance Criteria

✅ **Single Vendor Constraint**: Enforced at database and application level
✅ **ACID Compliance**: All operations maintain transactional consistency
✅ **State Machine Validation**: Invalid transitions prevented
✅ **Event Reliability**: Outbox pattern ensures event delivery
✅ **Comprehensive Testing**: Unit and integration tests included
✅ **Performance Optimization**: Efficient queries and caching

## 🚨 Error Handling

### Validation Errors
- Input validation with detailed error messages
- Business rule violation handling
- State transition validation
- UUID format validation

### Service Errors
- Database connection failures
- External service timeouts
- Kafka publishing failures
- Redis connectivity issues

### Recovery Mechanisms
- Automatic retry for transient failures
- Circuit breaker patterns for external services
- Graceful degradation for non-critical features
- Comprehensive error logging

This Order Service provides a robust, scalable foundation for e-commerce order management with proper state management, event sourcing, and transactional consistency. The implementation follows best practices for microservices architecture while maintaining data integrity and performance.