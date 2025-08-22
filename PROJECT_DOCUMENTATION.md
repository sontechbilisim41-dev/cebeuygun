# CebeUygun E-Commerce and Delivery Platform

## Project Overview

CebeUygun is a comprehensive e-commerce and food delivery platform specifically developed for the Turkish market. The platform provides an integrated ecosystem for customers, sellers, couriers, and administrators, built with modern microservices architecture.

### Key Features
- **Multi-Platform Support**: Web, mobile (iOS/Android), and admin panel
- **Real-Time Tracking**: GPS-based delivery tracking
- **Smart Courier Assignment**: Distance and availability-based automatic assignment
- **Comprehensive Payment System**: Multi-gateway payment support
- **Campaign Management**: Dynamic discount and promotion system
- **Customer Support**: Real-time chat and ticketing system

## Project Timeline

### Phase 1: Core Infrastructure (January 2024)
- **Microservices architecture** design and setup
- **Database schema** creation
- **Basic authentication** system
- **Docker containerization** and Kubernetes configuration

### Phase 2: Core Services (February 2024)
- **Auth Service**: User authentication and authorization
- **Order Service**: Order management and workflow
- **Payment Service**: Payment processing and integrations
- **Courier Service**: Courier management and assignment algorithm

### Phase 3: Advanced Features (March 2024)
- **Notification Service**: Push notifications and email
- **Reporting Service**: Analytics and reporting
- **Integration Gateway**: ERP/POS integrations
- **Support Bridge**: Customer support system

### Phase 4: Mobile Applications (April 2024)
- **Customer Mobile App**: React Native customer application
- **Courier Mobile App**: React Native courier application
- **Admin Web Dashboard**: React web management panel

### Phase 5: Observability and DevOps (May 2024)
- **OpenTelemetry** integration
- **Prometheus + Grafana** monitoring
- **ELK Stack** log management
- **CI/CD pipeline** automation

## Project Structure

```
cebeuygun-platform/
├── apps/                           # Frontend applications
│   ├── customer-rn/               # React Native customer app
│   ├── courier-rn/                # React Native courier app
│   └── admin-web/                 # React web admin panel
├── services/                       # Backend microservices
│   ├── auth/                      # Authentication service
│   ├── order/                     # Order management service
│   ├── payment/                   # Payment processing service
│   ├── courier/                   # Courier management service
│   ├── notification/              # Notification service
│   ├── reporting/                 # Reporting service
│   ├── integration-gateway/       # ERP/POS integration gateway
│   └── support-bridge/            # Customer support bridge
├── infra/                         # Infrastructure and DevOps
│   ├── seed/                      # Demo data generator
│   ├── otel/                      # OpenTelemetry configuration
│   ├── grafana/                   # Grafana dashboards
│   ├── kibana/                    # Kibana log analysis
│   └── prometheus/                # Prometheus alert rules
├── k8s/                           # Kubernetes manifests
│   ├── base/                      # Base configurations
│   ├── overlays/                  # Environment-specific configs
│   └── observability/             # Monitoring infrastructure
├── helm/                          # Helm charts
├── scripts/                       # Deployment and utility scripts
├── docs/                          # Technical documentation
└── .github/workflows/             # CI/CD pipelines
```

## Component Analysis

### Frontend Applications

#### Customer Mobile App (`apps/customer-rn/`)
- **Purpose**: Customer order placement and tracking
- **Technology**: React Native, Expo, Redux Toolkit
- **Features**: Restaurant search, cart management, payment, order tracking
- **Security**: Biometric authentication, secure storage

#### Courier Mobile App (`apps/courier-rn/`)
- **Purpose**: Courier delivery management and earnings tracking
- **Technology**: React Native, Expo, Redux Toolkit
- **Features**: GPS tracking, order accept/reject, delivery confirmation
- **Special Capabilities**: Background location tracking, offline support

#### Admin Web Dashboard (`apps/admin-web/`)
- **Purpose**: Platform management and analytics
- **Technology**: React, Material-UI, TypeScript
- **Features**: User management, order monitoring, reporting
- **Dashboards**: Real-time metrics, business intelligence

### Backend Microservices

#### Auth Service (`services/auth/`)
- **Responsibility**: User authentication and authorization
- **Technology**: Node.js, TypeScript, JWT, bcrypt
- **Features**: Multi-role authentication, token management, session handling
- **Security**: Rate limiting, password hashing, secure sessions

#### Order Service (`services/order/`)
- **Responsibility**: Order lifecycle management
- **Technology**: Node.js, TypeScript, PostgreSQL
- **Features**: Order creation, status tracking, business logic
- **Integrations**: Payment service, courier service, notification service

