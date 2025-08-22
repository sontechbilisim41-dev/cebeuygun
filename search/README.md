# Search Service

High-performance Elasticsearch-based product search service with advanced filtering, faceted search, and intelligent suggestions optimized for Turkish e-commerce platforms.

## 🎯 Features

- **Full-Text Search**: Multi-field search with Turkish language support and synonym expansion
- **Faceted Filtering**: Dynamic filter aggregations for categories, brands, price ranges, delivery times, and ratings
- **Smart Suggestions**: Auto-complete with product, category, and brand suggestions
- **Performance Optimized**: Sub-50ms p95 response times for facet queries
- **Popular Products**: Trending products for empty search scenarios with location-based recommendations
- **Real-time Indexing**: Kafka-driven index updates from catalog service events
- **Advanced Features**: Location-based search, custom scoring, and intelligent ranking

## 🛠 Tech Stack

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Fastify for high-performance HTTP handling
- **Search Engine**: Elasticsearch 8.x with custom Turkish analyzers
- **Message Queue**: Kafka (KafkaJS) for real-time index updates
- **Caching**: Redis for facet caching and performance optimization
- **Validation**: Zod schemas for type-safe request/response validation
- **Logging**: Winston with structured logging and performance metrics

## 📊 API Endpoints

### Core Search Endpoints

#### `GET /api/v1/search`
Main product search with comprehensive filtering and faceting.

**Query Parameters:**
```typescript
{
  q?: string;                    // Search query
  category_id?: string;          // Category UUID filter
  brand?: string;                // Brand filter
  min_price?: number;            // Minimum price filter
  max_price?: number;            // Maximum price filter
  delivery_time?: number;        // Max delivery time (minutes)
  express_only?: boolean;        // Express delivery only
  tags?: string[];               // Tag filters
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
  page?: number;                 // Page number (default: 1)
  size?: number;                 // Results per page (default: 20, max: 100)
  facets?: boolean;              // Include facets (default: true)
  highlight?: boolean;           // Include highlighting (default: true)
  location?: {                   // Location-based search
    latitude: number;
    longitude: number;
    radius_km: number;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
    facets?: {
      categories: Array<{key: string, name: string, doc_count: number}>;
      brands: Array<{key: string, doc_count: number}>;
      price_ranges: Array<{key: string, from?: number, to?: number, doc_count: number}>;
      delivery_times: Array<{key: string, from?: number, to?: number, doc_count: number}>;
      ratings: Array<{key: string, from?: number, to?: number, doc_count: number}>;
      tags: Array<{key: string, doc_count: number}>;
    };
    query_time_ms: number;
    suggestions?: string[];
    search_metadata: {
      query_type: string;
      filters_applied: string[];
      sort_applied: string;
    };
  };
  message: string;
}
```

#### `GET /api/v1/suggestions`
Smart auto-complete suggestions for search queries.

**Query Parameters:**
```typescript
{
  q: string;                     // Query string (required)
  size?: number;                 // Number of suggestions (default: 10, max: 20)
  types?: ('product' | 'category' | 'brand')[];  // Suggestion types
}
```

#### `GET /api/v1/popular`
Popular/trending products for empty search scenarios.

**Query Parameters:**
```typescript
{
  category_id?: string;          // Filter by category
  location?: {                   // Location-based popular products
    latitude: number;
    longitude: number;
    radius_km: number;
  };
  size?: number;                 // Number of products (default: 20, max: 50)
}
```

#### `GET /api/v1/facets`
Fast facet-only queries for filter UI updates.

**Query Parameters:**
Same as search endpoint but returns only facets and total count.

#### `POST /api/v1/advanced-search`
Advanced search with custom scoring and filters.

### Health & Monitoring

- **`GET /health`**: Comprehensive health check with service dependencies
- **`GET /ready`**: Readiness probe for Kubernetes
- **`GET /live`**: Liveness probe for Kubernetes
- **`GET /metrics`**: Performance and system metrics

## 🔍 Elasticsearch Configuration

### Index Structure

**Custom Analyzers:**
- **turkish_analyzer**: Full-text search with Turkish stemming and synonyms
- **search_analyzer**: Query-time analysis without stemming
- **autocomplete_analyzer**: Edge n-gram for auto-complete

**Synonym Support:**
```
telefon,cep telefonu,mobil telefon,smartphone
bilgisayar,pc,laptop,notebook
ayakkabı,bot,spor ayakkabı,sneaker
```

**Field Mappings:**
- **name**: Multi-field with text, keyword, autocomplete, and completion
- **description**: Full-text with Turkish analyzer
- **category_name**: Text with completion suggester
- **brand**: Text with completion suggester
- **location**: Geo-point for location-based search
- **popularity_score**: Double for ranking

