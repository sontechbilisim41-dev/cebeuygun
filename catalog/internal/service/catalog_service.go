package service

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/cebeuygun/platform/services/catalog/internal/config"
	"github.com/cebeuygun/platform/services/catalog/internal/models"
	"github.com/cebeuygun/platform/services/catalog/internal/repository"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/segmentio/kafka-go"
	"github.com/shopspring/decimal"
	"golang.org/x/sync/errgroup"
)

type CatalogService interface {
	// Category operations
	CreateCategory(req *models.CreateCategoryRequest) (*models.Category, error)
	GetCategory(id uuid.UUID) (*models.Category, error)
	GetCategories(parentID *uuid.UUID, activeOnly bool) ([]*models.Category, error)
	GetCategoryTree() ([]*models.Category, error)
	UpdateCategory(id uuid.UUID, req *models.UpdateCategoryRequest) error
	DeleteCategory(id uuid.UUID) error

	// Product operations
	CreateProduct(req *models.CreateProductRequest) (*models.Product, error)
	GetProduct(id uuid.UUID) (*models.Product, error)
	GetProductBySKU(sku string) (*models.Product, error)
	GetProductByBarcode(barcode string) (*models.Product, error)
	SearchProducts(req *models.SearchRequest) (*models.SearchResponse, error)
	UpdateProduct(id uuid.UUID, req *models.UpdateProductRequest) error
	DeleteProduct(id uuid.UUID) error
	GetFeaturedProducts(limit int) ([]*models.Product, error)
	GetProductsByCategory(categoryID uuid.UUID, limit int, offset int) ([]*models.Product, int64, error)

	// Variant operations
	CreateVariant(productID uuid.UUID, req *models.CreateVariantRequest) (*models.ProductVariant, error)
	UpdateVariant(id uuid.UUID, variant *models.ProductVariant) error
	DeleteVariant(id uuid.UUID) error

	// Media operations
	UploadMedia(productID uuid.UUID, variantID *uuid.UUID, file io.Reader, fileName string, fileSize int64, mimeType string) (*models.ProductMedia, error)
	DeleteMedia(id uuid.UUID) error

	// Seller operations
	UpsertSellerProduct(sellerID uuid.UUID, productID uuid.UUID, variantID *uuid.UUID, req *models.SellerProductRequest) (*models.SellerProduct, error)
	DeleteSellerProduct(id uuid.UUID) error
	GetSellerProducts(sellerID uuid.UUID, productID *uuid.UUID) ([]*models.SellerProduct, error)

	// Bulk operations
	BulkImport(sellerID uuid.UUID, csvData io.Reader) (*models.BulkImportResponse, error)

	// Search operations
	IndexProduct(product *models.Product) error
	RemoveFromIndex(productID uuid.UUID) error
}

type catalogService struct {
	categoryRepo repository.CategoryRepository
	productRepo  repository.ProductRepository
	esClient     *elasticsearch.Client
	minioClient  *minio.Client
	kafkaWriter  *kafka.Writer
	config       *config.Config
}

func NewCatalogService(
	categoryRepo repository.CategoryRepository,
	productRepo repository.ProductRepository,
	cfg *config.Config,
) (CatalogService, error) {
	// Initialize Elasticsearch client
	esClient, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{cfg.ElasticsearchURL},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create elasticsearch client: %w", err)
	}

	// Initialize MinIO client
	minioClient, err := minio.New(cfg.MinIOEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinIOAccessKey, cfg.MinIOSecretKey, ""),
		Secure: cfg.MinIOUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	// Ensure bucket exists
	ctx := context.Background()
	exists, err := minioClient.BucketExists(ctx, cfg.MinIOBucketName)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket existence: %w", err)
	}
	if !exists {
		err = minioClient.MakeBucket(ctx, cfg.MinIOBucketName, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket: %w", err)
		}
	}

	// Initialize Kafka writer
	kafkaWriter := &kafka.Writer{
		Addr:     kafka.TCP(cfg.KafkaBrokers...),
		Topic:    cfg.KafkaTopic,
		Balancer: &kafka.LeastBytes{},
	}

	return &catalogService{
		categoryRepo: categoryRepo,
		productRepo:  productRepo,
		esClient:     esClient,
		minioClient:  minioClient,
		kafkaWriter:  kafkaWriter,
		config:       cfg,
	}, nil
}

