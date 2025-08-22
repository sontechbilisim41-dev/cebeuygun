package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type PricingRepository interface {
	// Pricing Rules
	CreatePricingRule(rule *models.PricingRule) error
	GetPricingRuleByID(id uuid.UUID) (*models.PricingRule, error)
	GetActivePricingRules(ruleType *models.PricingRuleType, region *string, effectiveDate time.Time) ([]*models.PricingRule, error)
	UpdatePricingRule(id uuid.UUID, updates *models.UpdatePricingRuleRequest) error
	DeletePricingRule(id uuid.UUID) error
	GetPricingRuleVersions(name string) ([]*models.PricingRule, error)
	
	// Quotes
	CreateQuote(quote *models.PricingQuote) error
	GetQuoteByHash(hash string) (*models.PricingQuote, error)
	GetQuotesByCustomer(customerID uuid.UUID, limit, offset int) ([]*models.PricingQuote, int64, error)
	CleanupExpiredQuotes() error
	
	// Analytics
	GetPricingAnalytics(startDate, endDate time.Time, region *string) (*models.PricingAnalytics, error)
	RecordQuoteMetrics(quote *models.PricingQuote) error
}

type pricingRepository struct {
	db *sql.DB
}

func NewPricingRepository(db *sql.DB) PricingRepository {
	return &pricingRepository{db: db}
}

