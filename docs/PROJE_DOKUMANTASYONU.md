# CebeUygun E-Ticaret ve Teslimat Platformu

## Proje Genel Bakış

CebeUygun, Türkiye pazarına özel olarak geliştirilmiş kapsamlı bir e-ticaret ve yemek teslimat platformudur. Platform, müşteriler, satıcılar, kuryeler ve yöneticiler için entegre bir ekosistem sunarak modern mikroservis mimarisi ile geliştirilmiştir.

### Ana Özellikler
- **Çok Platformlu Destek**: Web, mobil (iOS/Android) ve admin paneli
- **Gerçek Zamanlı Takip**: GPS tabanlı teslimat takibi
- **Akıllı Kurye Atama**: Mesafe ve müsaitlik bazlı otomatik atama
- **Kapsamlı Ödeme Sistemi**: Çoklu ödeme yöntemi desteği
- **Kampanya Yönetimi**: Dinamik indirim ve promosyon sistemi
- **Müşteri Desteği**: Gerçek zamanlı chat ve ticket sistemi

## Proje Zaman Çizelgesi

### Faz 1: Temel Altyapı (Ocak 2024)
- **Mikroservis mimarisi** tasarımı ve kurulumu
- **Veritabanı şeması** oluşturulması
- **Temel kimlik doğrulama** sistemi
- **Docker containerization** ve Kubernetes yapılandırması

### Faz 2: Core Servisler (Şubat 2024)
- **Auth Service**: Kullanıcı kimlik doğrulama ve yetkilendirme
- **Order Service**: Sipariş yönetimi ve iş akışı
- **Payment Service**: Ödeme işleme ve entegrasyonları
- **Courier Service**: Kurye yönetimi ve atama algoritması

### Faz 3: İleri Özellikler (Mart 2024)
- **Notification Service**: Push bildirimleri ve e-posta
- **Reporting Service**: Analitik ve raporlama
- **Integration Gateway**: ERP/POS entegrasyonları
- **Support Bridge**: Müşteri destek sistemi

### Faz 4: Mobil Uygulamalar (Nisan 2024)
- **Customer Mobile App**: React Native müşteri uygulaması
- **Courier Mobile App**: React Native kurye uygulaması
- **Admin Web Dashboard**: React web yönetim paneli

### Faz 5: Gözlemlenebilirlik ve DevOps (Mayıs 2024)
- **OpenTelemetry** entegrasyonu
- **Prometheus + Grafana** monitoring
- **ELK Stack** log yönetimi
- **CI/CD pipeline** otomasyonu

## Proje Yapısı

```
cebeuygun-platform/
├── apps/                           # Frontend uygulamaları
│   ├── customer-rn/               # React Native müşteri uygulaması
│   ├── courier-rn/                # React Native kurye uygulaması
│   └── admin-web/                 # React web admin paneli
├── services/                       # Backend mikroservisler
│   ├── auth/                      # Kimlik doğrulama servisi
│   ├── order/                     # Sipariş yönetimi servisi
│   ├── payment/                   # Ödeme işleme servisi
│   ├── courier/                   # Kurye yönetimi servisi
│   ├── notification/              # Bildirim servisi
│   ├── reporting/                 # Raporlama servisi
│   ├── integration-gateway/       # ERP/POS entegrasyon gateway
│   └── support-bridge/            # Müşteri destek köprüsü
├── infra/                         # Altyapı ve DevOps
│   ├── seed/                      # Demo veri üretici
│   ├── otel/                      # OpenTelemetry yapılandırması
│   ├── grafana/                   # Grafana dashboard'ları
│   ├── kibana/                    # Kibana log analizi
│   └── prometheus/                # Prometheus alert kuralları
├── k8s/                           # Kubernetes manifestleri
│   ├── base/                      # Temel yapılandırmalar
│   ├── overlays/                  # Ortam-özel yapılandırmalar
│   └── observability/             # Monitoring altyapısı
├── helm/                          # Helm chart'ları
├── scripts/                       # Deployment ve yardımcı scriptler
├── docs/                          # Teknik dokümantasyon
└── .github/workflows/             # CI/CD pipeline'ları
```

## Bileşen Analizi

### Frontend Uygulamaları

#### Customer Mobile App (`apps/customer-rn/`)
- **Amaç**: Müşterilerin sipariş vermesi ve takip etmesi
- **Teknoloji**: React Native, Expo, Redux Toolkit
- **Özellikler**: Restoran arama, sepet yönetimi, ödeme, sipariş takibi
- **Güvenlik**: Biometric authentication, secure storage

#### Courier Mobile App (`apps/courier-rn/`)
- **Amaç**: Kuryelerin teslimat yapması ve kazanç takibi
- **Teknoloji**: React Native, Expo, Redux Toolkit
- **Özellikler**: GPS tracking, sipariş kabul/ret, teslimat onayı
- **Özel Yetenekler**: Background location tracking, offline support

#### Admin Web Dashboard (`apps/admin-web/`)
- **Amaç**: Platform yönetimi ve analitik
- **Teknoloji**: React, Material-UI, TypeScript
- **Özellikler**: Kullanıcı yönetimi, sipariş monitoring, raporlama
- **Dashboard'lar**: Real-time metrics, business intelligence

