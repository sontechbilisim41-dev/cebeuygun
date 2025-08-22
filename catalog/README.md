# Catalog Service

Comprehensive product catalog service for the e-commerce platform with support for categories, products, variants, media management, and seller-specific overrides.

## Features

- **Category Management**: Hierarchical category tree structure
- **Product Management**: Full CRUD operations with variants support
- **Media Management**: File upload to MinIO object storage
- **Seller Overrides**: Seller-specific pricing and stock management
- **Search Integration**: Elasticsearch indexing for fast search
- **Bulk Import**: CSV-based product import functionality
- **Event Publishing**: Kafka integration for real-time updates

## Tech Stack

- **Language**: Go 1.22
- **Framework**: Gin HTTP framework
- **Database**: PostgreSQL with migrations
- **Search**: Elasticsearch
- **Storage**: MinIO object storage
- **Messaging**: Kafka
- **Documentation**: Swagger/OpenAPI 3.0

## API Endpoints

### Categories

- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/tree` - Get category tree
- `GET /api/v1/categories/{id}` - Get category by ID
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

### Products

- `POST /api/v1/products` - Create product
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/{id}` - Get product by ID
- `GET /api/v1/products/sku/{sku}` - Get product by SKU
- `GET /api/v1/products/barcode/{barcode}` - Get product by barcode
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `POST /api/v1/products/{id}/media` - Upload media
- `POST /api/v1/products/{id}/sellers` - Upsert seller product
- `POST /api/v1/products/bulk/import` - Bulk import from CSV

## Data Models

### Category
- Hierarchical structure with parent-child relationships
- Support for images and sorting
- Product count aggregation

### Product
- Complete product information with pricing and stock
- Support for multiple variants
- Media attachments (images/videos)
- Seller-specific overrides
- Elasticsearch indexing

### Product Variant
- Product variations (size, color, etc.)
- Individual pricing and stock
- Custom attributes

### Seller Product
- Seller-specific price overrides
- Stock management per seller
- Visibility controls
- Custom preparation times

## Configuration

Environment variables:

```env
CATALOG_SERVICE_PORT=8002
DATABASE_URL=postgres://user:pass@localhost:5432/catalog
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=catalog-media
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX=products
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=catalog.product.upsert
```

## Development

### Setup
```bash
# Install dependencies
go mod download

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
```

### Building
```bash
# Build binary
go build -o catalog cmd/main.go

# Build Docker image
docker build -t catalog-service .
```

## Database Schema

### Categories Table
- Hierarchical structure with self-referencing foreign key
- Support for unlimited nesting levels
- Soft delete capability

### Products Table
- Complete product information
- JSONB attributes for flexible data
- Full-text search indexes
- Price and stock management

### Product Variants Table
- Linked to parent products
- Individual pricing and attributes
- Stock tracking per variant

### Product Media Table
- File metadata and URLs
- Support for images and videos
- Sorting and activation controls

### Seller Products Table
- Override mechanism for sellers
- Price and stock customization
- Visibility and preparation time controls

## Bulk Import

CSV format for bulk product import:

```csv
name,description,category_id,brand,sku,barcode,base_price,currency,tax_rate,base_stock,min_stock,tags,is_express_delivery,preparation_time
"Product Name","Description",uuid,Brand,SKU123,1234567890,29.99,TRY,18,100,10,"tag1,tag2",true,15
```

## Search Integration

Products are automatically indexed in Elasticsearch with:
- Full-text search on name and description
- Category and brand filtering
- Price range filtering
- Tag-based filtering
- Express delivery filtering

## Event Publishing

Kafka events published on:
- Product creation: `catalog.product.upsert`
- Product updates: `catalog.product.upsert`
- Product deletion: `catalog.product.upsert`

Event payload includes action type and product data.

## Seller Override System

Sellers can override:
- Product pricing
- Stock levels
- Minimum/maximum stock
- Preparation times
- Product visibility
- Custom SKUs and notes

This allows multiple sellers to offer the same product with different terms.

## API Documentation

Swagger documentation available at `/swagger/index.html` when running the service.

## Health Checks

Health endpoint at `/health` returns service status and timestamp.

## Error Handling

Comprehensive error handling with:
- Input validation
- Database constraint violations
- File upload errors
- External service failures
- Proper HTTP status codes

## Security Considerations

- Input validation on all endpoints
- File type and size restrictions
- SQL injection prevention
- CORS configuration
- Rate limiting (to be implemented)

## Performance Optimizations

- Database indexes on frequently queried columns
- Connection pooling
- Elasticsearch for fast search
- Async event publishing
- Efficient bulk operations

## Monitoring

- Structured logging
- Health check endpoints
- Database connection monitoring
- External service health checks