package models

import (
	"time"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Category represents a product category with hierarchical structure
type Category struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Name        string     `json:"name" db:"name" validate:"required,min=2,max=100"`
	Description *string    `json:"description,omitempty" db:"description"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty" db:"parent_id"`
	ImageURL    *string    `json:"image_url,omitempty" db:"image_url"`
	SortOrder   int        `json:"sort_order" db:"sort_order"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	Children    []*Category `json:"children,omitempty" db:"-"`
	ProductCount int        `json:"product_count,omitempty" db:"-"`
}

// Product represents a product in the catalog
type Product struct {
	ID                  uuid.UUID       `json:"id" db:"id"`
	Name                string          `json:"name" db:"name" validate:"required,min=2,max=200"`
	Description         *string         `json:"description,omitempty" db:"description"`
	CategoryID          uuid.UUID       `json:"category_id" db:"category_id" validate:"required"`
	Brand               *string         `json:"brand,omitempty" db:"brand"`
	SKU                 *string         `json:"sku,omitempty" db:"sku"`
	Barcode             *string         `json:"barcode,omitempty" db:"barcode"`
	BasePrice           decimal.Decimal `json:"base_price" db:"base_price" validate:"required,gt=0"`
	Currency            string          `json:"currency" db:"currency" validate:"required,len=3"`
	TaxRate             decimal.Decimal `json:"tax_rate" db:"tax_rate" validate:"gte=0,lte=100"`
	BaseStock           int             `json:"base_stock" db:"base_stock" validate:"gte=0"`
	MinStock            int             `json:"min_stock" db:"min_stock" validate:"gte=0"`
	MaxStock            *int            `json:"max_stock,omitempty" db:"max_stock"`
	Weight              *decimal.Decimal `json:"weight,omitempty" db:"weight"`
	Dimensions          *string         `json:"dimensions,omitempty" db:"dimensions"`
	Tags                []string        `json:"tags,omitempty" db:"tags"`
	Attributes          map[string]interface{} `json:"attributes,omitempty" db:"attributes"`
	IsActive            bool            `json:"is_active" db:"is_active"`
	IsExpressDelivery   bool            `json:"is_express_delivery" db:"is_express_delivery"`
	PreparationTime     int             `json:"preparation_time" db:"preparation_time"` // in minutes
	CreatedAt           time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	Category    *Category         `json:"category,omitempty" db:"-"`
	Variants    []*ProductVariant `json:"variants,omitempty" db:"-"`
	Media       []*ProductMedia   `json:"media,omitempty" db:"-"`
	SellerData  []*SellerProduct  `json:"seller_data,omitempty" db:"-"`
}

// ProductVariant represents a variant of a product
type ProductVariant struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	ProductID   uuid.UUID       `json:"product_id" db:"product_id"`
	Name        string          `json:"name" db:"name" validate:"required,min=1,max=100"`
	SKU         *string         `json:"sku,omitempty" db:"sku"`
	Barcode     *string         `json:"barcode,omitempty" db:"barcode"`
	Price       *decimal.Decimal `json:"price,omitempty" db:"price"`
	Stock       *int            `json:"stock,omitempty" db:"stock"`
	Weight      *decimal.Decimal `json:"weight,omitempty" db:"weight"`
	Dimensions  *string         `json:"dimensions,omitempty" db:"dimensions"`
	Attributes  map[string]interface{} `json:"attributes,omitempty" db:"attributes"`
	IsActive    bool            `json:"is_active" db:"is_active"`
	SortOrder   int             `json:"sort_order" db:"sort_order"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	Media       []*ProductMedia   `json:"media,omitempty" db:"-"`
}

