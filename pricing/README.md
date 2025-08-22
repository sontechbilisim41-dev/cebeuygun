# Pricing & Commission Service

Comprehensive pricing and commission calculation service with versioned pricing rules, feature flags for gradual rollout, and advanced analytics for e-commerce platforms.

## 🎯 Features

- **Multi-Dimensional Commission Rates**: Category, seller, and logistics provider-based commission configuration
- **Versioned Pricing Rules**: Time-based pricing rules with effective date ranges
- **Feature Flags**: Gradual rollout and A/B testing capabilities
- **Regional Pricing**: Location-based pricing variations
- **Performance Optimization**: Redis caching and local cache for high-volume requests
- **Comprehensive Analytics**: Detailed pricing and commission analytics

## 🛠 Tech Stack

- **Language**: Go 1.22
- **Framework**: Gin HTTP framework
- **Database**: PostgreSQL with JSONB for flexible configuration
- **Cache**: Redis for distributed caching + in-memory cache for performance
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Go Playground Validator

## 📊 API Endpoints

### **Core Pricing**

#### `POST /api/v1/quote`
**Main endpoint** - Calculate comprehensive pricing quote with commission breakdown.

**Request:**
```json
{
  "customer_id": "uuid",
  "seller_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "unit_price": 25.50,
      "category_id": "uuid",
      "tags": ["electronics", "mobile"],
      "weight": 0.5
    }
  ],
  "delivery_address": {
    "street": "Istiklal Caddesi 123",
    "city": "Istanbul",
    "district": "Beyoğlu",
    "country": "TR",
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "pickup_address": {
    "street": "Seller Address",
    "city": "Istanbul",
    "district": "Kadıköy",
    "country": "TR",
    "latitude": 41.0186,
    "longitude": 29.0023
  },
  "is_express_delivery": true,
  "coupon_codes": ["SAVE20"],
  "currency": "TRY",
  "context": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "session_id": "session_123",
    "ab_test_group": "group_a"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote calculated successfully",
  "data": {
    "quote_id": "uuid",
    "subtotal": 51.00,
    "tax_amount": 9.18,
    "delivery_fee": 20.00,
    "small_basket_fee": 0.00,
    "total_amount": 80.18,
    "currency": "TRY",
    "commission_breakdown": {
      "total_commission": 7.65,
      "seller_commission": 6.50,
      "category_commission": 0.77,
      "logistics_commission": 0.38,
      "currency": "TRY",
      "details": [...]
    },
    "pricing_breakdown": {
      "item_total": 51.00,
      "subtotal": 51.00,
      "tax_amount": 9.18,
      "delivery_fee": 20.00,
      "small_basket_fee": 0.00,
      "total_amount": 80.18,
      "currency": "TRY",
      "calculations": [...]
    },
    "applied_rules": [...],
    "valid_until": "2025-01-18T16:15:00Z",
    "feature_flags": {
      "dynamic_pricing": true,
      "express_delivery_multiplier": 2.0
    }
  },
  "processing_time_ms": 45
}
```

### **Commission Management**

- `POST /api/v1/commission-rates` - Create commission rate
- `GET /api/v1/commission-rates/{id}` - Get commission rate
- `PUT /api/v1/commission-rates/{id}` - Update commission rate
- `PUT /api/v1/commission-rates/bulk` - Bulk update commission rates

### **Pricing Rules**

- `POST /api/v1/pricing-rules` - Create versioned pricing rule
- `GET /api/v1/pricing-rules/{id}` - Get pricing rule
- `PUT /api/v1/pricing-rules/{id}` - Update pricing rule
- `DELETE /api/v1/pricing-rules/{id}` - Delete pricing rule
- `GET /api/v1/pricing-rules/versions?name=rule_name` - Get rule versions

### **Feature Flags**

- `POST /api/v1/feature-flags` - Create feature flag
- `GET /api/v1/feature-flags/{id}` - Get feature flag
- `GET /api/v1/feature-flags/key/{key}` - Get feature flag by key
- `POST /api/v1/feature-flags/{key}/evaluate` - Evaluate feature flag
- `PUT /api/v1/feature-flags/{id}` - Update feature flag

### **Analytics**

- `GET /api/v1/analytics/pricing` - Pricing analytics
- `GET /api/v1/analytics/commission` - Commission analytics

## 🗄 Database Schema

### **Commission Rates Table**
```sql
CREATE TABLE commission_rates (
    id UUID PRIMARY KEY,
    category_id UUID,                    -- Product category
    seller_id UUID,                      -- Specific seller
    logistics_provider VARCHAR(100),     -- Delivery provider
    commission_type VARCHAR(20),         -- PERCENTAGE, FLAT, TIERED
    rate DECIMAL(10,4),                  -- Commission rate/amount
    min_amount DECIMAL(12,2),            -- Minimum commission
    max_amount DECIMAL(12,2),            -- Maximum commission
    currency CHAR(3),                    -- Currency code
    region VARCHAR(100),                 -- Geographic region
    effective_from TIMESTAMPTZ,          -- Start date
    effective_to TIMESTAMPTZ,            -- End date (optional)
    is_active BOOLEAN,                   -- Active status
    priority INTEGER,                    -- Priority for conflict resolution
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### **Pricing Rules Table (Versioned)**
```sql
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(100),                   -- Rule name
    type VARCHAR(50),                    -- Rule type
    configuration JSONB,                 -- Flexible rule configuration
    region VARCHAR(100),                 -- Geographic scope
    effective_from TIMESTAMPTZ,          -- Start date
    effective_to TIMESTAMPTZ,            -- End date (optional)
    is_active BOOLEAN,                   -- Active status
    version INTEGER,                     -- Version number
    created_by UUID,                     -- Creator
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

