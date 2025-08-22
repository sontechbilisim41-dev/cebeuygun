package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/google/uuid"
)

type CommissionRepository interface {
	CreateCommissionRate(rate *models.CommissionRate) error
	GetCommissionRateByID(id uuid.UUID) (*models.CommissionRate, error)
	GetApplicableCommissionRates(categoryID *uuid.UUID, sellerID *uuid.UUID, logisticsProvider *string, region *string, effectiveDate time.Time) ([]*models.CommissionRate, error)
	UpdateCommissionRate(id uuid.UUID, updates *models.UpdateCommissionRateRequest) error
	DeleteCommissionRate(id uuid.UUID) error
	GetCommissionRateHistory(categoryID *uuid.UUID, sellerID *uuid.UUID) ([]*models.CommissionRate, error)
	BulkUpdateCommissionRates(request *models.BulkCommissionUpdateRequest) (*models.BulkCommissionUpdateResponse, error)
	GetCommissionAnalytics(startDate, endDate time.Time, categoryID *uuid.UUID, sellerID *uuid.UUID, region *string) (*models.CommissionAnalytics, error)
}

type commissionRepository struct {
	db *sql.DB
}

func NewCommissionRepository(db *sql.DB) CommissionRepository {
	return &commissionRepository{db: db}
}

func (r *commissionRepository) CreateCommissionRate(rate *models.CommissionRate) error {
	query := `
		INSERT INTO commission_rates (id, category_id, seller_id, logistics_provider, commission_type, rate, 
		                             min_amount, max_amount, currency, region, effective_from, effective_to, 
		                             is_active, priority)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		rate.ID,
		rate.CategoryID,
		rate.SellerID,
		rate.LogisticsProvider,
		rate.CommissionType,
		rate.Rate,
		rate.MinAmount,
		rate.MaxAmount,
		rate.Currency,
		rate.Region,
		rate.EffectiveFrom,
		rate.EffectiveTo,
		rate.IsActive,
		rate.Priority,
	).Scan(&rate.CreatedAt, &rate.UpdatedAt)
}

func (r *commissionRepository) GetCommissionRateByID(id uuid.UUID) (*models.CommissionRate, error) {
	rate := &models.CommissionRate{}
	query := `
		SELECT id, category_id, seller_id, logistics_provider, commission_type, rate, min_amount, max_amount,
		       currency, region, effective_from, effective_to, is_active, priority, created_at, updated_at
		FROM commission_rates WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&rate.ID,
		&rate.CategoryID,
		&rate.SellerID,
		&rate.LogisticsProvider,
		&rate.CommissionType,
		&rate.Rate,
		&rate.MinAmount,
		&rate.MaxAmount,
		&rate.Currency,
		&rate.Region,
		&rate.EffectiveFrom,
		&rate.EffectiveTo,
		&rate.IsActive,
		&rate.Priority,
		&rate.CreatedAt,
		&rate.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return rate, err
}

