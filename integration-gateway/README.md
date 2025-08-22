# ERP/POS Integration Gateway

A comprehensive microservice for seamless synchronization between merchant ERP/POS systems and the main e-commerce platform.

## 🎯 Overview

The Integration Gateway provides robust webhook and polling adapters that synchronize inventory, pricing, and order data between various ERP/POS systems and the platform, ensuring data consistency and real-time updates.

## 🏗️ Architecture

### **Core Components**
- **Integration Service**: Manages ERP/POS connections and configurations
- **Queue Service**: Handles asynchronous job processing with BullMQ
- **Webhook Service**: Processes real-time webhook events
- **Connector Factory**: Pluggable architecture for different ERP/POS systems
- **Encryption Service**: Secure credential management
- **Audit Service**: Comprehensive logging and compliance

### **Supported Connectors**
1. **Generic CSV Connector**: File-based integration for simple systems
2. **Logo ERP Connector**: Native integration with Logo ERP systems
3. **Netsis ERP Connector**: Direct API integration with Netsis ERP

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### **Installation**

1. **Install dependencies**
   ```bash
   cd services/integration-gateway
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**
   ```bash
   npm run migrate
   ```

4. **Start the service**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

### **Docker Deployment**
```bash
# Build image
docker build -t integration-gateway .

# Run container
docker run -d \
  --name integration-gateway \
  -p 8008:8008 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  integration-gateway
```

## 📡 API Documentation

### **Integration Management**

#### **Create Integration**
```http
POST /api/integrations
Content-Type: application/json
Authorization: Bearer <token>

{
  "merchantId": "merchant-123",
  "name": "Main Store Logo ERP",
  "type": "hybrid",
  "connector": "logo",
  "credentials": {
    "endpoint": "https://erp.example.com/api",
    "username": "integration_user",
    "password": "secure_password",
    "apiKey": "logo_api_key_123"
  },
  "settings": {
    "syncInterval": 300000,
    "warehouseCode": "MAIN",
    "priceListCode": "RETAIL"
  }
}
```

#### **Trigger Synchronization**
```http
POST /api/integrations/{integrationId}/sync
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "inventory",
  "priority": 1,
  "delay": 0
}
```

#### **Test Connection**
```http
POST /api/integrations/{integrationId}/test-connection
Authorization: Bearer <token>
```

### **Webhook Management**

#### **Register Webhook**
```http
POST /api/integrations/{integrationId}/webhook/register
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-platform.com/webhooks/integration",
  "events": ["product.updated", "inventory.changed", "order.created"],
  "secret": "webhook_secret_key"
}
```

#### **Webhook Endpoint**
```http
POST /webhooks/{integrationId}
Content-Type: application/json
X-Webhook-Signature: sha256=<signature>
X-Webhook-Timestamp: 2024-01-20T10:30:00Z

{
  "eventType": "product.updated",
  "data": {
    "productId": "PROD-123",
    "sku": "SKU-123",
    "price": 29.99,
    "stock": 100
  }
}
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Server Configuration
NODE_ENV=production
PORT=8008

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=integration_gateway

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-char-encryption-key-here

# External Services
PLATFORM_API_URL=https://api.cebeuygun.com
NOTIFICATION_SERVICE_URL=https://notifications.cebeuygun.com

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  integration-gateway:
    build: .
    ports:
      - "8008:8008"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: integration_gateway
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🔌 Connector Development

### **Creating Custom Connectors**

1. **Extend Base Connector**
   ```typescript
   import { AbstractBaseConnector } from '@/connectors/baseConnector';
   
   export class CustomERPConnector extends AbstractBaseConnector {
     id = 'custom-erp';
     name = 'Custom ERP Connector';
     version = '1.0.0';
     supportedOperations = ['syncProducts', 'syncInventory'];
     
     protected async establishConnection(): Promise<boolean> {
       // Implement connection logic
     }
     
     async syncProducts(mapping: DataMapping[]): Promise<SyncResult> {
       // Implement product sync
     }
   }
   ```

2. **Register Connector**
   ```typescript
   import { connectorFactory } from '@/connectors/connectorFactory';
   
   connectorFactory.registerCustomConnector(
     'custom-erp',
     () => new CustomERPConnector()
   );
   ```

### **Data Mapping Configuration**
```json
{
  "mappings": [
    {
      "sourceField": "ITEM_CODE",
      "targetField": "products.sku",
      "required": true
    },
    {
      "sourceField": "ITEM_NAME",
      "targetField": "products.name",
      "required": true
    },
    {
      "sourceField": "UNIT_PRICE",
      "targetField": "products.price",
      "transformation": "parseFloat",
      "required": true
    },
    {
      "sourceField": "ON_HAND",
      "targetField": "inventory.stock",
      "transformation": "parseInt",
      "defaultValue": 0
    }
  ]
}
```

