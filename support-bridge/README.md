# Customer Support Bridge Service

A comprehensive customer support system that bridges real-time chat functionality with ticket management through a unified API and WebSocket interface.

## 🎯 Overview

The Support Bridge Service provides seamless integration between chat sessions and ticket management, enabling customers to get instant support while maintaining comprehensive ticket tracking and agent workflow management.

## 🏗️ Architecture

### **Core Components**
- **Chat Service**: Real-time WebSocket-based chat with Socket.IO
- **Ticket Service**: Integration with external ticketing systems
- **Macro Service**: Pre-defined response templates and automation
- **Webhook Service**: Event-driven notifications and integrations
- **Cache Service**: Redis-based caching for performance optimization

### **Key Features**
1. **Real-time Chat**: WebSocket-based instant messaging
2. **Ticket Integration**: Automatic chat-to-ticket conversion
3. **Order Context**: Automatic order linking for support requests
4. **Macro System**: Pre-defined responses for common inquiries
5. **Escalation System**: Emergency call functionality
6. **Agent Management**: Load balancing and availability tracking

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### **Installation**

1. **Install dependencies**
   ```bash
   cd services/support-bridge
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
docker build -t support-bridge .

# Run container
docker run -d \
  --name support-bridge \
  -p 8009:8009 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  support-bridge
```

## 📡 API Documentation

### **Chat Management**

#### **Create Chat Session**
```http
POST /api/chat/sessions
Content-Type: application/json

{
  "customerId": "customer-123",
  "orderId": "order-456",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

#### **Get Chat History**
```http
GET /api/chat/sessions/{sessionId}/messages?limit=50
Authorization: Bearer <token>
```

#### **End Chat Session**
```http
DELETE /api/chat/sessions/{sessionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "resolved"
}
```

### **Ticket Management**

#### **Create Ticket**
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer-123",
  "orderId": "order-456",
  "subject": "Order delivery issue",
  "description": "My order hasn't arrived yet",
  "priority": "medium",
  "category": "delivery_delay"
}
```

#### **Update Ticket**
```http
PUT /api/tickets/{ticketId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "assignedTo": "agent-123",
  "tags": ["resolved", "delivery"]
}
```

### **Macro System**

#### **Get Macros**
```http
GET /api/chat/macros?category=greeting&search=welcome
Authorization: Bearer <token>
```

#### **Use Macro**
```http
POST /api/chat/macros/{macroId}/use
Authorization: Bearer <token>
Content-Type: application/json

{
  "variables": {
    "customerName": "John Doe",
    "orderNumber": "ORD-123456"
  }
}
```

## 🔌 WebSocket Events

### **Client Events**
```javascript
// Join chat as customer
socket.emit('join_chat', {
  customerId: 'customer-123',
  orderId: 'order-456',
  customerInfo: { ... }
});

// Send message
socket.emit('send_message', {
  sessionId: 'session-123',
  content: 'Hello, I need help with my order',
  messageType: 'text'
});

// Typing indicator
socket.emit('typing', {
  sessionId: 'session-123',
  isTyping: true
});

// Escalate to call
socket.emit('escalate_call', {
  sessionId: 'session-123',
  reason: 'urgent_delivery_issue'
});
```

### **Server Events**
```javascript
// Session created
socket.on('session_created', (data) => {
  console.log('Chat session created:', data.session);
});

// New message received
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Agent joined
socket.on('agent_joined', (data) => {
  console.log('Agent joined:', data.agent);
});

// Call escalated
socket.on('call_escalated', (data) => {
  console.log('Call escalated:', data.reason);
});
```

## 🎮 **Demo Features**

### **Complete Support Flow**
1. **Customer initiates chat** from order screen
2. **Automatic ticket creation** with order context
3. **Agent assignment** based on availability and skills
4. **Real-time messaging** with typing indicators
5. **Macro usage** for quick responses
6. **Escalation to call** for urgent issues
7. **Session completion** with satisfaction survey

### **Agent Dashboard Features**
- **Active chat sessions** with customer context
- **Ticket queue** with priority sorting
- **Macro library** with search and categories
- **Performance metrics** and response time tracking

### **Customer Experience**
- **Seamless chat widget** integration
- **Order context** automatically loaded
- **File upload** support for screenshots
- **Mobile-optimized** interface

## 🔒 Security Features