func (r *commissionRepository) GetApplicableCommissionRates(categoryID *uuid.UUID, sellerID *uuid.UUID, logisticsProvider *string, region *string, effectiveDate time.Time) ([]*models.CommissionRate, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Base conditions
	conditions = append(conditions, "is_active = true")
	conditions = append(conditions, fmt.Sprintf("effective_from <= $%d", argIndex))
	args = append(args, effectiveDate)
	argIndex++

	conditions = append(conditions, fmt.Sprintf("(effective_to IS NULL OR effective_to >= $%d)", argIndex))
	args = append(args, effectiveDate)
	argIndex++

	// Specific filters with fallback to NULL (general rules)
	if categoryID != nil {
		conditions = append(conditions, fmt.Sprintf("(category_id = $%d OR category_id IS NULL)", argIndex))
		args = append(args, *categoryID)
		argIndex++
	} else {
		conditions = append(conditions, "category_id IS NULL")
	}

	if sellerID != nil {
		conditions = append(conditions, fmt.Sprintf("(seller_id = $%d OR seller_id IS NULL)", argIndex))
		args = append(args, *sellerID)
		argIndex++
	} else {
		conditions = append(conditions, "seller_id IS NULL")
	}

	if logisticsProvider != nil {
		conditions = append(conditions, fmt.Sprintf("(logistics_provider = $%d OR logistics_provider IS NULL)", argIndex))
		args = append(args, *logisticsProvider)
		argIndex++
	} else {
		conditions = append(conditions, "logistics_provider IS NULL")
	}

	if region != nil {
		conditions = append(conditions, fmt.Sprintf("(region = $%d OR region IS NULL)", argIndex))
		args = append(args, *region)
		argIndex++
	} else {
		conditions = append(conditions, "region IS NULL")
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	query := fmt.Sprintf(`
		SELECT id, category_id, seller_id, logistics_provider, commission_type, rate, min_amount, max_amount,
		       currency, region, effective_from, effective_to, is_active, priority, created_at, updated_at
		FROM commission_rates %s
		ORDER BY priority DESC, 
		         CASE WHEN category_id IS NOT NULL THEN 1 ELSE 0 END DESC,
		         CASE WHEN seller_id IS NOT NULL THEN 1 ELSE 0 END DESC,
		         CASE WHEN logistics_provider IS NOT NULL THEN 1 ELSE 0 END DESC,
		         CASE WHEN region IS NOT NULL THEN 1 ELSE 0 END DESC,
		         created_at DESC`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []*models.CommissionRate
	for rows.Next() {
		rate := &models.CommissionRate{}
		err := rows.Scan(
			&rate.ID,
			&rate.CategoryID,
			&rate.SellerID,
			&rate.LogisticsProvider,
			&rate.CommissionType,
			&rate.Rate,
			&rate.MinAmount,
			&rate.MaxAmount,
			&rate.Currency,
			&rate.Region,
			&rate.EffectiveFrom,
			&rate.EffectiveTo,
			&rate.IsActive,
			&rate.Priority,
			&rate.CreatedAt,
			&rate.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

func (r *commissionRepository) UpdateCommissionRate(id uuid.UUID, updates *models.UpdateCommissionRateRequest) error {
	var setParts []string
	var args []interface{}
	argIndex := 1

	if updates.Rate != nil {
		setParts = append(setParts, fmt.Sprintf("rate = $%d", argIndex))
		args = append(args, *updates.Rate)
		argIndex++
	}

	if updates.MinAmount != nil {
		setParts = append(setParts, fmt.Sprintf("min_amount = $%d", argIndex))
		args = append(args, *updates.MinAmount)
		argIndex++
	}

	if updates.MaxAmount != nil {
		setParts = append(setParts, fmt.Sprintf("max_amount = $%d", argIndex))
		args = append(args, *updates.MaxAmount)
		argIndex++
	}

	if updates.Region != nil {
		setParts = append(setParts, fmt.Sprintf("region = $%d", argIndex))
		args = append(args, *updates.Region)
		argIndex++
	}

	if updates.EffectiveFrom != nil {
		setParts = append(setParts, fmt.Sprintf("effective_from = $%d", argIndex))
		args = append(args, *updates.EffectiveFrom)
		argIndex++
	}

	if updates.EffectiveTo != nil {
		setParts = append(setParts, fmt.Sprintf("effective_to = $%d", argIndex))
		args = append(args, *updates.EffectiveTo)
		argIndex++
	}

	if updates.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *updates.IsActive)
		argIndex++
	}

	if updates.Priority != nil {
		setParts = append(setParts, fmt.Sprintf("priority = $%d", argIndex))
		args = append(args, *updates.Priority)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE commission_rates SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
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
		return fmt.Errorf("commission rate not found")
	}

	return nil
}

func (r *commissionRepository) DeleteCommissionRate(id uuid.UUID) error {
	// Soft delete by setting is_active to false
	result, err := r.db.Exec("UPDATE commission_rates SET is_active = false WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("commission rate not found")
	}

	return nil
}

func (r *commissionRepository) GetCommissionRateHistory(categoryID *uuid.UUID, sellerID *uuid.UUID) ([]*models.CommissionRate, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if categoryID != nil {
		conditions = append(conditions, fmt.Sprintf("category_id = $%d", argIndex))
		args = append(args, *categoryID)
		argIndex++
	}

	if sellerID != nil {
		conditions = append(conditions, fmt.Sprintf("seller_id = $%d", argIndex))
		args = append(args, *sellerID)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT id, category_id, seller_id, logistics_provider, commission_type, rate, min_amount, max_amount,
		       currency, region, effective_from, effective_to, is_active, priority, created_at, updated_at
		FROM commission_rates %s
		ORDER BY effective_from DESC, priority DESC`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []*models.CommissionRate
	for rows.Next() {
		rate := &models.CommissionRate{}
		err := rows.Scan(
			&rate.ID,
			&rate.CategoryID,
			&rate.SellerID,
			&rate.LogisticsProvider,
			&rate.CommissionType,
			&rate.Rate,
			&rate.MinAmount,
			&rate.MaxAmount,
			&rate.Currency,
			&rate.Region,
			&rate.EffectiveFrom,
			&rate.EffectiveTo,
			&rate.IsActive,
			&rate.Priority,
			&rate.CreatedAt,
			&rate.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

func (r *commissionRepository) BulkUpdateCommissionRates(request *models.BulkCommissionUpdateRequest) (*models.BulkCommissionUpdateResponse, error) {
	response := &models.BulkCommissionUpdateResponse{
		Success: true,
		Message: "Bulk update completed",
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Update category-based rates
	for _, categoryID := range request.CategoryIDs {
		query := `
			UPDATE commission_rates 
			SET rate = $1, effective_from = $2, effective_to = $3, updated_at = NOW()
			WHERE category_id = $4 AND is_active = true`
		
		result, err := tx.Exec(query, request.Rate, request.EffectiveFrom, request.EffectiveTo, categoryID)
		if err != nil {
			response.Errors = append(response.Errors, models.BulkUpdateError{
				ID:      categoryID,
				Error:   "Update failed",
				Details: err.Error(),
			})
			response.FailedCount++
			continue
		}
		
		rowsAffected, _ := result.RowsAffected()
		response.UpdatedCount += int(rowsAffected)
	}

	// Update seller-based rates
	for _, sellerID := range request.SellerIDs {
		query := `
			UPDATE commission_rates 
			SET rate = $1, effective_from = $2, effective_to = $3, updated_at = NOW()
			WHERE seller_id = $4 AND is_active = true`
		
		result, err := tx.Exec(query, request.Rate, request.EffectiveFrom, request.EffectiveTo, sellerID)
		if err != nil {
			response.Errors = append(response.Errors, models.BulkUpdateError{
				ID:      sellerID,
				Error:   "Update failed",
				Details: err.Error(),
			})
			response.FailedCount++
			continue
		}
		
		rowsAffected, _ := result.RowsAffected()
		response.UpdatedCount += int(rowsAffected)
	}

	if response.FailedCount > 0 {
		response.Success = false
		response.Message = fmt.Sprintf("Bulk update completed with %d failures", response.FailedCount)
	}

	return response, tx.Commit()
}

func (r *commissionRepository) GetCommissionAnalytics(startDate, endDate time.Time, categoryID *uuid.UUID, sellerID *uuid.UUID, region *string) (*models.CommissionAnalytics, error) {
	// This would typically join with actual transaction data
	// For now, we'll return mock analytics based on commission rates
	
	analytics := &models.CommissionAnalytics{
		Period: fmt.Sprintf("%s to %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")),
		CategoryBreakdown: make(map[string]decimal.Decimal),
		RegionBreakdown:   make(map[string]decimal.Decimal),
	}

	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "is_active = true")
	conditions = append(conditions, fmt.Sprintf("effective_from <= $%d", argIndex))
	args = append(args, endDate)
	argIndex++

	conditions = append(conditions, fmt.Sprintf("(effective_to IS NULL OR effective_to >= $%d)", argIndex))
	args = append(args, startDate)
	argIndex++

	if categoryID != nil {
		conditions = append(conditions, fmt.Sprintf("category_id = $%d", argIndex))
		args = append(args, *categoryID)
		argIndex++
	}

	if sellerID != nil {
		conditions = append(conditions, fmt.Sprintf("seller_id = $%d", argIndex))
		args = append(args, *sellerID)
		argIndex++
	}

	if region != nil {
		conditions = append(conditions, fmt.Sprintf("region = $%d", argIndex))
		args = append(args, *region)
		argIndex++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as rate_count,
			AVG(rate) as average_rate
		FROM commission_rates %s`, whereClause)

	var rateCount int
	var avgRate sql.NullFloat64

	err := r.db.QueryRow(query, args...).Scan(&rateCount, &avgRate)
	if err != nil {
		return nil, err
	}

	analytics.TransactionCount = rateCount
	if avgRate.Valid {
		analytics.AverageRate = decimal.NewFromFloat(avgRate.Float64)
	}

	// Mock commission totals (in real implementation, this would come from actual transactions)
	analytics.TotalCommission = decimal.NewFromFloat(1000.00)
	analytics.SellerCommission = decimal.NewFromFloat(850.00)

	return analytics, nil
}