#### Payment Service (`services/payment/`)
- **Responsibility**: Payment processing and financial transactions
- **Technology**: Node.js, TypeScript, Stripe/PayTR integration
- **Features**: Multi-gateway support, refund handling, fraud detection
- **Security**: PCI compliance, encrypted transactions

#### Courier Service (`services/courier/`)
- **Responsibility**: Courier management and assignment algorithm
- **Technology**: Node.js, TypeScript, PostGIS
- **Features**: Location tracking, assignment optimization, route planning
- **Algorithm**: Distance-based assignment, availability checking

#### Integration Gateway (`services/integration-gateway/`)
- **Responsibility**: ERP/POS system integrations
- **Technology**: Node.js, TypeScript, BullMQ, Redis
- **Features**: Webhook handling, data mapping, sync management
- **Connectors**: CSV, Logo ERP, Netsis ERP

#### Support Bridge (`services/support-bridge/`)
- **Responsibility**: Customer support system
- **Technology**: Node.js, TypeScript, Socket.IO
- **Features**: Real-time chat, ticket integration, macro system
- **Integrations**: External ticketing systems, notification service

### Infrastructure and DevOps

#### Observability (`infra/`)
- **OpenTelemetry**: Distributed tracing and metrics
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Centralized logging and analysis
- **Jaeger**: Trace visualization

#### Kubernetes (`k8s/`)
- **Base configurations**: Core service manifests
- **Environment overlays**: Production, staging, preview
- **Security**: Network policies, RBAC, pod security
- **Scaling**: HPA, resource limits, affinity rules

#### CI/CD (`.github/workflows/`)
- **Continuous Integration**: Automated testing and linting
- **Security Scanning**: SAST, DAST, dependency scanning
- **Container Security**: Trivy, Grype vulnerability scanning
- **Deployment**: Canary releases, preview environments

## Development Process

### 1. Architectural Design
- **Domain-Driven Design** approach for service boundaries
- **Event-driven architecture** for inter-service communication
- **Database-per-service** pattern for data isolation
- **API Gateway** pattern for external interface

### 2. Backend Development
- **TypeScript** for type-safe development
- **Express.js** framework for RESTful APIs
- **PostgreSQL** for relational data modeling
- **Redis** for caching and session management

### 3. Frontend Development
- **React Native** for cross-platform mobile development
- **Redux Toolkit** for state management
- **React Navigation** for navigation handling
- **Material-UI** for consistent design system

### 4. DevOps and Deployment
- **Docker** containerization
- **Kubernetes** orchestration
- **Helm** package management
- **GitHub Actions** CI/CD automation

### 5. Monitoring and Observability
- **OpenTelemetry** instrumentation
- **Distributed tracing** implementation
- **Metrics collection** and alerting
- **Log aggregation** and analysis

## Technical Specifications

### Technology Stack
- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL, Redis
- **Frontend**: React Native, React, TypeScript
- **Mobile**: Expo SDK, React Navigation
- **Monitoring**: OpenTelemetry, Prometheus, Grafana
- **Logging**: Elasticsearch, Kibana, Loki
- **Queue**: BullMQ, Redis
- **Container**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, Helm

### Security Features
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **API Rate Limiting** and DDoS protection
- **Input Validation** and sanitization
- **GDPR/KVKK Compliance** with data protection
- **Encryption**: AES-256 for sensitive data
- **Security Headers**: Helmet.js implementation

### Performance Optimizations
- **Database Indexing**: Optimized query performance
- **Caching Strategy**: Redis multi-level caching
- **Connection Pooling**: Database connection optimization
- **Load Balancing**: Kubernetes service distribution
- **Auto-scaling**: HPA based on metrics
- **CDN Integration**: Static asset optimization

## Installation and Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Kubernetes cluster (minikube, kind, or cloud)
- PostgreSQL 15+
- Redis 7+

### Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd cebeuygun-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/courier-rn && npm install
   cd ../admin-web && npm install
   ```

3. **Database setup**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis
   
   # Run database migrations
   npm run migrate
   ```

4. **Load demo data**
   ```bash
   cd infra/seed
   npm install
   npm run seed
   ```

5. **Start services**
   ```bash
   # Development mode
   npm run dev
   
   # Production deployment
   ./scripts/deploy.sh deploy
   ```

### Environment Configuration

#### Development
```bash
# .env.development
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Production
```bash
# Managed via Kubernetes secrets
kubectl create secret generic app-secrets \
  --from-literal=db-password=<secure-password> \
  --from-literal=jwt-secret=<jwt-secret>