### **Feature Flags Table**
```sql
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY,
    key VARCHAR(50) UNIQUE,              -- Feature key
    name VARCHAR(100),                   -- Display name
    description TEXT,                    -- Description
    type VARCHAR(20),                    -- BOOLEAN, STRING, NUMBER, PERCENTAGE
    value JSONB,                         -- Feature value
    is_enabled BOOLEAN,                  -- Enabled status
    rollout JSONB,                       -- Rollout configuration
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## 💰 Commission Configuration

### **Three-Dimensional Commission Rates**

1. **Category-Based**: Different rates for different product categories
2. **Seller-Based**: Specific rates for individual sellers
3. **Logistics-Based**: Rates based on delivery provider

### **Commission Types**

- **Percentage**: Rate as percentage of item value
- **Flat**: Fixed amount per item/order
- **Tiered**: Progressive rates based on order value

### **Priority System**
- Higher priority rates override lower priority
- Specific configurations (seller+category) override general rules
- Regional rates can override global rates

## 🎛 Feature Flag System

### **Gradual Rollout**
- **Percentage Rollout**: Gradual user percentage increase
- **User Segment Targeting**: Specific user groups
- **Regional Rollout**: Geographic-based rollout
- **Time-Based Rollout**: Scheduled activation

### **A/B Testing Support**
- **Test Group Assignment**: Consistent user assignment
- **Metric Tracking**: Performance comparison
- **Automatic Rollback**: Safety mechanisms

## 📈 Performance Features

### **Caching Strategy**
- **Local Cache**: In-memory cache for frequently accessed data
- **Redis Cache**: Distributed cache for quote results
- **Feature Flag Cache**: 5-minute cache refresh cycle
- **Quote Caching**: 15-minute quote validity with hash-based caching

### **Concurrency Control**
- **Semaphore Limiting**: Max concurrent quote calculations
- **Rate Limiting**: Request throttling
- **Timeout Handling**: 2-second quote timeout
- **Background Workers**: Cache refresh and cleanup

## 🧪 Test Matrix

### **Commission Rate Combinations**
- ✅ Category-only rates
- ✅ Seller-only rates  
- ✅ Logistics-only rates
- ✅ Category + Seller combination
- ✅ Category + Logistics combination
- ✅ Seller + Logistics combination
- ✅ All three dimensions combined
- ✅ Regional variations for each combination

### **Delivery Fee Scenarios**
- ✅ Standard delivery
- ✅ Express delivery
- ✅ Distance-based pricing
- ✅ Regional fee variations
- ✅ Small basket fee application
- ✅ Free delivery promotions

### **Date Range Effectiveness**
- ✅ Current effective rules
- ✅ Future effective rules
- ✅ Expired rules exclusion
- ✅ Overlapping date ranges
- ✅ Version precedence

### **Regional Pricing Variations**
- ✅ City-specific pricing
- ✅ Country-specific pricing
- ✅ Default fallback pricing
- ✅ Regional commission rates
- ✅ Regional delivery fees

## 🚀 Development

### **Setup**
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

### **Testing**
```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...

# Run test matrix
go test -v ./internal/service -run TestPricingMatrix
```

### **Building**
```bash
# Build binary
go build -o pricing cmd/main.go

# Build Docker image
docker build -t pricing-service .
```

## 📊 Monitoring & Analytics

### **Performance Metrics**
- Quote calculation latency (target: <100ms)
- Cache hit rates
- Commission calculation accuracy
- Feature flag evaluation performance

### **Business Metrics**
- Total commission revenue
- Average commission rates by category
- Regional pricing variations
- Feature flag adoption rates

### **Health Monitoring**
- Database connectivity
- Redis connectivity
- Quote processing capacity
- Cache performance

## 🔧 Configuration Examples

### **Commission Rate Configuration**
```json
{
  "category_id": "electronics_uuid",
  "seller_id": "premium_seller_uuid",
  "commission_type": "PERCENTAGE",
  "rate": 12.50,
  "min_amount": 5.00,
  "max_amount": 100.00,
  "currency": "TRY",
  "region": "Istanbul",
  "effective_from": "2025-01-01T00:00:00Z",
  "priority": 200
}
```

### **Pricing Rule Configuration**
```json
{
  "name": "Istanbul Express Delivery",
  "type": "EXPRESS_FEE",
  "configuration": {
    "base_fee": 15.00,
    "multiplier": 1.5,
    "max_fee": 50.00,
    "distance_factor": 2.0
  },
  "region": "Istanbul",
  "effective_from": "2025-01-01T00:00:00Z"
}
```

### **Feature Flag Configuration**
```json
{
  "key": "dynamic_pricing",
  "name": "Dynamic Pricing",
  "description": "Enable dynamic pricing based on demand",
  "type": "BOOLEAN",
  "value": true,
  "is_enabled": true,
  "rollout": {
    "percentage": 50.0,
    "user_segments": ["premium", "vip"],
    "regions": ["Istanbul", "Ankara"]
  }
}
```

This Pricing & Commission Service provides a robust, scalable foundation for complex pricing scenarios with comprehensive commission management, versioned rules, and feature flag capabilities for gradual rollout and A/B testing.