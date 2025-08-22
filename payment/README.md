# Payment Service

Comprehensive payment processing service with multi-provider support, tokenization, fraud detection, and PCI compliance features for the e-commerce platform.

## 🎯 Features

- **Multi-Provider Support**: Stripe and iyzico payment gateways with adapter pattern
- **Card Tokenization**: Secure token-based payments to reduce PCI compliance scope
- **3D Secure Authentication**: Optional 3D Secure flow for enhanced security
- **Fraud Detection**: Real-time fraud prevention with configurable rules
- **Event Publishing**: Kafka integration for order lifecycle events
- **Webhook Validation**: Secure webhook handling with signature verification

## 🛠 Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify for high-performance HTTP handling
- **Payment Providers**: Stripe SDK, iyzico API integration
- **Message Queue**: Kafka (KafkaJS) for event publishing
- **Caching**: Redis for fraud detection and rate limiting
- **Validation**: Zod schemas for type-safe request/response validation
- **Logging**: Winston with security and fraud-specific loggers

## 🔒 Security & Compliance

### **PCI Compliance**
- **No Card Storage**: Raw card data never stored on servers
- **Tokenization**: All card data tokenized through payment providers
- **Encryption**: AES-256-GCM encryption for sensitive data
- **Audit Logging**: Comprehensive security event logging

### **Fraud Prevention**
- **Amount Limits**: Daily and per-transaction limits
- **Velocity Checks**: Transaction frequency monitoring
- **Geographic Restrictions**: Country-based filtering
- **Risk Scoring**: Multi-factor risk assessment
- **Pattern Detection**: Unusual transaction time detection

## 📊 API Endpoints

### **Payment Processing**

#### `POST /api/v1/payments/intent`
Create payment intent with fraud detection.

**Request:**
```json
{
  "amount": 5000,
  "currency": "TRY",
  "customer": {
    "id": "uuid",
    "email": "customer@example.com",
    "phone": "+905551234567",
    "name": "John Doe",
    "address": {
      "line1": "123 Main St",
      "city": "Istanbul",
      "country": "TR"
    }
  },
  "order_id": "uuid",
  "description": "Order payment",
  "provider": "stripe",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "data": {
    "payment_intent_id": "pi_1234567890",
    "client_secret": "pi_1234567890_secret_abc",
    "status": "pending",
    "amount": 5000,
    "currency": "TRY",
    "provider": "stripe",
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

#### `POST /api/v1/payments/confirm`
Confirm payment with card details or token.

**Request (Card):**
```json
{
  "payment_intent_id": "pi_1234567890",
  "payment_method": {
    "type": "card",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123",
      "holder_name": "John Doe"
    }
  },
  "three_d_secure": true,
  "return_url": "https://example.com/return"
}
```

**Request (Token):**
```json
{
  "payment_intent_id": "pi_1234567890",
  "payment_method": {
    "type": "token",
    "token": "pm_1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment_id": "pay_1234567890",
    "status": "succeeded",
    "amount": 5000,
    "currency": "TRY",
    "provider": "stripe",
    "token": "pm_1234567890",
    "last_four": "4242",
    "brand": "visa",
    "processed_at": "2025-01-01T12:00:00Z"
  }
}
```

#### `POST /api/v1/payments/refund`
Process refund for completed payment.

**Request:**
```json
{
  "payment_id": "pay_1234567890",
  "amount": 2500,
  "reason": "requested_by_customer",
  "metadata": {
    "refund_reason": "Customer not satisfied"
  }
}
```

### **Webhook Endpoints**

- `POST /webhooks/stripe` - Stripe webhook handler
- `POST /webhooks/iyzico` - iyzico webhook handler
- `GET /webhooks/health` - Webhook service health

## 🔍 Fraud Detection Rules

### **Risk Factors**
- **High Amount**: Transactions above configured limit
- **High Velocity**: Too many transactions per hour
- **Daily Limit**: Exceeding daily spending limit
- **Restricted Country**: Transactions from blocked countries
- **Unusual Time**: Transactions during unusual hours (2-6 AM)
- **First-Time High Amount**: New customers with large transactions

### **Risk Scoring**
- **0-39**: Allow automatically
- **40-69**: Flag for manual review
- **70+**: Block transaction

### **Actions**
- **Allow**: Process payment normally
- **Review**: Hold for manual review
- **Block**: Reject payment immediately

## 🔄 Event Publishing

### **Kafka Topics**
- `order.paid` - Successful payment completion
- `payment.failed` - Payment processing failure
- `refund.processed` - Refund completion

### **Event Payloads**

**Order Paid Event:**
```json
{
  "order_id": "uuid",
  "customer_id": "uuid",
  "payment_id": "pay_1234567890",
  "amount": 5000,
  "currency": "TRY",
  "provider": "stripe",
  "timestamp": "2025-01-01T12:00:00Z",
  "event_type": "order_paid"
}
```

## 🏗 Architecture

### **Adapter Pattern**
- **BasePaymentProvider**: Abstract interface for all providers
- **StripeProvider**: Stripe-specific implementation
- **IyzicoProvider**: iyzico-specific implementation
- **MockProvider**: Testing and development provider

### **Service Layer**
- **PaymentService**: Main business logic orchestration
- **FraudDetectionService**: Risk assessment and prevention
- **TokenizationService**: Secure card tokenization
- **KafkaService**: Event publishing and messaging

## 🧪 Testing

### **Test Cards**

**Stripe Test Cards:**
- `4242424242424242` - Successful payment
- `4000000000000002` - Card declined
- `4000000000003220` - 3D Secure authentication required

**Mock Provider:**
- Uses same test card numbers for consistent testing
- Simulates all payment flows and edge cases

### **Running Tests**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test with coverage
npm test -- --coverage
```

