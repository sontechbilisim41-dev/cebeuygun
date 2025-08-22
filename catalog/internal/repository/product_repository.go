package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/catalog/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ProductRepository interface {
	Create(product *models.Product) error
	GetByID(id uuid.UUID) (*models.Product, error)
	GetBySKU(sku string) (*models.Product, error)
	GetByBarcode(barcode string) (*models.Product, error)
	Search(req *models.SearchRequest) ([]*models.Product, int64, error)
	Update(id uuid.UUID, updates *models.UpdateProductRequest) error
	Delete(id uuid.UUID) error
	GetVariants(productID uuid.UUID) ([]*models.ProductVariant, error)
	GetMedia(productID uuid.UUID, variantID *uuid.UUID) ([]*models.ProductMedia, error)
	GetSellerData(productID uuid.UUID, sellerID *uuid.UUID) ([]*models.SellerProduct, error)
	CreateVariant(variant *models.ProductVariant) error
	UpdateVariant(id uuid.UUID, variant *models.ProductVariant) error
	DeleteVariant(id uuid.UUID) error
	CreateMedia(media *models.ProductMedia) error
	UpdateMedia(id uuid.UUID, media *models.ProductMedia) error
	DeleteMedia(id uuid.UUID) error
	UpsertSellerProduct(sellerProduct *models.SellerProduct) error
	DeleteSellerProduct(id uuid.UUID) error
	GetFeatured(limit int) ([]*models.Product, error)
	GetByCategory(categoryID uuid.UUID, limit int, offset int) ([]*models.Product, int64, error)
}

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(product *models.Product) error {
	query := `
		INSERT INTO products (id, name, description, category_id, brand, sku, barcode, base_price, currency, 
		                     tax_rate, base_stock, min_stock, max_stock, weight, dimensions, tags, attributes, 
		                     is_active, is_express_delivery, preparation_time)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		product.ID,
		product.Name,
		product.Description,
		product.CategoryID,
		product.Brand,
		product.SKU,
		product.Barcode,
		product.BasePrice,
		product.Currency,
		product.TaxRate,
		product.BaseStock,
		product.MinStock,
		product.MaxStock,
		product.Weight,
		product.Dimensions,
		pq.Array(product.Tags),
		product.Attributes,
		product.IsActive,
		product.IsExpressDelivery,
		product.PreparationTime,
	).Scan(&product.CreatedAt, &product.UpdatedAt)
}

func (r *productRepository) GetByID(id uuid.UUID) (*models.Product, error) {
	product := &models.Product{}
	query := `
		SELECT p.id, p.name, p.description, p.category_id, p.brand, p.sku, p.barcode, p.base_price, p.currency,
		       p.tax_rate, p.base_stock, p.min_stock, p.max_stock, p.weight, p.dimensions, p.tags, p.attributes,
		       p.is_active, p.is_express_delivery, p.preparation_time, p.created_at, p.updated_at,
		       c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = $1`
	
	var categoryName sql.NullString
	err := r.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.CategoryID,
		&product.Brand,
		&product.SKU,
		&product.Barcode,
		&product.BasePrice,
		&product.Currency,
		&product.TaxRate,
		&product.BaseStock,
		&product.MinStock,
		&product.MaxStock,
		&product.Weight,
		&product.Dimensions,
		pq.Array(&product.Tags),
		&product.Attributes,
		&product.IsActive,
		&product.IsExpressDelivery,
		&product.PreparationTime,
		&product.CreatedAt,
		&product.UpdatedAt,
		&categoryName,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}

	// Load category if exists
	if categoryName.Valid {
		product.Category = &models.Category{
			ID:   product.CategoryID,
			Name: categoryName.String,
		}
	}
	
	return product, nil
}

func (r *productRepository) GetBySKU(sku string) (*models.Product, error) {
	product := &models.Product{}
	query := `
		SELECT id, name, description, category_id, brand, sku, barcode, base_price, currency,
		       tax_rate, base_stock, min_stock, max_stock, weight, dimensions, tags, attributes,
		       is_active, is_express_delivery, preparation_time, created_at, updated_at
		FROM products WHERE sku = $1`
	
	err := r.db.QueryRow(query, sku).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.CategoryID,
		&product.Brand,
		&product.SKU,
		&product.Barcode,
		&product.BasePrice,
		&product.Currency,
		&product.TaxRate,
		&product.BaseStock,
		&product.MinStock,
		&product.MaxStock,
		&product.Weight,
		&product.Dimensions,
		pq.Array(&product.Tags),
		&product.Attributes,
		&product.IsActive,
		&product.IsExpressDelivery,
		&product.PreparationTime,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return product, err
}

func (r *productRepository) GetByBarcode(barcode string) (*models.Product, error) {
	product := &models.Product{}
	query := `
		SELECT id, name, description, category_id, brand, sku, barcode, base_price, currency,
		       tax_rate, base_stock, min_stock, max_stock, weight, dimensions, tags, attributes,
		       is_active, is_express_delivery, preparation_time, created_at, updated_at
		FROM products WHERE barcode = $1`
	
	err := r.db.QueryRow(query, barcode).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.CategoryID,
		&product.Brand,
		&product.SKU,
		&product.Barcode,
		&product.BasePrice,
		&product.Currency,
		&product.TaxRate,
		&product.BaseStock,
		&product.MinStock,
		&product.MaxStock,
		&product.Weight,
		&product.Dimensions,
		pq.Array(&product.Tags),
		&product.Attributes,
		&product.IsActive,
		&product.IsExpressDelivery,
		&product.PreparationTime,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return product, err
}

func (r *productRepository) Search(req *models.SearchRequest) ([]*models.Product, int64, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Base query
	baseQuery := `
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id`

	// Build WHERE conditions
	if req.Query != "" {
		conditions = append(conditions, fmt.Sprintf("(p.name ILIKE $%d OR p.description ILIKE $%d)", argIndex, argIndex+1))
		searchTerm := "%" + req.Query + "%"
		args = append(args, searchTerm, searchTerm)
		argIndex += 2
	}

	if req.CategoryID != nil {
		conditions = append(conditions, fmt.Sprintf("p.category_id = $%d", argIndex))
		args = append(args, *req.CategoryID)
		argIndex++
	}

	if req.MinPrice != nil {
		conditions = append(conditions, fmt.Sprintf("p.base_price >= $%d", argIndex))
		args = append(args, *req.MinPrice)
		argIndex++
	}

	if req.MaxPrice != nil {
		conditions = append(conditions, fmt.Sprintf("p.base_price <= $%d", argIndex))
		args = append(args, *req.MaxPrice)
		argIndex++
	}

	if len(req.Tags) > 0 {
		conditions = append(conditions, fmt.Sprintf("p.tags && $%d", argIndex))
		args = append(args, pq.Array(req.Tags))
		argIndex++
	}

	if req.Brand != nil {
		conditions = append(conditions, fmt.Sprintf("p.brand ILIKE $%d", argIndex))
		args = append(args, "%"+*req.Brand+"%")
		argIndex++
	}

	if req.IsActive != nil {
		conditions = append(conditions, fmt.Sprintf("p.is_active = $%d", argIndex))
		args = append(args, *req.IsActive)
		argIndex++
	}

	if req.ExpressOnly {
		conditions = append(conditions, "p.is_express_delivery = true")
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) %s %s", baseQuery, whereClause)
	var total int64
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Build ORDER BY clause
	orderBy := "p.created_at DESC"
	if req.SortBy != "" {
		direction := "ASC"
		if req.SortOrder == "desc" {
			direction = "DESC"
		}
		
		switch req.SortBy {
		case "name":
			orderBy = fmt.Sprintf("p.name %s", direction)
		case "price":
			orderBy = fmt.Sprintf("p.base_price %s", direction)
		case "created_at":
			orderBy = fmt.Sprintf("p.created_at %s", direction)
		case "updated_at":
			orderBy = fmt.Sprintf("p.updated_at %s", direction)
		}
	}

	// Main query with pagination
	offset := (req.Page - 1) * req.Limit
	selectQuery := fmt.Sprintf(`
		SELECT p.id, p.name, p.description, p.category_id, p.brand, p.sku, p.barcode, p.base_price, p.currency,
		       p.tax_rate, p.base_stock, p.min_stock, p.max_stock, p.weight, p.dimensions, p.tags, p.attributes,
		       p.is_active, p.is_express_delivery, p.preparation_time, p.created_at, p.updated_at,
		       c.name as category_name
		%s %s
		ORDER BY %s
		LIMIT $%d OFFSET $%d`, baseQuery, whereClause, orderBy, argIndex, argIndex+1)
	
	args = append(args, req.Limit, offset)

	rows, err := r.db.Query(selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		var categoryName sql.NullString
		
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.CategoryID,
			&product.Brand,
			&product.SKU,
			&product.Barcode,
			&product.BasePrice,
			&product.Currency,
			&product.TaxRate,
			&product.BaseStock,
			&product.MinStock,
			&product.MaxStock,
			&product.Weight,
			&product.Dimensions,
			pq.Array(&product.Tags),
			&product.Attributes,
			&product.IsActive,
			&product.IsExpressDelivery,
			&product.PreparationTime,
			&product.CreatedAt,
			&product.UpdatedAt,
			&categoryName,
		)
		if err != nil {
			return nil, 0, err
		}

		// Load category if exists
		if categoryName.Valid {
			product.Category = &models.Category{
				ID:   product.CategoryID,
				Name: categoryName.String,
			}
		}

		products = append(products, product)
	}

	return products, total, rows.Err()
}

func (r *productRepository) Update(id uuid.UUID, updates *models.UpdateProductRequest) error {
	var setParts []string
	var args []interface{}
	argIndex := 1

	if updates.Name != nil {
		setParts = append(setParts, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, *updates.Name)
		argIndex++
	}

	if updates.Description != nil {
		setParts = append(setParts, fmt.Sprintf("description = $%d", argIndex))
		args = append(args, *updates.Description)
		argIndex++
	}

	if updates.CategoryID != nil {
		setParts = append(setParts, fmt.Sprintf("category_id = $%d", argIndex))
		args = append(args, *updates.CategoryID)
		argIndex++
	}

	if updates.Brand != nil {
		setParts = append(setParts, fmt.Sprintf("brand = $%d", argIndex))
		args = append(args, *updates.Brand)
		argIndex++
	}

	if updates.SKU != nil {
		setParts = append(setParts, fmt.Sprintf("sku = $%d", argIndex))
		args = append(args, *updates.SKU)
		argIndex++
	}

	if updates.Barcode != nil {
		setParts = append(setParts, fmt.Sprintf("barcode = $%d", argIndex))
		args = append(args, *updates.Barcode)
		argIndex++
	}

	if updates.BasePrice != nil {
		setParts = append(setParts, fmt.Sprintf("base_price = $%d", argIndex))
		args = append(args, *updates.BasePrice)
		argIndex++
	}

	if updates.Currency != nil {
		setParts = append(setParts, fmt.Sprintf("currency = $%d", argIndex))
		args = append(args, *updates.Currency)
		argIndex++
	}

	if updates.TaxRate != nil {
		setParts = append(setParts, fmt.Sprintf("tax_rate = $%d", argIndex))
		args = append(args, *updates.TaxRate)
		argIndex++
	}

	if updates.BaseStock != nil {
		setParts = append(setParts, fmt.Sprintf("base_stock = $%d", argIndex))
		args = append(args, *updates.BaseStock)
		argIndex++
	}

	if updates.MinStock != nil {
		setParts = append(setParts, fmt.Sprintf("min_stock = $%d", argIndex))
		args = append(args, *updates.MinStock)
		argIndex++
	}

	if updates.MaxStock != nil {
		setParts = append(setParts, fmt.Sprintf("max_stock = $%d", argIndex))
		args = append(args, *updates.MaxStock)
		argIndex++
	}

	if updates.Weight != nil {
		setParts = append(setParts, fmt.Sprintf("weight = $%d", argIndex))
		args = append(args, *updates.Weight)
		argIndex++
	}

	if updates.Dimensions != nil {
		setParts = append(setParts, fmt.Sprintf("dimensions = $%d", argIndex))
		args = append(args, *updates.Dimensions)
		argIndex++
	}

	if updates.Tags != nil {
		setParts = append(setParts, fmt.Sprintf("tags = $%d", argIndex))
		args = append(args, pq.Array(updates.Tags))
		argIndex++
	}

	if updates.Attributes != nil {
		setParts = append(setParts, fmt.Sprintf("attributes = $%d", argIndex))
		args = append(args, updates.Attributes)
		argIndex++
	}

	if updates.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *updates.IsActive)
		argIndex++
	}

	if updates.IsExpressDelivery != nil {
		setParts = append(setParts, fmt.Sprintf("is_express_delivery = $%d", argIndex))
		args = append(args, *updates.IsExpressDelivery)
		argIndex++
	}

	if updates.PreparationTime != nil {
		setParts = append(setParts, fmt.Sprintf("preparation_time = $%d", argIndex))
		args = append(args, *updates.PreparationTime)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE products SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
	args = append(args, id)

	result, err := r.db.Exec(query, args...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

func (r *productRepository) Delete(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM products WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

func (r *productRepository) GetVariants(productID uuid.UUID) ([]*models.ProductVariant, error) {
	query := `
		SELECT id, product_id, name, sku, barcode, price, stock, weight, dimensions, attributes,
		       is_active, sort_order, created_at, updated_at
		FROM product_variants
		WHERE product_id = $1 AND is_active = true
		ORDER BY sort_order, name`
	
	rows, err := r.db.Query(query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var variants []*models.ProductVariant
	for rows.Next() {
		variant := &models.ProductVariant{}
		err := rows.Scan(
			&variant.ID,
			&variant.ProductID,
			&variant.Name,
			&variant.SKU,
			&variant.Barcode,
			&variant.Price,
			&variant.Stock,
			&variant.Weight,
			&variant.Dimensions,
			&variant.Attributes,
			&variant.IsActive,
			&variant.SortOrder,
			&variant.CreatedAt,
			&variant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, variant)
	}
	
	return variants, rows.Err()
}

func (r *productRepository) GetMedia(productID uuid.UUID, variantID *uuid.UUID) ([]*models.ProductMedia, error) {
	var query string
	var args []interface{}
	
	if variantID != nil {
		query = `
			SELECT id, product_id, variant_id, type, url, file_name, file_size, mime_type, alt_text,
			       sort_order, is_active, created_at, updated_at
			FROM product_media
			WHERE product_id = $1 AND variant_id = $2 AND is_active = true
			ORDER BY sort_order`
		args = []interface{}{productID, *variantID}
	} else {
		query = `
			SELECT id, product_id, variant_id, type, url, file_name, file_size, mime_type, alt_text,
			       sort_order, is_active, created_at, updated_at
			FROM product_media
			WHERE product_id = $1 AND variant_id IS NULL AND is_active = true
			ORDER BY sort_order`
		args = []interface{}{productID}
	}
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var media []*models.ProductMedia
	for rows.Next() {
		m := &models.ProductMedia{}
		err := rows.Scan(
			&m.ID,
			&m.ProductID,
			&m.VariantID,
			&m.Type,
			&m.URL,
			&m.FileName,
			&m.FileSize,
			&m.MimeType,
			&m.AltText,
			&m.SortOrder,
			&m.IsActive,
			&m.CreatedAt,
			&m.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		media = append(media, m)
	}
	
	return media, rows.Err()
}

func (r *productRepository) GetSellerData(productID uuid.UUID, sellerID *uuid.UUID) ([]*models.SellerProduct, error) {
	var query string
	var args []interface{}
	
	if sellerID != nil {
		query = `
			SELECT id, seller_id, product_id, variant_id, seller_sku, price, stock, min_stock, max_stock,
			       is_active, is_visible, preparation_time, notes, created_at, updated_at
			FROM seller_products
			WHERE product_id = $1 AND seller_id = $2`
		args = []interface{}{productID, *sellerID}
	} else {
		query = `
			SELECT id, seller_id, product_id, variant_id, seller_sku, price, stock, min_stock, max_stock,
			       is_active, is_visible, preparation_time, notes, created_at, updated_at
			FROM seller_products
			WHERE product_id = $1`
		args = []interface{}{productID}
	}
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var sellerProducts []*models.SellerProduct
	for rows.Next() {
		sp := &models.SellerProduct{}
		err := rows.Scan(
			&sp.ID,
			&sp.SellerID,
			&sp.ProductID,
			&sp.VariantID,
			&sp.SellerSKU,
			&sp.Price,
			&sp.Stock,
			&sp.MinStock,
			&sp.MaxStock,
			&sp.IsActive,
			&sp.IsVisible,
			&sp.PreparationTime,
			&sp.Notes,
			&sp.CreatedAt,
			&sp.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		sellerProducts = append(sellerProducts, sp)
	}
	
	return sellerProducts, rows.Err()
}

func (r *productRepository) CreateVariant(variant *models.ProductVariant) error {
	query := `
		INSERT INTO product_variants (id, product_id, name, sku, barcode, price, stock, weight, dimensions,
		                             attributes, is_active, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		variant.ID,
		variant.ProductID,
		variant.Name,
		variant.SKU,
		variant.Barcode,
		variant.Price,
		variant.Stock,
		variant.Weight,
		variant.Dimensions,
		variant.Attributes,
		variant.IsActive,
		variant.SortOrder,
	).Scan(&variant.CreatedAt, &variant.UpdatedAt)
}

