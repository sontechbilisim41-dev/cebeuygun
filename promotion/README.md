# Promotion Service

Comprehensive campaign and coupon rule engine with Domain Specific Language (DSL) for managing promotional campaigns, loyalty rewards, and discount systems.

## 🎯 Features

- **Rule Engine DSL**: Flexible condition and effect system for campaign rules
- **Multi-Campaign Support**: Concurrent campaign execution with conflict resolution
- **Coupon Pool Management**: Automated coupon generation and distribution
- **Fraud Prevention**: Usage limits, geographic restrictions, and velocity checks
- **Audit Logging**: Comprehensive trail of all promotional activities
- **Performance Optimization**: Redis caching and optimized database queries

## 🛠 Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify for high-performance HTTP handling
- **Database**: PostgreSQL with JSONB for flexible rule storage
- **Caching**: Redis for performance optimization
- **Validation**: Zod schemas for type-safe request/response validation
- **Logging**: Winston with audit-specific loggers

## 🎨 Rule Engine DSL

### **Condition Types**
- **`user_role`**: Customer role validation (customer, seller, courier, admin)
- **`location`**: Geographic restrictions (city, district, country)
- **`time`**: Time-based conditions (hour, day_of_week, date_range)
- **`cart_total`**: Order amount thresholds
- **`product_tags`**: Product tag matching
- **`product_categories`**: Category-based conditions
- **`order_count`**: Customer order history
- **`customer_segment`**: Customer tier (new, regular, vip, premium)

### **Operators**
- **Comparison**: `equals`, `not_equals`, `greater_than`, `less_than`, `greater_equal`, `less_equal`
- **Set Operations**: `in`, `not_in`, `contains`
- **Range**: `between`

### **Effect Types**
- **`percentage_discount`**: Percentage-based discounts
- **`flat_discount`**: Fixed amount discounts
- **`free_delivery`**: Delivery fee waiver
- **`generate_coupon`**: Automatic coupon generation
- **`loyalty_points`**: Loyalty program integration

## 📊 API Endpoints

### **Campaign Management**

#### `POST /api/v1/campaigns/apply`
Apply campaigns and coupons to a cart with conflict resolution.

**Request:**
```json
{
  "customer": {
    "id": "uuid",
    "role": "customer",
    "email": "customer@example.com",
    "phone": "+905551234567",
    "location": {
      "city": "Istanbul",
      "district": "Beyoğlu",
      "country": "TR"
    },
    "registrationDate": "2024-01-01T00:00:00Z",
    "totalOrders": 0,
    "totalSpent": { "amount": 0, "currency": "TRY" },
    "segment": "new"
  },
  "cart": {
    "id": "uuid",
    "customerId": "uuid",
    "items": [...],
    "subtotal": { "amount": 5000, "currency": "TRY" },
    "deliveryFee": { "amount": 1000, "currency": "TRY" },
    "totalAmount": { "amount": 6000, "currency": "TRY" }
  },
  "couponCodes": ["WELCOME20", "FREEDEL"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaigns applied successfully",
  "data": {
    "originalTotal": { "amount": 6000, "currency": "TRY" },
    "discountedTotal": { "amount": 4800, "currency": "TRY" },
    "totalDiscount": { "amount": 1200, "currency": "TRY" },
    "deliveryFee": { "amount": 0, "currency": "TRY" },
    "appliedCampaigns": [
      {
        "campaignId": "uuid",
        "campaignName": "First Order Discount",
        "ruleId": "uuid",
        "discountType": "percentage",
        "discountValue": 20,
        "appliedAmount": { "amount": 1000, "currency": "TRY" },
        "priority": 200
      }
    ],
    "generatedCoupons": [
      {
        "code": "CB123456",
        "discountType": "percentage",
        "discountValue": 10,
        "validUntil": "2025-02-18T00:00:00Z"
      }
    ],
    "conflictResolution": {
      "excludedCampaigns": [],
      "priorityAdjustments": []
    }
  }
}
```

#### `POST /api/v1/campaigns`
Create new campaign with DSL rules.

#### `GET /api/v1/campaigns/active`
Get all active campaigns.

