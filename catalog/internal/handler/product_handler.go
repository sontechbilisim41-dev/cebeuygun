package handler

import (
	"io"
	"net/http"
	"strconv"

	"github.com/cebeuygun/platform/services/catalog/internal/models"
	"github.com/cebeuygun/platform/services/catalog/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ProductHandler struct {
	service   service.CatalogService
	validator *validator.Validate
}

func NewProductHandler(service service.CatalogService) *ProductHandler {
	return &ProductHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create a new product
// @Description Create a new product with optional variants
// @Tags products
// @Accept json
// @Produce json
// @Param product body models.CreateProductRequest true "Product data"
// @Success 201 {object} models.APIResponse{data=models.Product}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Validation failed",
			Error:   err.Error(),
		})
		return
	}

	product, err := h.service.CreateProduct(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create product",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Product created successfully",
		Data:    product,
	})
}

// @Summary Get product by ID
// @Description Get a product by its ID with all related data
// @Tags products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} models.APIResponse{data=models.Product}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/{id} [get]
func (h *ProductHandler) GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid product ID",
			Error:   err.Error(),
		})
		return
	}

	product, err := h.service.GetProduct(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get product",
			Error:   err.Error(),
		})
		return
	}

	if product == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    product,
	})
}

// @Summary Get product by SKU
// @Description Get a product by its SKU
// @Tags products
// @Produce json
// @Param sku path string true "Product SKU"
// @Success 200 {object} models.APIResponse{data=models.Product}
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/sku/{sku} [get]
func (h *ProductHandler) GetProductBySKU(c *gin.Context) {
	sku := c.Param("sku")

	product, err := h.service.GetProductBySKU(sku)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get product",
			Error:   err.Error(),
		})
		return
	}

	if product == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    product,
	})
}

// @Summary Get product by barcode
// @Description Get a product by its barcode
// @Tags products
// @Produce json
// @Param barcode path string true "Product barcode"
// @Success 200 {object} models.APIResponse{data=models.Product}
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/barcode/{barcode} [get]
func (h *ProductHandler) GetProductByBarcode(c *gin.Context) {
	barcode := c.Param("barcode")

	product, err := h.service.GetProductByBarcode(barcode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get product",
			Error:   err.Error(),
		})
		return
	}

	if product == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Data:    product,
	})
}

// @Summary Search products
// @Description Search products with various filters
// @Tags products
// @Produce json
// @Param query query string false "Search query"
// @Param category_id query string false "Category ID"
// @Param seller_id query string false "Seller ID"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param tags query string false "Tags (comma-separated)"
// @Param brand query string false "Brand"
// @Param is_active query boolean false "Active products only"
// @Param express_only query boolean false "Express delivery only"
// @Param page query integer false "Page number" default(1)
// @Param limit query integer false "Items per page" default(20)
// @Param sort_by query string false "Sort field" Enums(name, price, created_at, updated_at)
// @Param sort_order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} models.APIResponse{data=models.SearchResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/search [get]
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	req := &models.SearchRequest{
		Query:       c.Query("query"),
		ExpressOnly: c.Query("express_only") == "true",
		Page:        1,
		Limit:       20,
		SortBy:      "created_at",
		SortOrder:   "desc",
	}

	// Parse optional UUID parameters
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		categoryID, err := uuid.Parse(categoryIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid category_id",
				Error:   err.Error(),
			})
			return
		}
		req.CategoryID = &categoryID
	}

	if sellerIDStr := c.Query("seller_id"); sellerIDStr != "" {
		sellerID, err := uuid.Parse(sellerIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid seller_id",
				Error:   err.Error(),
			})
			return
		}
		req.SellerID = &sellerID
	}

	// Parse price parameters
	if minPriceStr := c.Query("min_price"); minPriceStr != "" {
		minPrice, err := strconv.ParseFloat(minPriceStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid min_price",
				Error:   err.Error(),
			})
			return
		}
		// Convert to decimal
		// req.MinPrice = &decimal.NewFromFloat(minPrice)
		_ = minPrice // TODO: implement decimal conversion
	}

	if maxPriceStr := c.Query("max_price"); maxPriceStr != "" {
		maxPrice, err := strconv.ParseFloat(maxPriceStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid max_price",
				Error:   err.Error(),
			})
			return
		}
		// Convert to decimal
		// req.MaxPrice = &decimal.NewFromFloat(maxPrice)
		_ = maxPrice // TODO: implement decimal conversion
	}

	// Parse tags
	if tagsStr := c.Query("tags"); tagsStr != "" {
		req.Tags = strings.Split(tagsStr, ",")
		for i, tag := range req.Tags {
			req.Tags[i] = strings.TrimSpace(tag)
		}
	}

	// Parse brand
	if brand := c.Query("brand"); brand != "" {
		req.Brand = &brand
	}

	// Parse is_active
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		isActive, err := strconv.ParseBool(isActiveStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid is_active",
				Error:   err.Error(),
			})
			return
		}
		req.IsActive = &isActive
	}

	// Parse pagination
	if pageStr := c.Query("page"); pageStr != "" {
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid page number",
			})
			return
		}
		req.Page = page
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 100 {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid limit (must be between 1 and 100)",
			})
			return
		}
		req.Limit = limit
	}

	// Parse sorting
	if sortBy := c.Query("sort_by"); sortBy != "" {
		req.SortBy = sortBy
	}

	if sortOrder := c.Query("sort_order"); sortOrder != "" {
		req.SortOrder = sortOrder
	}

	// Validate request
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Validation failed",
			Error:   err.Error(),
		})
		return
	}

	response, err := h.service.SearchProducts(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to search products",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Products retrieved successfully",
		Data:    response,
	})
}