// Category operations
func (s *catalogService) CreateCategory(req *models.CreateCategoryRequest) (*models.Category, error) {
	category := &models.Category{
		ID:          uuid.New(),
		Name:        req.Name,
		Description: req.Description,
		ParentID:    req.ParentID,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
		IsActive:    true,
	}

	err := s.categoryRepo.Create(category)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}

func (s *catalogService) GetCategory(id uuid.UUID) (*models.Category, error) {
	category, err := s.categoryRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	if category != nil {
		// Get product count
		count, err := s.categoryRepo.GetProductCount(id)
		if err == nil {
			category.ProductCount = count
		}
	}

	return category, nil
}

func (s *catalogService) GetCategories(parentID *uuid.UUID, activeOnly bool) ([]*models.Category, error) {
	categories, err := s.categoryRepo.GetAll(parentID, activeOnly)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	// Get product counts for each category
	for _, category := range categories {
		count, err := s.categoryRepo.GetProductCount(category.ID)
		if err == nil {
			category.ProductCount = count
		}
	}

	return categories, nil
}

func (s *catalogService) GetCategoryTree() ([]*models.Category, error) {
	return s.categoryRepo.GetTree()
}

func (s *catalogService) UpdateCategory(id uuid.UUID, req *models.UpdateCategoryRequest) error {
	return s.categoryRepo.Update(id, req)
}

func (s *catalogService) DeleteCategory(id uuid.UUID) error {
	return s.categoryRepo.Delete(id)
}

// Product operations
func (s *catalogService) CreateProduct(req *models.CreateProductRequest) (*models.Product, error) {
	product := &models.Product{
		ID:                uuid.New(),
		Name:              req.Name,
		Description:       req.Description,
		CategoryID:        req.CategoryID,
		Brand:             req.Brand,
		SKU:               req.SKU,
		Barcode:           req.Barcode,
		BasePrice:         req.BasePrice,
		Currency:          req.Currency,
		TaxRate:           req.TaxRate,
		BaseStock:         req.BaseStock,
		MinStock:          req.MinStock,
		MaxStock:          req.MaxStock,
		Weight:            req.Weight,
		Dimensions:        req.Dimensions,
		Tags:              req.Tags,
		Attributes:        req.Attributes,
		IsActive:          true,
		IsExpressDelivery: req.IsExpressDelivery,
		PreparationTime:   req.PreparationTime,
	}

	err := s.productRepo.Create(product)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	// Create variants if provided
	if len(req.Variants) > 0 {
		for _, variantReq := range req.Variants {
			variant := &models.ProductVariant{
				ID:         uuid.New(),
				ProductID:  product.ID,
				Name:       variantReq.Name,
				SKU:        variantReq.SKU,
				Barcode:    variantReq.Barcode,
				Price:      variantReq.Price,
				Stock:      variantReq.Stock,
				Weight:     variantReq.Weight,
				Dimensions: variantReq.Dimensions,
				Attributes: variantReq.Attributes,
				IsActive:   true,
				SortOrder:  variantReq.SortOrder,
			}

			err := s.productRepo.CreateVariant(variant)
			if err != nil {
				log.Printf("Failed to create variant: %v", err)
			}
		}
	}

	// Index in Elasticsearch
	go func() {
		if err := s.IndexProduct(product); err != nil {
			log.Printf("Failed to index product %s: %v", product.ID, err)
		}
	}()

	// Publish to Kafka
	go s.publishProductEvent(product, "created")

	return product, nil
}

func (s *catalogService) GetProduct(id uuid.UUID) (*models.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	if product != nil {
		// Load related data
		g, _ := errgroup.WithContext(context.Background())

		g.Go(func() error {
			variants, err := s.productRepo.GetVariants(product.ID)
			if err == nil {
				product.Variants = variants
			}
			return nil
		})

		g.Go(func() error {
			media, err := s.productRepo.GetMedia(product.ID, nil)
			if err == nil {
				product.Media = media
			}
			return nil
		})

		g.Go(func() error {
			sellerData, err := s.productRepo.GetSellerData(product.ID, nil)
			if err == nil {
				product.SellerData = sellerData
			}
			return nil
		})

		g.Wait()
	}

	return product, nil
}

func (s *catalogService) GetProductBySKU(sku string) (*models.Product, error) {
	return s.productRepo.GetBySKU(sku)
}

func (s *catalogService) GetProductByBarcode(barcode string) (*models.Product, error) {
	return s.productRepo.GetByBarcode(barcode)
}

