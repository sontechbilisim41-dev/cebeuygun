# Courier Service

Comprehensive courier management and assignment service with automatic order assignment based on geographic proximity and availability. Designed for sub-1-second assignment performance with fallback strategies.

## 🎯 Features

- **Automatic Assignment**: Geographic proximity-based courier selection
- **Fallback Strategy**: Round-robin assignment when proximity fails
- **Real-time Tracking**: Live location updates with Redis caching
- **Performance Optimization**: Sub-1-second assignment guarantee
- **Manual Override**: Admin-controlled manual assignments
- **ETA Calculation**: Intelligent delivery time estimation

## 🏗 Architecture

### **Assignment Strategies**

1. **Primary - Proximity-Based**:
   - Find couriers within configurable radius (default 10km)
   - Sort by distance, rating, and completed orders
   - Select best available courier

2. **Fallback - Round-Robin**:
   - Cycle through all active online couriers
   - Ensures fair distribution when proximity fails
   - Maintains assignment state across requests

3. **Manual Override**:
   - Admin-controlled specific courier assignment
   - Bypasses automatic algorithms
   - Audit trail for manual interventions

### **Performance Optimizations**

- **Redis Caching**: Real-time location data for sub-second queries
- **PostGIS Integration**: Efficient geographic distance calculations
- **Concurrency Control**: Semaphore-based assignment limiting
- **Rate Limiting**: Prevents system overload
- **Database Indexes**: Optimized for geographic and status queries

## 🛠 Tech Stack

- **Language**: Go 1.22
- **Framework**: Gin HTTP framework
- **Database**: PostgreSQL with PostGIS extension
- **Cache**: Redis for real-time location data
- **Messaging**: Kafka for event-driven architecture
- **Documentation**: Swagger/OpenAPI 3.0

## 📊 API Endpoints

### **Courier Management**

- `POST /api/v1/couriers` - Register new courier
- `GET /api/v1/couriers` - List couriers with filters
- `GET /api/v1/couriers/{id}` - Get courier details
- `PUT /api/v1/couriers/{id}/location` - Update courier location
- `PATCH /api/v1/couriers/{id}/status` - Update courier status
- `PATCH /api/v1/couriers/{id}/online` - Set online/offline status
- `POST /api/v1/couriers/available` - Find available couriers
- `GET /api/v1/couriers/{id}/performance` - Get performance stats

### **Assignment Operations**

- `POST /api/v1/assign` - **Main assignment endpoint**
- `POST /api/v1/assign/manual` - Manual assignment (admin only)
- `GET /api/v1/assignments/{id}` - Get assignment details
- `PATCH /api/v1/assignments/{id}/status` - Update assignment status

## 🗄 Database Schema

### **Core Tables**

**couriers**: Courier profiles and information
- Personal and contact information
- Vehicle type and registration
- Status and availability tracking
- Performance metrics (rating, completed orders)

**courier_service_areas**: Geographic coverage areas
- Center coordinates and radius
- City and district coverage
- Active/inactive area management

**courier_working_hours**: Working schedule
- Day-of-week based schedules
- Start and end times
- Active schedule management

**assignments**: Order-courier assignments
- Order and courier references
- Pickup and delivery locations (JSONB)
- Distance and duration estimates
- Status tracking with timestamps

**courier_locations**: Real-time location tracking
- GPS coordinates with accuracy
- Speed and heading data
- Timestamp-based location history

### **Geographic Features**

- **PostGIS Extension**: Efficient geographic calculations
- **Spatial Indexes**: GIST indexes for location queries
- **Distance Functions**: Haversine and PostGIS distance calculations
- **Service Area Queries**: Radius-based coverage validation

## 🔄 Event Architecture

### **Kafka Integration**

**Consumed Events:**
- `order.paid` - Triggers automatic courier assignment

**Published Events:**
- `courier.assigned` - Successful assignment notification
- `courier.updated` - Courier status/location changes

### **Event Processing**

1. **Order Payment**: Receives `order.paid` event
2. **Assignment Logic**: Executes proximity or round-robin strategy
3. **Event Publishing**: Publishes `courier.assigned` event
4. **Status Updates**: Updates courier and assignment status

## ⚡ Performance Features

### **Sub-1-Second Assignment**