### Backend Mikroservisler

#### Auth Service (`services/auth/`)
- **Sorumluluk**: Kullanıcı kimlik doğrulama ve yetkilendirme
- **Teknoloji**: Node.js, TypeScript, JWT, bcrypt
- **Özellikler**: Multi-role authentication, token management, session handling
- **Güvenlik**: Rate limiting, password hashing, secure sessions

#### Order Service (`services/order/`)
- **Sorumluluk**: Sipariş yaşam döngüsü yönetimi
- **Teknoloji**: Node.js, TypeScript, PostgreSQL
- **Özellikler**: Order creation, status tracking, business logic
- **Entegrasyonlar**: Payment service, courier service, notification service

#### Payment Service (`services/payment/`)
- **Sorumluluk**: Ödeme işleme ve finansal işlemler
- **Teknoloji**: Node.js, TypeScript, Stripe/PayTR entegrasyonu
- **Özellikler**: Multi-gateway support, refund handling, fraud detection
- **Güvenlik**: PCI compliance, encrypted transactions

#### Courier Service (`services/courier/`)
- **Sorumluluk**: Kurye yönetimi ve atama algoritması
- **Teknoloji**: Node.js, TypeScript, PostGIS
- **Özellikler**: Location tracking, assignment optimization, route planning
- **Algoritma**: Distance-based assignment, availability checking

#### Integration Gateway (`services/integration-gateway/`)
- **Sorumluluk**: ERP/POS sistemleri ile entegrasyon
- **Teknoloji**: Node.js, TypeScript, BullMQ, Redis
- **Özellikler**: Webhook handling, data mapping, sync management
- **Connectors**: CSV, Logo ERP, Netsis ERP

#### Support Bridge (`services/support-bridge/`)
- **Sorumluluk**: Müşteri destek sistemi
- **Teknoloji**: Node.js, TypeScript, Socket.IO
- **Özellikler**: Real-time chat, ticket integration, macro system
- **Entegrasyonlar**: External ticketing systems, notification service

### Altyapı ve DevOps

#### Observability (`infra/`)
- **OpenTelemetry**: Distributed tracing ve metrics
- **Prometheus**: Metrics collection ve alerting
- **Grafana**: Visualization ve dashboard'lar
- **ELK Stack**: Centralized logging ve analysis
- **Jaeger**: Trace visualization

#### Kubernetes (`k8s/`)
- **Base configurations**: Temel service manifestleri
- **Environment overlays**: Production, staging, preview
- **Security**: Network policies, RBAC, pod security
- **Scaling**: HPA, resource limits, affinity rules

#### CI/CD (`.github/workflows/`)
- **Continuous Integration**: Automated testing ve linting
- **Security Scanning**: SAST, DAST, dependency scanning
- **Container Security**: Trivy, Grype vulnerability scanning
- **Deployment**: Canary releases, preview environments

## Geliştirme Süreci

### 1. Mimari Tasarım
- **Domain-Driven Design** yaklaşımı ile servis sınırları belirlendi
- **Event-driven architecture** ile servisler arası iletişim tasarlandı
- **Database-per-service** pattern ile veri izolasyonu sağlandı
- **API Gateway** pattern ile external interface oluşturuldu

### 2. Backend Geliştirme
- **TypeScript** ile type-safe development
- **Express.js** framework ile RESTful API'ler
- **PostgreSQL** ile relational data modeling
- **Redis** ile caching ve session management

### 3. Frontend Geliştirme
- **React Native** ile cross-platform mobile development
- **Redux Toolkit** ile state management
- **React Navigation** ile navigation handling
- **Material-UI** ile consistent design system

### 4. DevOps ve Deployment
- **Docker** containerization
- **Kubernetes** orchestration
- **Helm** package management
- **GitHub Actions** CI/CD automation

### 5. Monitoring ve Observability
- **OpenTelemetry** instrumentation
- **Distributed tracing** implementation
- **Metrics collection** ve alerting
- **Log aggregation** ve analysis

## Teknik Özellikler

### Teknoloji Stack'i
- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL, Redis
- **Frontend**: React Native, React, TypeScript
- **Mobile**: Expo SDK, React Navigation
- **Monitoring**: OpenTelemetry, Prometheus, Grafana
- **Logging**: Elasticsearch, Kibana, Loki
- **Queue**: BullMQ, Redis
- **Container**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, Helm

### Güvenlik Özellikleri
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **API Rate Limiting** ve DDoS protection
- **Input Validation** ve sanitization
- **GDPR/KVKK Compliance** with data protection
- **Encryption**: AES-256 for sensitive data
- **Security Headers**: Helmet.js implementation

### Performans Optimizasyonları
- **Database Indexing**: Optimized query performance
- **Caching Strategy**: Redis multi-level caching
- **Connection Pooling**: Database connection optimization
- **Load Balancing**: Kubernetes service distribution
- **Auto-scaling**: HPA based on metrics
- **CDN Integration**: Static asset optimization