#### `POST /api/v1/campaigns/coupons/validate`
Validate coupon code against customer and cart.

#### `GET /api/v1/campaigns/:id/stats`
Get campaign performance statistics.

## 🎯 **Campaign Rule Examples**

### **First Order Promotion**
```json
{
  "name": "First Order 20% Off",
  "conditions": [
    {"type": "order_count", "operator": "equals", "value": 0}
  ],
  "effects": [
    {"type": "percentage_discount", "value": 20, "target": "cart_total"}
  ],
  "priority": 200,
  "isExclusive": false
}
```

### **Location-Based Free Delivery**
```json
{
  "name": "Istanbul Free Delivery",
  "conditions": [
    {"type": "location", "operator": "equals", "value": "Istanbul", "field": "city"},
    {"type": "cart_total", "operator": "greater_equal", "value": 10000}
  ],
  "effects": [
    {"type": "free_delivery", "value": 0, "target": "delivery_fee"}
  ],
  "priority": 150
}
```

### **Loyalty Reward System**
```json
{
  "name": "VIP Customer Rewards",
  "conditions": [
    {"type": "customer_segment", "operator": "equals", "value": "vip"},
    {"type": "cart_total", "operator": "greater_than", "value": 20000}
  ],
  "effects": [
    {"type": "percentage_discount", "value": 15, "target": "cart_total"},
    {"type": "generate_coupon", "value": 10, "metadata": {"validDays": 30}}
  ],
  "priority": 300,
  "isExclusive": true
}
```

### **Flash Sale Campaign**
```json
{
  "name": "Weekend Flash Sale",
  "conditions": [
    {"type": "time", "operator": "in", "value": [6, 0], "field": "day_of_week"},
    {"type": "time", "operator": "between", "value": [10, 22], "field": "hour"},
    {"type": "product_categories", "operator": "contains", "value": "electronics"}
  ],
  "effects": [
    {"type": "percentage_discount", "value": 25, "target": "specific_products"}
  ],
  "priority": 250,
  "maxApplications": 1000
}
```

## ⚖️ **Conflict Resolution**

### **Priority System**
- Higher priority campaigns applied first
- Exclusive campaigns prevent lower priority applications
- Detailed conflict resolution logging

### **Exclusivity Rules**
- Exclusive campaigns cannot be combined with others
- Non-exclusive campaigns can stack (with limits)
- Priority determines which exclusive campaign wins

### **Budget Management**
- Real-time budget tracking
- Automatic campaign deactivation when budget exhausted
- Spent budget monitoring and reporting

## 🎫 **Coupon Pool Management**

### **Automated Generation**
- Bulk coupon creation for campaigns
- Configurable pool sizes and templates
- Unique code generation with prefixes

### **Pool Integrity**
- Usage tracking and validation
- Automatic cleanup of expired coupons
- Pool statistics and monitoring

### **Distribution Strategy**
- Round-robin distribution from pools
- Customer-specific usage tracking
- Cache-optimized coupon retrieval

## 🔍 **Audit & Monitoring**

### **Comprehensive Logging**
- All campaign applications logged
- Conflict resolution details
- Usage pattern tracking
- Performance metrics

### **Audit Trail**
- Campaign creation and modifications
- Coupon usage and generation
- Conflict resolution decisions
- Budget and usage limit tracking

## 🚀 **Performance Features**

### **Caching Strategy**
- Active campaigns cached for 5 minutes
- Coupon validation cached for 5 minutes
- Campaign eligibility cached for 1 minute
- Pool data cached for 1 hour

### **Database Optimization**
- JSONB indexes for rule evaluation
- Partial indexes for active campaigns
- Optimized queries for conflict resolution
- Bulk operations for coupon management

## 🧪 **Testing Strategy**

### **Rule Engine Tests**
- Condition evaluation accuracy
- Effect calculation correctness
- Conflict resolution scenarios
- Performance benchmarks

### **Integration Tests**
- End-to-end campaign application
- Multi-campaign conflict scenarios
- Coupon pool management
- Audit trail verification

This Promotion Service provides a powerful, flexible rule engine that can handle complex promotional scenarios while maintaining high performance and comprehensive audit capabilities.