- **Redis Caching**: Location data cached for instant access
- **Optimized Queries**: PostGIS functions for fast distance calculations
- **Concurrency Control**: Semaphore limiting prevents overload
- **Efficient Algorithms**: O(n log n) sorting for courier selection

### **Geographic Optimization**

- **Spatial Indexing**: GIST indexes for location-based queries
- **Distance Calculation**: PostGIS geography functions
- **Service Area Validation**: Efficient radius-based filtering
- **Location Expiry**: Automatic cleanup of stale location data

## 🎯 Business Logic

### **Assignment Criteria**

1. **Availability**: Status = ACTIVE, is_online = true
2. **Location Freshness**: Location updated within 5 minutes
3. **Distance**: Within configurable maximum distance
4. **Vehicle Type**: Matches order requirements (optional)
5. **Service Area**: Within courier's defined coverage areas

### **ETA Calculation**

- **Vehicle Speed Factors**:
  - Walking: 5 km/h
  - Bicycle: 15 km/h
  - Motorbike: 30 km/h
  - Car: 25 km/h (city traffic)

- **Additional Factors**:
  - Preparation time by vehicle type
  - Traffic factor (20% increase)
  - Distance-based calculation

### **Round-Robin Logic**

- Maintains assignment index across requests
- Cycles through all active online couriers
- Ensures fair distribution of assignments
- Thread-safe with mutex protection

## 🔒 Security & Validation

### **Input Validation**
- UUID validation for all IDs
- Geographic coordinate validation
- Status enum validation
- Business rule enforcement

### **Access Control**
- Role-based access for manual assignments
- Courier-specific data access
- Admin override capabilities
- Audit trail for all assignments

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

# Geographic algorithm tests
go test -v ./internal/service -run TestProximityAssignment
```

### **Building**
```bash
# Build binary
go build -o courier cmd/main.go

# Build Docker image
docker build -t courier-service .
```

## 📊 Monitoring & Metrics

### **Performance Metrics**
- Assignment processing time (target: <1s)
- Geographic query performance
- Courier availability rates
- Assignment success rates

### **Business Metrics**
- Average delivery times by vehicle type
- Courier utilization rates
- Geographic coverage analysis
- Assignment method distribution

### **Health Monitoring**
- Database connectivity
- Redis connectivity
- Kafka consumer lag
- Location data freshness

## 🔧 Configuration

### **Assignment Parameters**

| Variable | Description | Default |
|----------|-------------|---------|
| `ASSIGNMENT_TIMEOUT` | Max assignment time | `1s` |
| `MAX_ASSIGNMENT_DISTANCE` | Max courier distance | `10.0 km` |
| `ETA_CALCULATION_FACTOR` | ETA calculation factor | `2.5 min/km` |
| `MAX_CONCURRENT_ASSIGNMENTS` | Concurrent assignment limit | `100` |

### **Geographic Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_CITY` | Default service city | `Istanbul` |
| `MAX_SERVICE_RADIUS` | Maximum service radius | `50.0 km` |
| `LOCATION_UPDATE_INTERVAL` | Location processing interval | `30s` |
| `LOCATION_EXPIRY` | Location cache expiry | `5m` |

## 🎯 Acceptance Criteria

✅ **Sub-1-Second Assignment**: Achieved through Redis caching and optimized queries
✅ **Proximity Algorithm**: PostGIS-based distance calculations with unit tests
✅ **Round-Robin Fallback**: Thread-safe implementation with fair distribution
✅ **Manual Override**: Admin API with audit trail
✅ **ETA Calculation**: Vehicle-specific speed factors with traffic considerations
✅ **Event Integration**: Kafka consumer for `order.paid` events
✅ **Geographic Accuracy**: PostGIS functions with comprehensive test coverage

## 🚨 Error Handling

### **Assignment Failures**
- No available couriers within range
- All couriers busy or offline
- Geographic service unavailable
- Database connectivity issues

### **Recovery Mechanisms**
- Automatic fallback to round-robin
- Retry logic with exponential backoff
- Graceful degradation for non-critical features
- Comprehensive error logging and alerting

This Courier Service provides a robust, high-performance foundation for automatic courier assignment with intelligent geographic algorithms, comprehensive fallback strategies, and sub-1-second performance guarantees.