## 📊 Monitoring & Metrics

### **Health Endpoints**
- `GET /health` - Service health status
- `GET /api/integrations/system/health` - Detailed system health

### **Metrics Endpoints**
- `GET /api/integrations/{id}/metrics` - Integration-specific metrics
- `GET /api/integrations/system/metrics` - System-wide metrics

### **Key Metrics Tracked**
- **Sync Performance**: Success rate, duration, throughput
- **Error Rates**: By integration, connector type, and error category
- **Queue Health**: Job counts, processing times, backlog size
- **System Resources**: Memory, CPU, database connections

### **Alerting Thresholds**
```typescript
const alertThresholds = {
  errorRate: 0.05,        // 5% error rate
  responseTime: 1000,     // 1 second
  queueSize: 1000,        // 1000 pending jobs
  memoryUsage: 0.85,      // 85% memory usage
  connectionFailures: 3,   // 3 consecutive failures
};
```

## 🔒 Security Features

### **Authentication & Authorization**
- JWT-based authentication for API access
- API key authentication for webhook endpoints
- Role-based access control (RBAC)
- Encrypted credential storage

### **Data Protection**
- AES-256 encryption for sensitive credentials
- Input validation and sanitization
- SQL injection and XSS protection
- Rate limiting and DDoS protection

### **Audit Logging**
- Comprehensive audit trail for all operations
- Integration event logging
- Security event monitoring
- Compliance reporting

## 🔄 Synchronization Workflows

### **Polling Workflow**
```
1. Schedule sync job → 2. Connect to ERP → 3. Fetch data → 
4. Apply mappings → 5. Validate data → 6. Update platform → 
7. Log results → 8. Schedule next sync
```

### **Webhook Workflow**
```
1. Receive webhook → 2. Validate signature → 3. Queue event → 
4. Process event → 5. Apply mappings → 6. Update platform → 
7. Send response → 8. Log results
```

### **Error Handling**
- **Exponential Backoff**: Automatic retry with increasing delays
- **Circuit Breaker**: Prevent cascade failures
- **Dead Letter Queue**: Handle permanently failed jobs
- **Alert Generation**: Notify administrators of critical issues

## 🧪 Testing

### **Unit Tests**
```bash
npm test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **Load Testing**
```bash
# Test webhook endpoint
curl -X POST http://localhost:8008/webhooks/test-integration \
  -H "Content-Type: application/json" \
  -d '{"eventType": "test", "data": {"test": true}}'
```

### **Mock ERP Testing**
The service includes mock implementations for all connectors, allowing comprehensive testing without external dependencies.

## 📈 Performance Optimization

### **Database Optimization**
- Indexed queries for fast lookups
- Connection pooling for concurrent requests
- Materialized views for complex aggregations
- Partitioning for large datasets

### **Caching Strategy**
- In-memory caching for frequently accessed data
- Redis caching for shared data across instances
- HTTP response caching for API endpoints
- Query result caching for expensive operations

### **Queue Optimization**
- Priority-based job processing
- Batch processing for bulk operations
- Parallel processing with configurable concurrency
- Job deduplication with idempotency keys

## 🚀 Deployment

### **Production Deployment**
```bash
# Build and deploy
npm run build
docker build -t integration-gateway:latest .
docker push your-registry/integration-gateway:latest

# Kubernetes deployment
kubectl apply -f k8s/
```

### **Scaling Considerations**
- **Horizontal Scaling**: Multiple instances with shared Redis
- **Queue Workers**: Separate worker instances for job processing
- **Database Sharding**: Partition by merchant or integration type
- **Load Balancing**: Distribute requests across instances

### **Monitoring Setup**
```yaml
# Prometheus metrics
- job_name: 'integration-gateway'
  static_configs:
    - targets: ['integration-gateway:8008']
  metrics_path: '/metrics'
  scrape_interval: 30s
```

## 🔧 Maintenance

### **Regular Tasks**
- **Log Rotation**: Automatic cleanup of old log files
- **Queue Cleanup**: Remove completed jobs periodically
- **Metrics Aggregation**: Daily/weekly metric summaries
- **Health Checks**: Automated integration testing

### **Troubleshooting**
```bash
# Check service health
curl http://localhost:8008/health

# View queue status
curl -H "Authorization: Bearer <token>" \
  http://localhost:8008/api/integrations/system/health

# Check integration metrics
curl -H "Authorization: Bearer <token>" \
  http://localhost:8008/api/integrations/{id}/metrics
```

## 📋 API Reference

### **Response Format**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-20T10:30:00Z",
  "requestId": "req_1234567890"
}
```

### **Error Format**
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:30:00Z",
  "requestId": "req_1234567890"
}
```

### **Pagination Format**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Service**: Integration Gateway  
**Version**: 1.0.0  
**Port**: 8008  
**Documentation**: [API Docs](http://localhost:8008/docs)