func (s *catalogService) SearchProducts(req *models.SearchRequest) (*models.SearchResponse, error) {
	products, total, err := s.productRepo.Search(req)
	if err != nil {
		return nil, fmt.Errorf("failed to search products: %w", err)
	}

	totalPages := int(total) / req.Limit
	if int(total)%req.Limit > 0 {
		totalPages++
	}

	return &models.SearchResponse{
		Products:   products,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	}, nil
}

func (s *catalogService) UpdateProduct(id uuid.UUID, req *models.UpdateProductRequest) error {
	err := s.productRepo.Update(id, req)
	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	// Re-index in Elasticsearch
	go func() {
		product, err := s.productRepo.GetByID(id)
		if err == nil && product != nil {
			if err := s.IndexProduct(product); err != nil {
				log.Printf("Failed to re-index product %s: %v", id, err)
			}
		}
	}()

	// Publish to Kafka
	go func() {
		product, err := s.productRepo.GetByID(id)
		if err == nil && product != nil {
			s.publishProductEvent(product, "updated")
		}
	}()

	return nil
}

func (s *catalogService) DeleteProduct(id uuid.UUID) error {
	err := s.productRepo.Delete(id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	// Remove from Elasticsearch
	go func() {
		if err := s.RemoveFromIndex(id); err != nil {
			log.Printf("Failed to remove product %s from index: %v", id, err)
		}
	}()

	// Publish to Kafka
	go s.publishProductEvent(&models.Product{ID: id}, "deleted")

	return nil
}

func (s *catalogService) GetFeaturedProducts(limit int) ([]*models.Product, error) {
	return s.productRepo.GetFeatured(limit)
}

func (s *catalogService) GetProductsByCategory(categoryID uuid.UUID, limit int, offset int) ([]*models.Product, int64, error) {
	return s.productRepo.GetByCategory(categoryID, limit, offset)
}

// Variant operations
func (s *catalogService) CreateVariant(productID uuid.UUID, req *models.CreateVariantRequest) (*models.ProductVariant, error) {
	variant := &models.ProductVariant{
		ID:         uuid.New(),
		ProductID:  productID,
		Name:       req.Name,
		SKU:        req.SKU,
		Barcode:    req.Barcode,
		Price:      req.Price,
		Stock:      req.Stock,
		Weight:     req.Weight,
		Dimensions: req.Dimensions,
		Attributes: req.Attributes,
		IsActive:   true,
		SortOrder:  req.SortOrder,
	}

	err := s.productRepo.CreateVariant(variant)
	if err != nil {
		return nil, fmt.Errorf("failed to create variant: %w", err)
	}

	// Re-index parent product
	go func() {
		product, err := s.productRepo.GetByID(productID)
		if err == nil && product != nil {
			if err := s.IndexProduct(product); err != nil {
				log.Printf("Failed to re-index product %s: %v", productID, err)
			}
		}
	}()

	return variant, nil
}

func (s *catalogService) UpdateVariant(id uuid.UUID, variant *models.ProductVariant) error {
	return s.productRepo.UpdateVariant(id, variant)
}

func (s *catalogService) DeleteVariant(id uuid.UUID) error {
	return s.productRepo.DeleteVariant(id)
}

// Media operations
func (s *catalogService) UploadMedia(productID uuid.UUID, variantID *uuid.UUID, file io.Reader, fileName string, fileSize int64, mimeType string) (*models.ProductMedia, error) {
	// Validate file type
	allowed := false
	for _, allowedType := range s.config.AllowedFileTypes {
		if mimeType == allowedType {
			allowed = true
			break
		}
	}
	if !allowed {
		return nil, fmt.Errorf("file type %s not allowed", mimeType)
	}

	// Validate file size
	if fileSize > s.config.MaxFileSize {
		return nil, fmt.Errorf("file size %d exceeds maximum allowed size %d", fileSize, s.config.MaxFileSize)
	}

	// Generate unique file name
	objectName := fmt.Sprintf("products/%s/%s", productID, uuid.New().String()+"-"+fileName)

	// Upload to MinIO
	ctx := context.Background()
	_, err := s.minioClient.PutObject(ctx, s.config.MinIOBucketName, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: mimeType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Generate URL
	url := fmt.Sprintf("http://%s/%s/%s", s.config.MinIOEndpoint, s.config.MinIOBucketName, objectName)

	// Determine media type
	mediaType := "image"
	if strings.HasPrefix(mimeType, "video/") {
		mediaType = "video"
	}

	// Create media record
	media := &models.ProductMedia{
		ID:        uuid.New(),
		ProductID: productID,
		VariantID: variantID,
		Type:      mediaType,
		URL:       url,
		FileName:  fileName,
		FileSize:  fileSize,
		MimeType:  mimeType,
		SortOrder: 0,
		IsActive:  true,
	}

	err = s.productRepo.CreateMedia(media)
	if err != nil {
		return nil, fmt.Errorf("failed to create media record: %w", err)
	}

	return media, nil
}

func (s *catalogService) DeleteMedia(id uuid.UUID) error {
	return s.productRepo.DeleteMedia(id)
}

// Seller operations
func (s *catalogService) UpsertSellerProduct(sellerID uuid.UUID, productID uuid.UUID, variantID *uuid.UUID, req *models.SellerProductRequest) (*models.SellerProduct, error) {
	sellerProduct := &models.SellerProduct{
		ID:              uuid.New(),
		SellerID:        sellerID,
		ProductID:       productID,
		VariantID:       variantID,
		SellerSKU:       req.SellerSKU,
		Price:           req.Price,
		Stock:           req.Stock,
		MinStock:        req.MinStock,
		MaxStock:        req.MaxStock,
		IsActive:        req.IsActive != nil && *req.IsActive,
		IsVisible:       req.IsVisible != nil && *req.IsVisible,
		PreparationTime: req.PreparationTime,
		Notes:           req.Notes,
	}

	err := s.productRepo.UpsertSellerProduct(sellerProduct)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert seller product: %w", err)
	}

	return sellerProduct, nil
}

func (s *catalogService) DeleteSellerProduct(id uuid.UUID) error {
	return s.productRepo.DeleteSellerProduct(id)
}

func (s *catalogService) GetSellerProducts(sellerID uuid.UUID, productID *uuid.UUID) ([]*models.SellerProduct, error) {
	if productID != nil {
		return s.productRepo.GetSellerData(*productID, &sellerID)
	}

	// If no specific product ID, we need a different query - this would require a new repository method
	return nil, fmt.Errorf("getting all seller products not implemented")
}

// Bulk operations
func (s *catalogService) BulkImport(sellerID uuid.UUID, csvData io.Reader) (*models.BulkImportResponse, error) {
	reader := csv.NewReader(csvData)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) == 0 {
		return &models.BulkImportResponse{
			Success: false,
			Message: "No data found in CSV",
		}, nil
	}

	// Expected CSV format: name,description,category_id,brand,sku,barcode,base_price,currency,tax_rate,base_stock,min_stock,tags,is_express_delivery,preparation_time
	header := records[0]
	expectedHeaders := []string{"name", "description", "category_id", "brand", "sku", "barcode", "base_price", "currency", "tax_rate", "base_stock", "min_stock", "tags", "is_express_delivery", "preparation_time"}
	
	// Validate headers
	if len(header) < len(expectedHeaders) {
		return &models.BulkImportResponse{
			Success: false,
			Message: "Invalid CSV format. Missing required columns.",
		}, nil
	}

	response := &models.BulkImportResponse{
		ProcessedCount: len(records) - 1, // Exclude header
		SuccessCount:   0,
		ErrorCount:     0,
		Errors:         []models.BulkImportError{},
	}

	// Process each row
	for i, record := range records[1:] { // Skip header
		rowNum := i + 2 // +2 because we skip header and arrays are 0-indexed

		err := s.processBulkImportRow(sellerID, record, rowNum)
		if err != nil {
			response.ErrorCount++
			response.Errors = append(response.Errors, models.BulkImportError{
				Row:     rowNum,
				Message: err.Error(),
			})
		} else {
			response.SuccessCount++
		}
	}

	response.Success = response.ErrorCount == 0
	if response.Success {
		response.Message = fmt.Sprintf("Successfully imported %d products", response.SuccessCount)
	} else {
		response.Message = fmt.Sprintf("Imported %d products with %d errors", response.SuccessCount, response.ErrorCount)
	}

	return response, nil
}