## Kurulum ve Yapılandırma

### Ön Gereksinimler
- Node.js 20+
- Docker ve Docker Compose
- Kubernetes cluster (minikube, kind, veya cloud)
- PostgreSQL 15+
- Redis 7+

### Hızlı Başlangıç

1. **Repository klonlama**
   ```bash
   git clone <repository-url>
   cd cebeuygun-platform
   ```

2. **Bağımlılıkları yükleme**
   ```bash
   npm install
   cd apps/courier-rn && npm install
   cd ../admin-web && npm install
   ```

3. **Veritabanı kurulumu**
   ```bash
   # PostgreSQL ve Redis başlatma
   docker-compose up -d postgres redis
   
   # Veritabanı migration'ları çalıştırma
   npm run migrate
   ```

4. **Demo veri yükleme**
   ```bash
   cd infra/seed
   npm install
   npm run seed
   ```

5. **Servisleri başlatma**
   ```bash
   # Development mode
   npm run dev
   
   # Production deployment
   ./scripts/deploy.sh deploy
   ```

### Ortam Yapılandırması

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
# Kubernetes secrets ile yönetilir
kubectl create secret generic app-secrets \
  --from-literal=db-password=<secure-password> \
  --from-literal=jwt-secret=<jwt-secret>
```

## Kullanım Kılavuzu

### Demo Hesapları
| Rol | Email | Şifre | Açıklama |
|-----|-------|-------|----------|
| Admin | admin@cebeuygun.com | admin123 | Platform yöneticisi |
| Müşteri | customer@demo.com | demo123 | Demo müşteri hesabı |
| Kurye | courier@demo.com | demo123 | Demo kurye hesabı |
| Satıcı | seller@demo.com | demo123 | Demo satıcı hesabı |

### Demo Senaryoları

#### Senaryo 1: Müşteri Sipariş Akışı
1. **Giriş**: customer@demo.com ile giriş yapın
2. **Ürün Arama**: Kategorilere göz atın veya arama yapın
3. **Sepete Ekleme**: Farklı restoranlardan ürünler ekleyin
4. **Kupon Kullanımı**: SAVE1234 veya DEAL5678 kodlarını deneyin
5. **Sipariş Verme**: Teslimat adresi ile siparişi tamamlayın
6. **Takip**: Gerçek zamanlı teslimat takibi

#### Senaryo 2: Kurye İş Akışı
1. **Giriş**: courier@demo.com ile giriş yapın
2. **Çevrimiçi Olma**: Sipariş almak için aktif duruma geçin
3. **Sipariş Kabul**: Mevcut siparişlerden birini kabul edin
4. **Navigasyon**: Alım noktasına gitme
5. **Alım Onayı**: Siparişi aldığınızı onaylayın
6. **Teslimat**: Müşteriye teslim edin ve onay alın

#### Senaryo 3: Admin Yönetimi
1. **Giriş**: admin@cebeuygun.com ile giriş yapın
2. **Dashboard**: Gerçek zamanlı metrikleri görüntüleyin
3. **Sipariş Yönetimi**: Aktif siparişleri izleyin
4. **Kampanya Oluşturma**: Yeni promosyonlar ekleyin
5. **Analitik**: İş zekası raporlarını inceleyin

### API Kullanımı

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

### Monitoring ve Debugging

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

#### Yaygın Sorunlar

1. **Veritabanı Bağlantı Hatası**
   ```bash
   # PostgreSQL durumunu kontrol et
   kubectl get pods -l app=postgresql
   
   # Bağlantıyı test et
   psql -h localhost -U postgres -d cebeuygun
   ```

2. **Redis Bağlantı Sorunu**
   ```bash
   # Redis durumunu kontrol et
   kubectl get pods -l app=redis
   
   # Redis CLI ile test
   redis-cli ping
   ```

3. **Service Discovery Sorunları**
   ```bash
   # DNS çözümlemeyi test et
   kubectl exec -it <pod-name> -- nslookup auth-service
   
   # Service endpoints
   kubectl get endpoints
   ```

#### Log Analizi
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

### Backup ve Recovery

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

## Performans ve Ölçeklenebilirlik

### Ölçeklenebilirlik Metrikleri
- **Concurrent Users**: 10,000+ simultaneous users
- **Order Throughput**: 1,000+ orders per minute
- **Response Time**: <200ms average API response
- **Availability**: 99.9% uptime SLA

### Optimizasyon Stratejileri
- **Database Sharding**: User-based data partitioning
- **Caching Layers**: Multi-level Redis caching
- **CDN Integration**: Static asset optimization
- **Auto-scaling**: Kubernetes HPA configuration

### Monitoring KPI'ları
- **Business Metrics**: GMV, order volume, delivery time
- **Technical Metrics**: Error rate, response time, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **User Experience**: App performance, crash rates

Bu dokümantasyon, CebeUygun platformunun kapsamlı bir genel bakışını sunmakta ve geliştiricilerin, DevOps mühendislerinin ve sistem yöneticilerinin platformu etkili bir şekilde anlayıp yönetmelerine yardımcı olmaktadır.