func (r *productRepository) UpdateVariant(id uuid.UUID, variant *models.ProductVariant) error {
	query := `
		UPDATE product_variants 
		SET name = $2, sku = $3, barcode = $4, price = $5, stock = $6, weight = $7, dimensions = $8,
		    attributes = $9, is_active = $10, sort_order = $11
		WHERE id = $1`
	
	result, err := r.db.Exec(
		query,
		id,
		variant.Name,
		variant.SKU,
		variant.Barcode,
		variant.Price,
		variant.Stock,
		variant.Weight,
		variant.Dimensions,
		variant.Attributes,
		variant.IsActive,
		variant.SortOrder,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("variant not found")
	}

	return nil
}

func (r *productRepository) DeleteVariant(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM product_variants WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("variant not found")
	}

	return nil
}

func (r *productRepository) CreateMedia(media *models.ProductMedia) error {
	query := `
		INSERT INTO product_media (id, product_id, variant_id, type, url, file_name, file_size, mime_type,
		                          alt_text, sort_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		media.ID,
		media.ProductID,
		media.VariantID,
		media.Type,
		media.URL,
		media.FileName,
		media.FileSize,
		media.MimeType,
		media.AltText,
		media.SortOrder,
		media.IsActive,
	).Scan(&media.CreatedAt, &media.UpdatedAt)
}

func (r *productRepository) UpdateMedia(id uuid.UUID, media *models.ProductMedia) error {
	query := `
		UPDATE product_media 
		SET type = $2, url = $3, file_name = $4, file_size = $5, mime_type = $6, alt_text = $7,
		    sort_order = $8, is_active = $9
		WHERE id = $1`
	
	result, err := r.db.Exec(
		query,
		id,
		media.Type,
		media.URL,
		media.FileName,
		media.FileSize,
		media.MimeType,
		media.AltText,
		media.SortOrder,
		media.IsActive,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("media not found")
	}

	return nil
}

func (r *productRepository) DeleteMedia(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM product_media WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("media not found")
	}

	return nil
}

func (r *productRepository) UpsertSellerProduct(sellerProduct *models.SellerProduct) error {
	query := `
		INSERT INTO seller_products (id, seller_id, product_id, variant_id, seller_sku, price, stock,
		                            min_stock, max_stock, is_active, is_visible, preparation_time, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		ON CONFLICT (seller_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID))
		DO UPDATE SET
			seller_sku = EXCLUDED.seller_sku,
			price = EXCLUDED.price,
			stock = EXCLUDED.stock,
			min_stock = EXCLUDED.min_stock,
			max_stock = EXCLUDED.max_stock,
			is_active = EXCLUDED.is_active,
			is_visible = EXCLUDED.is_visible,
			preparation_time = EXCLUDED.preparation_time,
			notes = EXCLUDED.notes,
			updated_at = NOW()
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		sellerProduct.ID,
		sellerProduct.SellerID,
		sellerProduct.ProductID,
		sellerProduct.VariantID,
		sellerProduct.SellerSKU,
		sellerProduct.Price,
		sellerProduct.Stock,
		sellerProduct.MinStock,
		sellerProduct.MaxStock,
		sellerProduct.IsActive,
		sellerProduct.IsVisible,
		sellerProduct.PreparationTime,
		sellerProduct.Notes,
	).Scan(&sellerProduct.CreatedAt, &sellerProduct.UpdatedAt)
}