func (r *pricingRepository) CreatePricingRule(rule *models.PricingRule) error {
	configJSON, err := json.Marshal(rule.Configuration)
	if err != nil {
		return fmt.Errorf("failed to marshal configuration: %w", err)
	}

	query := `
		INSERT INTO pricing_rules (id, name, type, configuration, region, effective_from, effective_to, is_active, version, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		rule.ID,
		rule.Name,
		rule.Type,
		configJSON,
		rule.Region,
		rule.EffectiveFrom,
		rule.EffectiveTo,
		rule.IsActive,
		rule.Version,
		rule.CreatedBy,
	).Scan(&rule.CreatedAt, &rule.UpdatedAt)
}

func (r *pricingRepository) GetPricingRuleByID(id uuid.UUID) (*models.PricingRule, error) {
	rule := &models.PricingRule{}
	query := `
		SELECT id, name, type, configuration, region, effective_from, effective_to, is_active, version, created_by, created_at, updated_at
		FROM pricing_rules WHERE id = $1`
	
	var configJSON []byte
	err := r.db.QueryRow(query, id).Scan(
		&rule.ID,
		&rule.Name,
		&rule.Type,
		&configJSON,
		&rule.Region,
		&rule.EffectiveFrom,
		&rule.EffectiveTo,
		&rule.IsActive,
		&rule.Version,
		&rule.CreatedBy,
		&rule.CreatedAt,
		&rule.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Unmarshal configuration
	if err := json.Unmarshal(configJSON, &rule.Configuration); err != nil {
		return nil, fmt.Errorf("failed to unmarshal configuration: %w", err)
	}
	
	return rule, nil
}

func (r *pricingRepository) GetActivePricingRules(ruleType *models.PricingRuleType, region *string, effectiveDate time.Time) ([]*models.PricingRule, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, "is_active = true")
	conditions = append(conditions, fmt.Sprintf("effective_from <= $%d", argIndex))
	args = append(args, effectiveDate)
	argIndex++

	conditions = append(conditions, fmt.Sprintf("(effective_to IS NULL OR effective_to >= $%d)", argIndex))
	args = append(args, effectiveDate)
	argIndex++

	if ruleType != nil {
		conditions = append(conditions, fmt.Sprintf("type = $%d", argIndex))
		args = append(args, *ruleType)
		argIndex++
	}

	if region != nil {
		conditions = append(conditions, fmt.Sprintf("(region IS NULL OR region = $%d)", argIndex))
		args = append(args, *region)
		argIndex++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	query := fmt.Sprintf(`
		SELECT id, name, type, configuration, region, effective_from, effective_to, is_active, version, created_by, created_at, updated_at
		FROM pricing_rules %s
		ORDER BY priority DESC, version DESC, created_at DESC`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*models.PricingRule
	for rows.Next() {
		rule := &models.PricingRule{}
		var configJSON []byte
		
		err := rows.Scan(
			&rule.ID,
			&rule.Name,
			&rule.Type,
			&configJSON,
			&rule.Region,
			&rule.EffectiveFrom,
			&rule.EffectiveTo,
			&rule.IsActive,
			&rule.Version,
			&rule.CreatedBy,
			&rule.CreatedAt,
			&rule.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Unmarshal configuration
		if err := json.Unmarshal(configJSON, &rule.Configuration); err != nil {
			return nil, fmt.Errorf("failed to unmarshal configuration: %w", err)
		}
		
		rules = append(rules, rule)
	}

	return rules, rows.Err()
}

func (r *pricingRepository) UpdatePricingRule(id uuid.UUID, updates *models.UpdatePricingRuleRequest) error {
	var setParts []string
	var args []interface{}
	argIndex := 1

	if updates.Name != nil {
		setParts = append(setParts, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, *updates.Name)
		argIndex++
	}

	if updates.Configuration != nil {
		configJSON, err := json.Marshal(updates.Configuration)
		if err != nil {
			return fmt.Errorf("failed to marshal configuration: %w", err)
		}
		setParts = append(setParts, fmt.Sprintf("configuration = $%d", argIndex))
		args = append(args, configJSON)
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

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE pricing_rules SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
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
		return fmt.Errorf("pricing rule not found")
	}

	return nil
}

func (r *pricingRepository) DeletePricingRule(id uuid.UUID) error {
	// Soft delete by setting is_active to false
	result, err := r.db.Exec("UPDATE pricing_rules SET is_active = false WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("pricing rule not found")
	}

	return nil
}

func (r *pricingRepository) GetPricingRuleVersions(name string) ([]*models.PricingRule, error) {
	query := `
		SELECT id, name, type, configuration, region, effective_from, effective_to, is_active, version, created_by, created_at, updated_at
		FROM pricing_rules 
		WHERE name = $1
		ORDER BY version DESC`

	rows, err := r.db.Query(query, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []*models.PricingRule
	for rows.Next() {
		rule := &models.PricingRule{}
		var configJSON []byte
		
		err := rows.Scan(
			&rule.ID,
			&rule.Name,
			&rule.Type,
			&configJSON,
			&rule.Region,
			&rule.EffectiveFrom,
			&rule.EffectiveTo,
			&rule.IsActive,
			&rule.Version,
			&rule.CreatedBy,
			&rule.CreatedAt,
			&rule.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Unmarshal configuration
		if err := json.Unmarshal(configJSON, &rule.Configuration); err != nil {
			return nil, fmt.Errorf("failed to unmarshal configuration: %w", err)
		}
		
		rules = append(rules, rule)
	}

	return rules, rows.Err()
}

func (r *pricingRepository) CreateQuote(quote *models.PricingQuote) error {
	commissionJSON, err := json.Marshal(quote.CommissionBreakdown)
	if err != nil {
		return fmt.Errorf("failed to marshal commission breakdown: %w", err)
	}

	pricingJSON, err := json.Marshal(quote.PricingBreakdown)
	if err != nil {
		return fmt.Errorf("failed to marshal pricing breakdown: %w", err)
	}

	rulesJSON, err := json.Marshal(quote.AppliedRules)
	if err != nil {
		return fmt.Errorf("failed to marshal applied rules: %w", err)
	}

	var featureFlagsJSON []byte
	if quote.FeatureFlags != nil {
		featureFlagsJSON, err = json.Marshal(quote.FeatureFlags)
		if err != nil {
			return fmt.Errorf("failed to marshal feature flags: %w", err)
		}
	}

	query := `
		INSERT INTO pricing_quotes (id, customer_id, seller_id, quote_hash, subtotal, tax_amount, delivery_fee, 
		                           small_basket_fee, total_amount, currency, commission_breakdown, pricing_breakdown,
		                           applied_rules, feature_flags, region, valid_until)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING created_at`
	
	return r.db.QueryRow(
		query,
		quote.ID,
		quote.CustomerID,
		quote.SellerID,
		quote.QuoteHash,
		quote.Subtotal,
		quote.TaxAmount,
		quote.DeliveryFee,
		quote.SmallBasketFee,
		quote.TotalAmount,
		quote.Currency,
		commissionJSON,
		pricingJSON,
		rulesJSON,
		featureFlagsJSON,
		quote.Region,
		quote.ValidUntil,
	).Scan(&quote.CreatedAt)
}

func (r *pricingRepository) GetQuoteByHash(hash string) (*models.PricingQuote, error) {
	quote := &models.PricingQuote{}
	query := `
		SELECT id, customer_id, seller_id, quote_hash, subtotal, tax_amount, delivery_fee, small_basket_fee,
		       total_amount, currency, commission_breakdown, pricing_breakdown, applied_rules, feature_flags,
		       region, valid_until, created_at
		FROM pricing_quotes 
		WHERE quote_hash = $1 AND valid_until > NOW()
		ORDER BY created_at DESC
		LIMIT 1`
	
	var commissionJSON, pricingJSON, rulesJSON, featureFlagsJSON []byte
	err := r.db.QueryRow(query, hash).Scan(
		&quote.ID,
		&quote.CustomerID,
		&quote.SellerID,
		&quote.QuoteHash,
		&quote.Subtotal,
		&quote.TaxAmount,
		&quote.DeliveryFee,
		&quote.SmallBasketFee,
		&quote.TotalAmount,
		&quote.Currency,
		&commissionJSON,
		&pricingJSON,
		&rulesJSON,
		&featureFlagsJSON,
		&quote.Region,
		&quote.ValidUntil,
		&quote.CreatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Unmarshal JSON fields
	if err := json.Unmarshal(commissionJSON, &quote.CommissionBreakdown); err != nil {
		return nil, fmt.Errorf("failed to unmarshal commission breakdown: %w", err)
	}
	
	if err := json.Unmarshal(pricingJSON, &quote.PricingBreakdown); err != nil {
		return nil, fmt.Errorf("failed to unmarshal pricing breakdown: %w", err)
	}
	
	if err := json.Unmarshal(rulesJSON, &quote.AppliedRules); err != nil {
		return nil, fmt.Errorf("failed to unmarshal applied rules: %w", err)
	}
	
	if len(featureFlagsJSON) > 0 {
		if err := json.Unmarshal(featureFlagsJSON, &quote.FeatureFlags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal feature flags: %w", err)
		}
	}
	
	return quote, nil
}

func (r *pricingRepository) GetQuotesByCustomer(customerID uuid.UUID, limit, offset int) ([]*models.PricingQuote, int64, error) {
	// Count query
	countQuery := `SELECT COUNT(*) FROM pricing_quotes WHERE customer_id = $1`
	var total int64
	err := r.db.QueryRow(countQuery, customerID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := `
		SELECT id, customer_id, seller_id, quote_hash, subtotal, tax_amount, delivery_fee, small_basket_fee,
		       total_amount, currency, commission_breakdown, pricing_breakdown, applied_rules, feature_flags,
		       region, valid_until, created_at
		FROM pricing_quotes 
		WHERE customer_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(query, customerID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var quotes []*models.PricingQuote
	for rows.Next() {
		quote := &models.PricingQuote{}
		var commissionJSON, pricingJSON, rulesJSON, featureFlagsJSON []byte
		
		err := rows.Scan(
			&quote.ID,
			&quote.CustomerID,
			&quote.SellerID,
			&quote.QuoteHash,
			&quote.Subtotal,
			&quote.TaxAmount,
			&quote.DeliveryFee,
			&quote.SmallBasketFee,
			&quote.TotalAmount,
			&quote.Currency,
			&commissionJSON,
			&pricingJSON,
			&rulesJSON,
			&featureFlagsJSON,
			&quote.Region,
			&quote.ValidUntil,
			&quote.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		
		// Unmarshal JSON fields (simplified for list view)
		quotes = append(quotes, quote)
	}

	return quotes, total, rows.Err()
}

func (r *pricingRepository) CleanupExpiredQuotes() error {
	query := `DELETE FROM pricing_quotes WHERE valid_until < NOW()`
	result, err := r.db.Exec(query)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected > 0 {
		log.Printf("Cleaned up %d expired quotes", rowsAffected)
	}

	return nil
}

func (r *pricingRepository) GetPricingAnalytics(startDate, endDate time.Time, region *string) (*models.PricingAnalytics, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, fmt.Sprintf("created_at >= $%d", argIndex))
	args = append(args, startDate)
	argIndex++

	conditions = append(conditions, fmt.Sprintf("created_at <= $%d", argIndex))
	args = append(args, endDate)
	argIndex++

	if region != nil {
		conditions = append(conditions, fmt.Sprintf("region = $%d", argIndex))
		args = append(args, *region)
		argIndex++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_quotes,
			AVG(total_amount) as average_quote_value,
			SUM(delivery_fee) as delivery_fee_total,
			SUM(small_basket_fee) as small_basket_fee_total
		FROM pricing_quotes %s`, whereClause)

	analytics := &models.PricingAnalytics{
		Period: fmt.Sprintf("%s to %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")),
	}

	var avgQuoteValue sql.NullFloat64
	var deliveryFeeTotal, smallBasketFeeTotal sql.NullFloat64

	err := r.db.QueryRow(query, args...).Scan(
		&analytics.TotalQuotes,
		&avgQuoteValue,
		&deliveryFeeTotal,
		&smallBasketFeeTotal,
	)
	if err != nil {
		return nil, err
	}

	if avgQuoteValue.Valid {
		analytics.AverageQuoteValue = decimal.NewFromFloat(avgQuoteValue.Float64)
	}
	if deliveryFeeTotal.Valid {
		analytics.DeliveryFeeTotal = decimal.NewFromFloat(deliveryFeeTotal.Float64)
	}
	if smallBasketFeeTotal.Valid {
		analytics.SmallBasketFeeTotal = decimal.NewFromFloat(smallBasketFeeTotal.Float64)
	}

	// Get regional breakdown
	regionalQuery := fmt.Sprintf(`
		SELECT 
			COALESCE(region, 'default') as region,
			COUNT(*) as quote_count,
			AVG(total_amount) as average_value,
			AVG(delivery_fee) as average_delivery_fee
		FROM pricing_quotes %s
		GROUP BY region`, whereClause)

	rows, err := r.db.Query(regionalQuery, args...)
	if err != nil {
		return analytics, nil // Return partial data
	}
	defer rows.Close()

	analytics.RegionalBreakdown = make(map[string]models.PricingRegionStats)
	for rows.Next() {
		var region string
		var stats models.PricingRegionStats
		var avgValue, avgDeliveryFee sql.NullFloat64

		err := rows.Scan(&region, &stats.QuoteCount, &avgValue, &avgDeliveryFee)
		if err != nil {
			continue
		}

		if avgValue.Valid {
			stats.AverageValue = decimal.NewFromFloat(avgValue.Float64)
		}
		if avgDeliveryFee.Valid {
			stats.AverageDeliveryFee = decimal.NewFromFloat(avgDeliveryFee.Float64)
		}

		analytics.RegionalBreakdown[region] = stats
	}

	return analytics, nil
}

func (r *pricingRepository) RecordQuoteMetrics(quote *models.PricingQuote) error {
	// This could be used for real-time analytics
	// For now, we'll just log the quote creation
	return nil
}