func (s *catalogService) processBulkImportRow(sellerID uuid.UUID, record []string, rowNum int) error {
	if len(record) < 14 {
		return fmt.Errorf("insufficient columns")
	}

	// Parse category ID
	categoryID, err := uuid.Parse(record[2])
	if err != nil {
		return fmt.Errorf("invalid category_id: %v", err)
	}

	// Parse base price
	basePrice, err := decimal.NewFromString(record[6])
	if err != nil {
		return fmt.Errorf("invalid base_price: %v", err)
	}

	// Parse tax rate
	taxRate, err := decimal.NewFromString(record[8])
	if err != nil {
		return fmt.Errorf("invalid tax_rate: %v", err)
	}

	// Parse base stock
	baseStock, err := strconv.Atoi(record[9])
	if err != nil {
		return fmt.Errorf("invalid base_stock: %v", err)
	}

	// Parse min stock
	minStock, err := strconv.Atoi(record[10])
	if err != nil {
		return fmt.Errorf("invalid min_stock: %v", err)
	}

	// Parse tags
	var tags []string
	if record[11] != "" {
		tags = strings.Split(record[11], ",")
		for i, tag := range tags {
			tags[i] = strings.TrimSpace(tag)
		}
	}

	// Parse is_express_delivery
	isExpressDelivery, err := strconv.ParseBool(record[12])
	if err != nil {
		return fmt.Errorf("invalid is_express_delivery: %v", err)
	}

	// Parse preparation_time
	preparationTime, err := strconv.Atoi(record[13])
	if err != nil {
		return fmt.Errorf("invalid preparation_time: %v", err)
	}

	// Create product
	product := &models.Product{
		ID:                uuid.New(),
		Name:              record[0],
		Description:       &record[1],
		CategoryID:        categoryID,
		Brand:             &record[3],
		SKU:               &record[4],
		Barcode:           &record[5],
		BasePrice:         basePrice,
		Currency:          record[7],
		TaxRate:           taxRate,
		BaseStock:         baseStock,
		MinStock:          minStock,
		Tags:              tags,
		IsActive:          true,
		IsExpressDelivery: isExpressDelivery,
		PreparationTime:   preparationTime,
	}

	err = s.productRepo.Create(product)
	if err != nil {
		return fmt.Errorf("failed to create product: %v", err)
	}

	// Index in Elasticsearch
	go func() {
		if err := s.IndexProduct(product); err != nil {
			log.Printf("Failed to index product %s: %v", product.ID, err)
		}
	}()

	// Publish to Kafka
	go s.publishProductEvent(product, "created")

	return nil
}