func (r *productRepository) DeleteSellerProduct(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM seller_products WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("seller product not found")
	}

	return nil
}

func (r *productRepository) GetFeatured(limit int) ([]*models.Product, error) {
	query := `
		SELECT p.id, p.name, p.description, p.category_id, p.brand, p.sku, p.barcode, p.base_price, p.currency,
		       p.tax_rate, p.base_stock, p.min_stock, p.max_stock, p.weight, p.dimensions, p.tags, p.attributes,
		       p.is_active, p.is_express_delivery, p.preparation_time, p.created_at, p.updated_at,
		       c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = true
		ORDER BY p.created_at DESC
		LIMIT $1`
	
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		var categoryName sql.NullString
		
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.CategoryID,
			&product.Brand,
			&product.SKU,
			&product.Barcode,
			&product.BasePrice,
			&product.Currency,
			&product.TaxRate,
			&product.BaseStock,
			&product.MinStock,
			&product.MaxStock,
			&product.Weight,
			&product.Dimensions,
			pq.Array(&product.Tags),
			&product.Attributes,
			&product.IsActive,
			&product.IsExpressDelivery,
			&product.PreparationTime,
			&product.CreatedAt,
			&product.UpdatedAt,
			&categoryName,
		)
		if err != nil {
			return nil, err
		}

		// Load category if exists
		if categoryName.Valid {
			product.Category = &models.Category{
				ID:   product.CategoryID,
				Name: categoryName.String,
			}
		}

		products = append(products, product)
	}

	return products, rows.Err()
}