```

## Usage Guidelines

### Demo Accounts
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@cebeuygun.com | admin123 | Platform administrator |
| Customer | customer@demo.com | demo123 | Demo customer account |
| Courier | courier@demo.com | demo123 | Demo courier account |
| Seller | seller@demo.com | demo123 | Demo seller account |

### Demo Scenarios

#### Scenario 1: Customer Order Flow
1. **Login**: Sign in with customer@demo.com
2. **Product Search**: Browse categories or search products
3. **Add to Cart**: Add items from different restaurants
4. **Apply Coupon**: Try codes SAVE1234 or DEAL5678
5. **Place Order**: Complete order with delivery address
6. **Track Delivery**: Real-time delivery tracking

#### Scenario 2: Courier Workflow
1. **Login**: Sign in with courier@demo.com
2. **Go Online**: Activate status to receive orders
3. **Accept Order**: Accept from available orders list
4. **Navigate**: Go to pickup location
5. **Confirm Pickup**: Confirm order pickup
6. **Complete Delivery**: Deliver to customer and get confirmation

#### Scenario 3: Admin Management
1. **Login**: Sign in with admin@cebeuygun.com
2. **Dashboard**: View real-time metrics
3. **Order Management**: Monitor active orders
4. **Create Campaigns**: Add new promotions
5. **Analytics**: Review business intelligence reports

### API Usage

#### Authentication
```bash
# Login
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@demo.com", "password": "demo123"}'

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Order Creation
```bash
# Create order
curl -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest-123",
    "items": [...],
    "deliveryAddress": {...}
  }'
```

### Monitoring and Debugging

#### Health Checks
```bash
# Service health
curl http://localhost:8001/health  # Auth Service
curl http://localhost:8003/health  # Order Service
curl http://localhost:8004/health  # Payment Service
```

#### Logs
```bash
# Service logs
kubectl logs -f deployment/auth-service -n production
kubectl logs -f deployment/order-service -n production

# Aggregated logs (Kibana)
# http://localhost:5601
```

#### Metrics
```bash
# Prometheus metrics
curl http://localhost:9090/api/v1/query?query=up

# Grafana dashboards
# http://localhost:3000 (admin/admin123)
```

### Troubleshooting

#### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   kubectl get pods -l app=postgresql
   
   # Test connection
   psql -h localhost -U postgres -d cebeuygun
   ```

2. **Redis Connection Issue**
   ```bash
   # Check Redis status
   kubectl get pods -l app=redis
   
   # Test with Redis CLI
   redis-cli ping
   ```

3. **Service Discovery Issues**
   ```bash
   # Test DNS resolution
   kubectl exec -it <pod-name> -- nslookup auth-service
   
   # Check service endpoints
   kubectl get endpoints
   ```

#### Log Analysis
```bash
# Error logs
kubectl logs -l app=auth-service --since=1h | grep ERROR

# Performance logs
kubectl logs -l app=order-service --since=30m | grep "slow query"
```

### Deployment

#### Development
```bash
# Local development
npm run dev

# Docker Compose
docker-compose -f docker-compose.dev.yml up
```

#### Staging
```bash
# Staging deployment
kubectl apply -k k8s/overlays/staging
```

#### Production
```bash
# Production deployment with canary
./scripts/deploy.sh canary v1.2.0

# Full production deployment
./scripts/deploy.sh deploy
```

### Backup and Recovery

#### Database Backup
```bash
# PostgreSQL backup
kubectl exec postgresql-0 -- pg_dump cebeuygun > backup.sql

# Restore
kubectl exec -i postgresql-0 -- psql cebeuygun < backup.sql
```

#### Configuration Backup
```bash
# Kubernetes configurations
kubectl get all -o yaml > k8s-backup.yaml

# Helm releases
helm list --all-namespaces > helm-releases.txt
```

## Performance and Scalability

### Scalability Metrics
- **Concurrent Users**: 10,000+ simultaneous users
- **Order Throughput**: 1,000+ orders per minute
- **Response Time**: <200ms average API response
- **Availability**: 99.9% uptime SLA

### Optimization Strategies
- **Database Sharding**: User-based data partitioning
- **Caching Layers**: Multi-level Redis caching
- **CDN Integration**: Static asset optimization
- **Auto-scaling**: Kubernetes HPA configuration

### Monitoring KPIs
- **Business Metrics**: GMV, order volume, delivery time
- **Technical Metrics**: Error rate, response time, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **User Experience**: App performance, crash rates

This documentation provides a comprehensive overview of the CebeUygun platform and helps developers, DevOps engineers, and system administrators effectively understand and manage the platform.