// Search operations
func (s *catalogService) IndexProduct(product *models.Product) error {
	// Get category name
	var categoryName string
	if product.Category != nil {
		categoryName = product.Category.Name
	} else {
		category, err := s.categoryRepo.GetByID(product.CategoryID)
		if err == nil && category != nil {
			categoryName = category.Name
		}
	}

	// Create document
	doc := models.ProductDocument{
		ID:                product.ID,
		Name:              product.Name,
		Description:       *product.Description,
		CategoryID:        product.CategoryID,
		CategoryName:      categoryName,
		Brand:             *product.Brand,
		SKU:               *product.SKU,
		Barcode:           *product.Barcode,
		BasePrice:         product.BasePrice,
		Currency:          product.Currency,
		TaxRate:           product.TaxRate,
		BaseStock:         product.BaseStock,
		Tags:              product.Tags,
		Attributes:        product.Attributes,
		IsActive:          product.IsActive,
		IsExpressDelivery: product.IsExpressDelivery,
		PreparationTime:   product.PreparationTime,
		CreatedAt:         product.CreatedAt,
		UpdatedAt:         product.UpdatedAt,
	}

	// Convert to JSON
	docJSON, err := json.Marshal(doc)
	if err != nil {
		return fmt.Errorf("failed to marshal document: %w", err)
	}

	// Index document
	res, err := s.esClient.Index(
		s.config.ElasticsearchIndex,
		strings.NewReader(string(docJSON)),
		s.esClient.Index.WithDocumentID(product.ID.String()),
		s.esClient.Index.WithRefresh("true"),
	)
	if err != nil {
		return fmt.Errorf("failed to index document: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("elasticsearch indexing failed: %s", res.String())
	}

	return nil
}

func (s *catalogService) RemoveFromIndex(productID uuid.UUID) error {
	res, err := s.esClient.Delete(
		s.config.ElasticsearchIndex,
		productID.String(),
		s.esClient.Delete.WithRefresh("true"),
	)
	if err != nil {
		return fmt.Errorf("failed to delete document: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() && res.StatusCode != 404 {
		return fmt.Errorf("elasticsearch deletion failed: %s", res.String())
	}

	return nil
}

func (s *catalogService) publishProductEvent(product *models.Product, action string) {
	event := map[string]interface{}{
		"action":     action,
		"product_id": product.ID,
		"timestamp":  time.Now().UTC(),
	}

	if action != "deleted" {
		event["product"] = product
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal product event: %v", err)
		return
	}

	err = s.kafkaWriter.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(product.ID.String()),
			Value: eventJSON,
		},
	)
	if err != nil {
		log.Printf("Failed to publish product event: %v", err)
	}
}