### Performance Optimizations

- **Facet Caching**: Redis caching for frequently accessed facets
- **Index Sharding**: 3 shards with 1 replica for optimal performance
- **Query Optimization**: Efficient bool queries with proper boosting
- **Connection Pooling**: Optimized Elasticsearch client configuration

## 🔄 Kafka Integration

### Event Consumption
- **Topic**: `catalog.product.upsert`
- **Consumer Group**: `search-service-group`
- **Event Types**: `created`, `updated`, `deleted`

### Event Processing
```typescript
{
  action: 'created' | 'updated' | 'deleted';
  product_id: string;
  product?: Product;
  timestamp: string;
}
```

**Real-time Index Updates:**
- Product creation/updates trigger immediate indexing
- Product deletions remove from search index
- Parallel processing with error handling and retry logic

## 🚀 Performance Features

### Sub-50ms Facet Queries
- Optimized aggregation queries
- Redis caching for popular facet combinations
- Efficient index structure with proper field types
- Performance monitoring and alerting

### Smart Ranking Algorithm
```typescript
// Popularity score calculation
let score = 50; // Base score
score += rating * 10;
score += Math.min(review_count * 0.1, 20);
score += is_express_delivery ? 10 : 0;
score += daysSinceCreated < 30 ? 5 : 0; // Boost new products
```

### Location-Based Search
- Geo-distance filtering and sorting
- Radius-based product discovery
- Distance calculation in search results

## 🏗 Development

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test -- --coverage
```

### Building
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t search-service .

# Run container
docker run -p 8003:8003 \
  -e ELASTICSEARCH_URL=http://elasticsearch:9200 \
  -e KAFKA_BROKERS=kafka:9092 \
  -e REDIS_URL=redis://redis:6379 \
  search-service
```

## 📊 Monitoring & Observability

### Performance Metrics
- Search query latency (p50, p95, p99)
- Facet query performance
- Index size and document count
- Kafka consumer lag
- Cache hit rates

### Health Monitoring
- Elasticsearch cluster health
- Kafka consumer group status
- Redis connectivity
- Memory and CPU usage

### Logging
- Structured JSON logging with Winston
- Query performance tracking
- Error tracking with stack traces
- Search analytics and user behavior

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SEARCH_SERVICE_PORT` | Service port | `8003` |
| `ELASTICSEARCH_URL` | Elasticsearch endpoint | `http://localhost:9200` |
| `ELASTICSEARCH_INDEX` | Index name | `products` |
| `KAFKA_BROKERS` | Kafka broker list | `localhost:9092` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `TARGET_P95_MS` | Performance target | `50` |
| `DEFAULT_SEARCH_SIZE` | Default page size | `20` |
| `MAX_SEARCH_SIZE` | Maximum page size | `100` |

### Performance Tuning

**Elasticsearch Settings:**
- 3 shards, 1 replica for optimal performance
- Custom refresh interval for real-time updates
- Optimized field mappings and analyzers

**Caching Strategy:**
- Facet results cached for 5 minutes
- Popular products cached by location
- Suggestion caching for frequent queries

**Query Optimization:**
- Multi-field search with proper boosting
- Efficient aggregation queries
- Location-based sorting optimization

## 🎯 Acceptance Criteria

✅ **Sub-50ms p95 Facet Performance**: Achieved through optimized ES queries and Redis caching
✅ **Popular Products on Empty Search**: Intelligent trending algorithm with location support
✅ **Turkish Language Support**: Custom analyzers with stemming and synonym expansion
✅ **Real-time Index Updates**: Kafka consumer with parallel processing
✅ **Smart Suggestions**: Multi-type completion with relevance scoring
✅ **Advanced Filtering**: Comprehensive faceted search with dynamic aggregations
✅ **Search Highlighting**: Term highlighting in name, description, and brand fields

## 🚨 Error Handling

- Graceful degradation on Elasticsearch failures
- Kafka consumer error recovery with retry logic
- Query validation and sanitization
- Performance monitoring with alerting
- Circuit breaker patterns for external dependencies

## 🔒 Security

- Input validation and sanitization with Zod schemas
- Rate limiting protection against abuse
- CORS configuration for cross-origin requests
- Query injection prevention
- Secure Elasticsearch communication

This search service provides enterprise-grade search capabilities with excellent performance, comprehensive filtering, and intelligent suggestions optimized for Turkish e-commerce platforms. The implementation meets all performance targets while providing a rich, user-friendly search experience.