### **Authentication & Authorization**
- **JWT-based authentication** for API access
- **Role-based access control** (customer, agent, admin)
- **API key authentication** for webhook endpoints
- **Session-based chat** authentication

### **Data Protection**
- **Message encryption** in transit and at rest
- **PII data masking** in logs
- **Secure file uploads** with virus scanning
- **GDPR compliance** with data retention policies

### **Rate Limiting & Protection**
- **API rate limiting** to prevent abuse
- **WebSocket connection limits** per user
- **Input validation** and sanitization
- **DDoS protection** with request throttling

## 📊 Monitoring & Metrics

### **Key Metrics Tracked**
- **Chat Metrics**: Active sessions, response times, satisfaction scores
- **Ticket Metrics**: Creation rate, resolution time, escalation rate
- **Agent Metrics**: Utilization, performance, customer satisfaction
- **System Metrics**: Connection count, message throughput, error rates

### **Health Endpoints**
- `GET /health` - Service health status
- `GET /api/chat/metrics` - Chat system metrics
- `GET /api/tickets/metrics` - Ticket system metrics

### **Alerting Thresholds**
```typescript
const alertThresholds = {
  responseTime: 300000,      // 5 minutes
  queueSize: 50,             // 50 waiting customers
  errorRate: 0.05,           // 5% error rate
  agentUtilization: 0.9,     // 90% agent capacity
};
```

## 🔄 Integration Workflows

### **Chat-to-Ticket Flow**
```
1. Customer starts chat → 2. Session created → 3. Agent assigned → 
4. Ticket auto-created → 5. Messages synced → 6. Resolution tracked
```

### **Order Support Flow**
```
1. Order screen chat → 2. Order context loaded → 3. Priority assigned → 
4. Specialized agent → 5. Order-specific macros → 6. Resolution
```

### **Escalation Flow**
```
1. Escalation trigger → 2. Priority upgrade → 3. Call notification → 
4. Agent assignment → 5. Customer callback → 6. Issue resolution
```

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
# Test WebSocket connections
npm run test:load:websocket

# Test API endpoints
npm run test:load:api
```

## 📈 Performance Optimization

### **Caching Strategy**
- **Session caching** for active chat sessions
- **Message caching** for recent conversation history
- **Macro caching** for quick response templates
- **Agent status caching** for load balancing

### **Database Optimization**
- **Indexed queries** for fast ticket retrieval
- **Connection pooling** for concurrent requests
- **Read replicas** for analytics queries
- **Partitioning** for large message tables

### **WebSocket Optimization**
- **Connection pooling** with sticky sessions
- **Message batching** for high-frequency updates
- **Compression** for large payloads
- **Heartbeat monitoring** for connection health

## 🚀 Deployment

### **Production Deployment**
```bash
# Build and deploy
npm run build
docker build -t support-bridge:latest .
docker push your-registry/support-bridge:latest

# Kubernetes deployment
kubectl apply -f k8s/
```

### **Scaling Considerations**
- **Horizontal scaling** with Redis session sharing
- **Load balancing** with sticky sessions for WebSocket
- **Database sharding** by customer or time period
- **CDN integration** for file uploads

### **Monitoring Setup**
```yaml
# Prometheus metrics
- job_name: 'support-bridge'
  static_configs:
    - targets: ['support-bridge:8009']
  metrics_path: '/metrics'
  scrape_interval: 30s
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Server Configuration
NODE_ENV=production
PORT=8009

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=support_bridge

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=1

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=session-secret-key
WEBHOOK_SECRET=webhook-secret-key

# External Services
TICKETING_API_URL=https://tickets.cebeuygun.com
TICKETING_API_KEY=ticketing-api-key
ORDER_SERVICE_URL=http://order-service:8003
NOTIFICATION_SERVICE_URL=http://notification-service:8006

# Chat Configuration
MAX_CONCURRENT_SESSIONS=100
SESSION_TIMEOUT=1800000
MAX_FILE_SIZE=10485760
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
  "timestamp": "2024-01-20T10:30:00Z",
  "requestId": "req_1234567890"
}
```

### **WebSocket Message Format**
```json
{
  "type": "new_message",
  "payload": {
    "id": "msg_123",
    "content": "Hello",
    "senderId": "customer-123",
    "timestamp": "2024-01-20T10:30:00Z"
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

**Service**: Support Bridge  
**Version**: 1.0.0  
**Port**: 8009  
**Documentation**: [API Docs](http://localhost:8009/docs)