// ProductMedia represents media files associated with products
type ProductMedia struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	ProductID   uuid.UUID  `json:"product_id" db:"product_id"`
	VariantID   *uuid.UUID `json:"variant_id,omitempty" db:"variant_id"`
	Type        string     `json:"type" db:"type" validate:"required,oneof=image video"`
	URL         string     `json:"url" db:"url" validate:"required,url"`
	FileName    string     `json:"file_name" db:"file_name"`
	FileSize    int64      `json:"file_size" db:"file_size"`
	MimeType    string     `json:"mime_type" db:"mime_type"`
	AltText     *string    `json:"alt_text,omitempty" db:"alt_text"`
	SortOrder   int        `json:"sort_order" db:"sort_order"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// SellerProduct represents seller-specific product data (overrides)
type SellerProduct struct {
	ID              uuid.UUID        `json:"id" db:"id"`
	SellerID        uuid.UUID        `json:"seller_id" db:"seller_id"`
	ProductID       uuid.UUID        `json:"product_id" db:"product_id"`
	VariantID       *uuid.UUID       `json:"variant_id,omitempty" db:"variant_id"`
	SellerSKU       *string          `json:"seller_sku,omitempty" db:"seller_sku"`
	Price           *decimal.Decimal `json:"price,omitempty" db:"price"`
	Stock           *int             `json:"stock,omitempty" db:"stock"`
	MinStock        *int             `json:"min_stock,omitempty" db:"min_stock"`
	MaxStock        *int             `json:"max_stock,omitempty" db:"max_stock"`
	IsActive        bool             `json:"is_active" db:"is_active"`
	IsVisible       bool             `json:"is_visible" db:"is_visible"`
	PreparationTime *int             `json:"preparation_time,omitempty" db:"preparation_time"`
	Notes           *string          `json:"notes,omitempty" db:"notes"`
	CreatedAt       time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at" db:"updated_at"`
}

// DTOs for API requests/responses

type CreateCategoryRequest struct {
	Name        string     `json:"name" validate:"required,min=2,max=100"`
	Description *string    `json:"description,omitempty"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	ImageURL    *string    `json:"image_url,omitempty"`
	SortOrder   int        `json:"sort_order"`
}

type UpdateCategoryRequest struct {
	Name        *string    `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description *string    `json:"description,omitempty"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	ImageURL    *string    `json:"image_url,omitempty"`
	SortOrder   *int       `json:"sort_order,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
}

type CreateProductRequest struct {
	Name                string                 `json:"name" validate:"required,min=2,max=200"`
	Description         *string                `json:"description,omitempty"`
	CategoryID          uuid.UUID              `json:"category_id" validate:"required"`
	Brand               *string                `json:"brand,omitempty"`
	SKU                 *string                `json:"sku,omitempty"`
	Barcode             *string                `json:"barcode,omitempty"`
	BasePrice           decimal.Decimal        `json:"base_price" validate:"required,gt=0"`
	Currency            string                 `json:"currency" validate:"required,len=3"`
	TaxRate             decimal.Decimal        `json:"tax_rate" validate:"gte=0,lte=100"`
	BaseStock           int                    `json:"base_stock" validate:"gte=0"`
	MinStock            int                    `json:"min_stock" validate:"gte=0"`
	MaxStock            *int                   `json:"max_stock,omitempty"`
	Weight              *decimal.Decimal       `json:"weight,omitempty"`
	Dimensions          *string                `json:"dimensions,omitempty"`
	Tags                []string               `json:"tags,omitempty"`
	Attributes          map[string]interface{} `json:"attributes,omitempty"`
	IsExpressDelivery   bool                   `json:"is_express_delivery"`
	PreparationTime     int                    `json:"preparation_time"`
	Variants            []*CreateVariantRequest `json:"variants,omitempty"`
}

type CreateVariantRequest struct {
	Name       string                 `json:"name" validate:"required,min=1,max=100"`
	SKU        *string                `json:"sku,omitempty"`
	Barcode    *string                `json:"barcode,omitempty"`
	Price      *decimal.Decimal       `json:"price,omitempty"`
	Stock      *int                   `json:"stock,omitempty"`
	Weight     *decimal.Decimal       `json:"weight,omitempty"`
	Dimensions *string                `json:"dimensions,omitempty"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`
	SortOrder  int                    `json:"sort_order"`
}