## 🚀 Development

### **Setup**
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### **Building**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t payment-service .

# Run container
docker run -p 8005:8005 \
  -e STRIPE_SECRET_KEY=sk_test_... \
  -e KAFKA_BROKERS=kafka:9092 \
  -e REDIS_URL=redis://redis:6379 \
  payment-service
```

## 📊 Monitoring

### **Security Metrics**
- Payment success/failure rates
- Fraud detection accuracy
- Token usage patterns
- 3D Secure completion rates

### **Performance Metrics**
- Payment processing latency
- Provider response times
- Webhook processing time
- Event publishing latency

### **Fraud Metrics**
- Risk score distribution
- Blocked transaction count
- False positive rate
- Geographic transaction patterns

## 🔧 Configuration

### **Provider Configuration**
- Stripe: API keys, webhook secrets, API version
- iyzico: API credentials, base URL configuration
- Mock: Automatic for testing environments

### **Security Configuration**
- Encryption keys for tokenization
- Token expiry settings
- Fraud detection thresholds
- Geographic restrictions

### **Business Rules**
- Transaction limits (daily, per-transaction)
- Velocity check windows
- Risk scoring thresholds
- Allowed countries list

## 🚨 Error Handling

### **Payment Errors**
- Provider-specific error mapping
- Detailed error messages for debugging
- Secure error responses (no sensitive data)
- Automatic retry for transient failures

### **Fraud Detection**
- Fail-safe approach (allow on service failure)
- Comprehensive risk factor logging
- Manual review queue for medium-risk transactions
- Automatic blocking for high-risk transactions

### **Webhook Security**
- Signature verification for all providers
- Replay attack prevention
- Invalid payload handling
- Rate limiting for webhook endpoints

This Payment Service provides enterprise-grade payment processing with comprehensive security, fraud prevention, and PCI compliance features. The implementation supports multiple payment providers while maintaining a clean, testable architecture that minimizes security risks and ensures reliable payment processing.