func (r *productRepository) GetByCategory(categoryID uuid.UUID, limit int, offset int) ([]*models.Product, int64, error) {
	// Count query
	countQuery := `
		SELECT COUNT(*)
		FROM products p
		WHERE p.category_id = $1 AND p.is_active = true`
	
	var total int64
	err := r.db.QueryRow(countQuery, categoryID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := `
		SELECT p.id, p.name, p.description, p.category_id, p.brand, p.sku, p.barcode, p.base_price, p.currency,
		       p.tax_rate, p.base_stock, p.min_stock, p.max_stock, p.weight, p.dimensions, p.tags, p.attributes,
		       p.is_active, p.is_express_delivery, p.preparation_time, p.created_at, p.updated_at,
		       c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.category_id = $1 AND p.is_active = true
		ORDER BY p.created_at DESC
		LIMIT $2 OFFSET $3`
	
	rows, err := r.db.Query(query, categoryID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		product := &models.Product{}
		var categoryName sql.NullString
		
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.CategoryID,
			&product.Brand,
			&product.SKU,
			&product.Barcode,
			&product.BasePrice,
			&product.Currency,
			&product.TaxRate,
			&product.BaseStock,
			&product.MinStock,
			&product.MaxStock,
			&product.Weight,
			&product.Dimensions,
			pq.Array(&product.Tags),
			&product.Attributes,
			&product.IsActive,
			&product.IsExpressDelivery,
			&product.PreparationTime,
			&product.CreatedAt,
			&product.UpdatedAt,
			&categoryName,
		)
		if err != nil {
			return nil, 0, err
		}

		// Load category if exists
		if categoryName.Valid {
			product.Category = &models.Category{
				ID:   product.CategoryID,
				Name: categoryName.String,
			}
		}

		products = append(products, product)
	}

	return products, total, rows.Err()
}