// @Summary Update product
// @Description Update an existing product
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param product body models.UpdateProductRequest true "Product update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid product ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Validation failed",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.UpdateProduct(id, &req)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update product",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Product updated successfully",
	})
}

// @Summary Delete product
// @Description Delete a product
// @Tags products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid product ID",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.DeleteProduct(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to delete product",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Product deleted successfully",
	})
}

// @Summary Get featured products
// @Description Get list of featured products
// @Tags products
// @Produce json
// @Param limit query integer false "Number of products to return" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.Product}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/featured [get]
func (h *ProductHandler) GetFeaturedProducts(c *gin.Context) {
	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 100 {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid limit (must be between 1 and 100)",
			})
			return
		}
	}

	products, err := h.service.GetFeaturedProducts(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get featured products",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Featured products retrieved successfully",
		Data:    products,
	})
}

// @Summary Upload product media
// @Description Upload media file for a product
// @Tags products
// @Accept multipart/form-data
// @Produce json
// @Param id path string true "Product ID"
// @Param variant_id formData string false "Variant ID"
// @Param file formData file true "Media file"
// @Param alt_text formData string false "Alt text for the media"
// @Success 201 {object} models.APIResponse{data=models.ProductMedia}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/{id}/media [post]
func (h *ProductHandler) UploadMedia(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid product ID",
			Error:   err.Error(),
		})
		return
	}

	var variantID *uuid.UUID
	if variantIDStr := c.PostForm("variant_id"); variantIDStr != "" {
		id, err := uuid.Parse(variantIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid variant ID",
				Error:   err.Error(),
			})
			return
		}
		variantID = &id
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Failed to get file from request",
			Error:   err.Error(),
		})
		return
	}
	defer file.Close()

	media, err := h.service.UploadMedia(productID, variantID, file, header.Filename, header.Size, header.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to upload media",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Media uploaded successfully",
		Data:    media,
	})
}

// @Summary Bulk import products
// @Description Import products from CSV file
// @Tags products
// @Accept multipart/form-data
// @Produce json
// @Param seller_id formData string true "Seller ID"
// @Param file formData file true "CSV file"
// @Success 200 {object} models.APIResponse{data=models.BulkImportResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/bulk/import [post]
func (h *ProductHandler) BulkImport(c *gin.Context) {
	sellerIDStr := c.PostForm("seller_id")
	sellerID, err := uuid.Parse(sellerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid seller ID",
			Error:   err.Error(),
		})
		return
	}

	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Failed to get file from request",
			Error:   err.Error(),
		})
		return
	}
	defer file.Close()

	response, err := h.service.BulkImport(sellerID, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to process bulk import",
			Error:   err.Error(),
		})
		return
	}

	statusCode := http.StatusOK
	if !response.Success {
		statusCode = http.StatusBadRequest
	}

	c.JSON(statusCode, models.APIResponse{
		Success: response.Success,
		Message: response.Message,
		Data:    response,
	})
}

// @Summary Upsert seller product
// @Description Create or update seller-specific product data
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param seller_id query string true "Seller ID"
// @Param variant_id query string false "Variant ID"
// @Param seller_product body models.SellerProductRequest true "Seller product data"
// @Success 200 {object} models.APIResponse{data=models.SellerProduct}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /products/{id}/sellers [post]
func (h *ProductHandler) UpsertSellerProduct(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid product ID",
			Error:   err.Error(),
		})
		return
	}

	sellerIDStr := c.Query("seller_id")
	sellerID, err := uuid.Parse(sellerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid seller ID",
			Error:   err.Error(),
		})
		return
	}

	var variantID *uuid.UUID
	if variantIDStr := c.Query("variant_id"); variantIDStr != "" {
		id, err := uuid.Parse(variantIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid variant ID",
				Error:   err.Error(),
			})
			return
		}
		variantID = &id
	}

	var req models.SellerProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	sellerProduct, err := h.service.UpsertSellerProduct(sellerID, productID, variantID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to upsert seller product",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Seller product updated successfully",
		Data:    sellerProduct,
	})
}

func (h *ProductHandler) RegisterRoutes(r *gin.RouterGroup) {
	products := r.Group("/products")
	{
		products.POST("", h.CreateProduct)
		products.GET("/search", h.SearchProducts)
		products.GET("/featured", h.GetFeaturedProducts)
		products.GET("/sku/:sku", h.GetProductBySKU)
		products.GET("/barcode/:barcode", h.GetProductByBarcode)
		products.POST("/bulk/import", h.BulkImport)
		products.GET("/:id", h.GetProduct)
		products.PUT("/:id", h.UpdateProduct)
		products.DELETE("/:id", h.DeleteProduct)
		products.POST("/:id/media", h.UploadMedia)
		products.POST("/:id/sellers", h.UpsertSellerProduct)
	}
}