type UpdateProductRequest struct {
	Name                *string                `json:"name,omitempty" validate:"omitempty,min=2,max=200"`
	Description         *string                `json:"description,omitempty"`
	CategoryID          *uuid.UUID             `json:"category_id,omitempty"`
	Brand               *string                `json:"brand,omitempty"`
	SKU                 *string                `json:"sku,omitempty"`
	Barcode             *string                `json:"barcode,omitempty"`
	BasePrice           *decimal.Decimal       `json:"base_price,omitempty" validate:"omitempty,gt=0"`
	Currency            *string                `json:"currency,omitempty" validate:"omitempty,len=3"`
	TaxRate             *decimal.Decimal       `json:"tax_rate,omitempty" validate:"omitempty,gte=0,lte=100"`
	BaseStock           *int                   `json:"base_stock,omitempty" validate:"omitempty,gte=0"`
	MinStock            *int                   `json:"min_stock,omitempty" validate:"omitempty,gte=0"`
	MaxStock            *int                   `json:"max_stock,omitempty"`
	Weight              *decimal.Decimal       `json:"weight,omitempty"`
	Dimensions          *string                `json:"dimensions,omitempty"`
	Tags                []string               `json:"tags,omitempty"`
	Attributes          map[string]interface{} `json:"attributes,omitempty"`
	IsActive            *bool                  `json:"is_active,omitempty"`
	IsExpressDelivery   *bool                  `json:"is_express_delivery,omitempty"`
	PreparationTime     *int                   `json:"preparation_time,omitempty"`
}

type SellerProductRequest struct {
	SellerSKU       *string          `json:"seller_sku,omitempty"`
	Price           *decimal.Decimal `json:"price,omitempty"`
	Stock           *int             `json:"stock,omitempty"`
	MinStock        *int             `json:"min_stock,omitempty"`
	MaxStock        *int             `json:"max_stock,omitempty"`
	IsActive        *bool            `json:"is_active,omitempty"`
	IsVisible       *bool            `json:"is_visible,omitempty"`
	PreparationTime *int             `json:"preparation_time,omitempty"`
	Notes           *string          `json:"notes,omitempty"`
}

type BulkImportRequest struct {
	SellerID uuid.UUID `json:"seller_id" validate:"required"`
	Data     []byte    `json:"data" validate:"required"`
}

type BulkImportResponse struct {
	Success      bool                    `json:"success"`
	Message      string                  `json:"message"`
	ProcessedCount int                   `json:"processed_count"`
	SuccessCount   int                   `json:"success_count"`
	ErrorCount     int                   `json:"error_count"`
	Errors         []BulkImportError     `json:"errors,omitempty"`
}

type BulkImportError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
}

type SearchRequest struct {
	Query       string     `json:"query,omitempty"`
	CategoryID  *uuid.UUID `json:"category_id,omitempty"`
	SellerID    *uuid.UUID `json:"seller_id,omitempty"`
	MinPrice    *decimal.Decimal `json:"min_price,omitempty"`
	MaxPrice    *decimal.Decimal `json:"max_price,omitempty"`
	Tags        []string   `json:"tags,omitempty"`
	Brand       *string    `json:"brand,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
	ExpressOnly bool       `json:"express_only"`
	Page        int        `json:"page" validate:"min=1"`
	Limit       int        `json:"limit" validate:"min=1,max=100"`
	SortBy      string     `json:"sort_by" validate:"oneof=name price created_at updated_at"`
	SortOrder   string     `json:"sort_order" validate:"oneof=asc desc"`
}

type SearchResponse struct {
	Products    []*Product `json:"products"`
	Total       int64      `json:"total"`
	Page        int        `json:"page"`
	Limit       int        `json:"limit"`
	TotalPages  int        `json:"total_pages"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Elasticsearch document structure
type ProductDocument struct {
	ID                uuid.UUID       `json:"id"`
	Name              string          `json:"name"`
	Description       string          `json:"description"`
	CategoryID        uuid.UUID       `json:"category_id"`
	CategoryName      string          `json:"category_name"`
	Brand             string          `json:"brand"`
	SKU               string          `json:"sku"`
	Barcode           string          `json:"barcode"`
	BasePrice         decimal.Decimal `json:"base_price"`
	Currency          string          `json:"currency"`
	TaxRate           decimal.Decimal `json:"tax_rate"`
	BaseStock         int             `json:"base_stock"`
	Tags              []string        `json:"tags"`
	Attributes        map[string]interface{} `json:"attributes"`
	IsActive          bool            `json:"is_active"`
	IsExpressDelivery bool            `json:"is_express_delivery"`
	PreparationTime   int             `json:"preparation_time"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}