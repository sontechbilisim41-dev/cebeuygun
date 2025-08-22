package models

import (
	"time"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Commission Rate Types
type CommissionType string

const (
	CommissionTypePercentage CommissionType = "PERCENTAGE"
	CommissionTypeFlat       CommissionType = "FLAT"
	CommissionTypeTiered     CommissionType = "TIERED"
)

// Pricing Rule Types
type PricingRuleType string

const (
	PricingRuleDeliveryFee    PricingRuleType = "DELIVERY_FEE"
	PricingRuleSmallBasket    PricingRuleType = "SMALL_BASKET"
	PricingRuleCommission     PricingRuleType = "COMMISSION"
	PricingRuleRegionalFee    PricingRuleType = "REGIONAL_FEE"
	PricingRuleExpressFee     PricingRuleType = "EXPRESS_FEE"
)

// Feature Flag Types
type FeatureFlagType string

const (
	FeatureFlagBoolean    FeatureFlagType = "BOOLEAN"
	FeatureFlagString     FeatureFlagType = "STRING"
	FeatureFlagNumber     FeatureFlagType = "NUMBER"
	FeatureFlagPercentage FeatureFlagType = "PERCENTAGE"
)

// Commission Rate represents commission configuration
type CommissionRate struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	CategoryID       *uuid.UUID      `json:"category_id,omitempty" db:"category_id"`
	SellerID         *uuid.UUID      `json:"seller_id,omitempty" db:"seller_id"`
	LogisticsProvider *string        `json:"logistics_provider,omitempty" db:"logistics_provider"`
	CommissionType   CommissionType  `json:"commission_type" db:"commission_type"`
	Rate             decimal.Decimal `json:"rate" db:"rate"`
	MinAmount        *decimal.Decimal `json:"min_amount,omitempty" db:"min_amount"`
	MaxAmount        *decimal.Decimal `json:"max_amount,omitempty" db:"max_amount"`
	Currency         string          `json:"currency" db:"currency"`
	Region           *string         `json:"region,omitempty" db:"region"`
	EffectiveFrom    time.Time       `json:"effective_from" db:"effective_from"`
	EffectiveTo      *time.Time      `json:"effective_to,omitempty" db:"effective_to"`
	IsActive         bool            `json:"is_active" db:"is_active"`
	Priority         int             `json:"priority" db:"priority"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at" db:"updated_at"`
}

// PricingRule represents versioned pricing rules
type PricingRule struct {
	ID            uuid.UUID       `json:"id" db:"id"`
	Name          string          `json:"name" db:"name"`
	Type          PricingRuleType `json:"type" db:"type"`
	Configuration map[string]interface{} `json:"configuration" db:"configuration"`
	Region        *string         `json:"region,omitempty" db:"region"`
	EffectiveFrom time.Time       `json:"effective_from" db:"effective_from"`
	EffectiveTo   *time.Time      `json:"effective_to,omitempty" db:"effective_to"`
	IsActive      bool            `json:"is_active" db:"is_active"`
	Version       int             `json:"version" db:"version"`
	CreatedBy     uuid.UUID       `json:"created_by" db:"created_by"`
	CreatedAt     time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at" db:"updated_at"`
}

// FeatureFlag represents feature flag configuration
type FeatureFlag struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	Key         string          `json:"key" db:"key"`
	Name        string          `json:"name" db:"name"`
	Description string          `json:"description" db:"description"`
	Type        FeatureFlagType `json:"type" db:"type"`
	Value       interface{}     `json:"value" db:"value"`
	IsEnabled   bool            `json:"is_enabled" db:"is_enabled"`
	Rollout     *RolloutConfig  `json:"rollout,omitempty" db:"rollout"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

// RolloutConfig represents gradual rollout configuration
type RolloutConfig struct {
	Percentage    decimal.Decimal `json:"percentage"`
	UserSegments  []string        `json:"user_segments,omitempty"`
	Regions       []string        `json:"regions,omitempty"`
	StartDate     *time.Time      `json:"start_date,omitempty"`
	EndDate       *time.Time      `json:"end_date,omitempty"`
}

// Quote Request/Response Models
type QuoteRequest struct {
	CustomerID       uuid.UUID     `json:"customer_id" validate:"required"`
	SellerID         uuid.UUID     `json:"seller_id" validate:"required"`
	Items            []QuoteItem   `json:"items" validate:"required,min=1"`
	DeliveryAddress  Address       `json:"delivery_address" validate:"required"`
	PickupAddress    *Address      `json:"pickup_address,omitempty"`
	IsExpressDelivery bool         `json:"is_express_delivery"`
	CouponCodes      []string      `json:"coupon_codes,omitempty"`
	Currency         string        `json:"currency" validate:"required,len=3"`
	Context          QuoteContext  `json:"context,omitempty"`
}

type QuoteItem struct {
	ProductID    uuid.UUID       `json:"product_id" validate:"required"`
	VariantID    *uuid.UUID      `json:"variant_id,omitempty"`
	Quantity     int             `json:"quantity" validate:"required,min=1"`
	UnitPrice    decimal.Decimal `json:"unit_price" validate:"required,gt=0"`
	CategoryID   uuid.UUID       `json:"category_id" validate:"required"`
	Tags         []string        `json:"tags,omitempty"`
	Weight       *decimal.Decimal `json:"weight,omitempty"`
	Dimensions   *string         `json:"dimensions,omitempty"`
}

type Address struct {
	Street     string          `json:"street" validate:"required"`
	City       string          `json:"city" validate:"required"`
	District   string          `json:"district" validate:"required"`
	PostalCode *string         `json:"postal_code,omitempty"`
	Country    string          `json:"country" validate:"required"`
	Latitude   decimal.Decimal `json:"latitude" validate:"required"`
	Longitude  decimal.Decimal `json:"longitude" validate:"required"`
}

type QuoteContext struct {
	UserAgent    string    `json:"user_agent,omitempty"`
	IPAddress    string    `json:"ip_address,omitempty"`
	SessionID    string    `json:"session_id,omitempty"`
	ABTestGroup  string    `json:"ab_test_group,omitempty"`
	RequestTime  time.Time `json:"request_time"`
}

type QuoteResponse struct {
	Success      bool            `json:"success"`
	Message      string          `json:"message"`
	Data         *QuoteData      `json:"data,omitempty"`
	Error        string          `json:"error,omitempty"`
	ProcessingTime int64         `json:"processing_time_ms"`
}

type QuoteData struct {
	QuoteID          uuid.UUID       `json:"quote_id"`
	Subtotal         decimal.Decimal `json:"subtotal"`
	TaxAmount        decimal.Decimal `json:"tax_amount"`
	DeliveryFee      decimal.Decimal `json:"delivery_fee"`
	SmallBasketFee   decimal.Decimal `json:"small_basket_fee"`
	TotalAmount      decimal.Decimal `json:"total_amount"`
	Currency         string          `json:"currency"`
	CommissionBreakdown CommissionBreakdown `json:"commission_breakdown"`
	PricingBreakdown PricingBreakdown `json:"pricing_breakdown"`
	AppliedRules     []AppliedRule   `json:"applied_rules"`
	ValidUntil       time.Time       `json:"valid_until"`
	FeatureFlags     map[string]interface{} `json:"feature_flags,omitempty"`
}

type CommissionBreakdown struct {
	TotalCommission   decimal.Decimal `json:"total_commission"`
	SellerCommission  decimal.Decimal `json:"seller_commission"`
	CategoryCommission decimal.Decimal `json:"category_commission"`
	LogisticsCommission decimal.Decimal `json:"logistics_commission"`
	Currency          string          `json:"currency"`
	Details           []CommissionDetail `json:"details"`
}

type CommissionDetail struct {
	Type        string          `json:"type"`
	Rate        decimal.Decimal `json:"rate"`
	Amount      decimal.Decimal `json:"amount"`
	AppliedTo   string          `json:"applied_to"`
	Description string          `json:"description"`
}

type PricingBreakdown struct {
	ItemTotal       decimal.Decimal `json:"item_total"`
	Subtotal        decimal.Decimal `json:"subtotal"`
	TaxAmount       decimal.Decimal `json:"tax_amount"`
	DeliveryFee     decimal.Decimal `json:"delivery_fee"`
	SmallBasketFee  decimal.Decimal `json:"small_basket_fee"`
	Discounts       decimal.Decimal `json:"discounts"`
	TotalAmount     decimal.Decimal `json:"total_amount"`
	Currency        string          `json:"currency"`
	Calculations    []CalculationStep `json:"calculations"`
}

type CalculationStep struct {
	Step        string          `json:"step"`
	Description string          `json:"description"`
	Amount      decimal.Decimal `json:"amount"`
	RunningTotal decimal.Decimal `json:"running_total"`
}

type AppliedRule struct {
	RuleID      uuid.UUID `json:"rule_id"`
	RuleName    string    `json:"rule_name"`
	RuleType    string    `json:"rule_type"`
	Amount      decimal.Decimal `json:"amount"`
	Description string    `json:"description"`
}

// Commission Configuration DTOs
type CreateCommissionRateRequest struct {
	CategoryID        *uuid.UUID      `json:"category_id,omitempty"`
	SellerID          *uuid.UUID      `json:"seller_id,omitempty"`
	LogisticsProvider *string         `json:"logistics_provider,omitempty"`
	CommissionType    CommissionType  `json:"commission_type" validate:"required"`
	Rate              decimal.Decimal `json:"rate" validate:"required,gt=0"`
	MinAmount         *decimal.Decimal `json:"min_amount,omitempty"`
	MaxAmount         *decimal.Decimal `json:"max_amount,omitempty"`
	Currency          string          `json:"currency" validate:"required,len=3"`
	Region            *string         `json:"region,omitempty"`
	EffectiveFrom     time.Time       `json:"effective_from" validate:"required"`
	EffectiveTo       *time.Time      `json:"effective_to,omitempty"`
	Priority          int             `json:"priority" validate:"min=1,max=1000"`
}

type UpdateCommissionRateRequest struct {
	Rate          *decimal.Decimal `json:"rate,omitempty" validate:"omitempty,gt=0"`
	MinAmount     *decimal.Decimal `json:"min_amount,omitempty"`
	MaxAmount     *decimal.Decimal `json:"max_amount,omitempty"`
	Region        *string          `json:"region,omitempty"`
	EffectiveFrom *time.Time       `json:"effective_from,omitempty"`
	EffectiveTo   *time.Time       `json:"effective_to,omitempty"`
	IsActive      *bool            `json:"is_active,omitempty"`
	Priority      *int             `json:"priority,omitempty" validate:"omitempty,min=1,max=1000"`
}

// Pricing Rule DTOs
type CreatePricingRuleRequest struct {
	Name          string                 `json:"name" validate:"required,min=3,max=100"`
	Type          PricingRuleType        `json:"type" validate:"required"`
	Configuration map[string]interface{} `json:"configuration" validate:"required"`
	Region        *string                `json:"region,omitempty"`
	EffectiveFrom time.Time              `json:"effective_from" validate:"required"`
	EffectiveTo   *time.Time             `json:"effective_to,omitempty"`
}

type UpdatePricingRuleRequest struct {
	Name          *string                `json:"name,omitempty" validate:"omitempty,min=3,max=100"`
	Configuration map[string]interface{} `json:"configuration,omitempty"`
	Region        *string                `json:"region,omitempty"`
	EffectiveFrom *time.Time             `json:"effective_from,omitempty"`
	EffectiveTo   *time.Time             `json:"effective_to,omitempty"`
	IsActive      *bool                  `json:"is_active,omitempty"`
}

// Feature Flag DTOs
type CreateFeatureFlagRequest struct {
	Key         string          `json:"key" validate:"required,min=3,max=50"`
	Name        string          `json:"name" validate:"required,min=3,max=100"`
	Description string          `json:"description" validate:"max=500"`
	Type        FeatureFlagType `json:"type" validate:"required"`
	Value       interface{}     `json:"value" validate:"required"`
	IsEnabled   bool            `json:"is_enabled"`
	Rollout     *RolloutConfig  `json:"rollout,omitempty"`
}

type UpdateFeatureFlagRequest struct {
	Name        *string         `json:"name,omitempty" validate:"omitempty,min=3,max=100"`
	Description *string         `json:"description,omitempty" validate:"omitempty,max=500"`
	Value       interface{}     `json:"value,omitempty"`
	IsEnabled   *bool           `json:"is_enabled,omitempty"`
	Rollout     *RolloutConfig  `json:"rollout,omitempty"`
}

// Bulk Operations
type BulkCommissionUpdateRequest struct {
	CategoryIDs   []uuid.UUID     `json:"category_ids,omitempty"`
	SellerIDs     []uuid.UUID     `json:"seller_ids,omitempty"`
	Rate          decimal.Decimal `json:"rate" validate:"required,gt=0"`
	EffectiveFrom time.Time       `json:"effective_from" validate:"required"`
	EffectiveTo   *time.Time      `json:"effective_to,omitempty"`
}

type BulkCommissionUpdateResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	UpdatedCount  int    `json:"updated_count"`
	FailedCount   int    `json:"failed_count"`
	Errors        []BulkUpdateError `json:"errors,omitempty"`
}

type BulkUpdateError struct {
	ID      uuid.UUID `json:"id"`
	Error   string    `json:"error"`
	Details string    `json:"details"`
}

// Analytics and Reporting
type CommissionAnalytics struct {
	Period           string          `json:"period"`
	TotalCommission  decimal.Decimal `json:"total_commission"`
	SellerCommission decimal.Decimal `json:"seller_commission"`
	CategoryBreakdown map[string]decimal.Decimal `json:"category_breakdown"`
	RegionBreakdown  map[string]decimal.Decimal `json:"region_breakdown"`
	AverageRate      decimal.Decimal `json:"average_rate"`
	TransactionCount int             `json:"transaction_count"`
}

type PricingAnalytics struct {
	Period              string          `json:"period"`
	TotalQuotes         int             `json:"total_quotes"`
	AverageQuoteValue   decimal.Decimal `json:"average_quote_value"`
	DeliveryFeeTotal    decimal.Decimal `json:"delivery_fee_total"`
	SmallBasketFeeTotal decimal.Decimal `json:"small_basket_fee_total"`
	RegionalBreakdown   map[string]PricingRegionStats `json:"regional_breakdown"`
}

type PricingRegionStats struct {
	QuoteCount        int             `json:"quote_count"`
	AverageValue      decimal.Decimal `json:"average_value"`
	AverageDeliveryFee decimal.Decimal `json:"average_delivery_fee"`
}

// API Response Types
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data,omitempty"`
	Pagination Pagination `json:"pagination"`
	Error      string      `json:"error,omitempty"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// Validation methods
func (ct CommissionType) IsValid() bool {
	switch ct {
	case CommissionTypePercentage, CommissionTypeFlat, CommissionTypeTiered:
		return true
	default:
		return false
	}
}

func (prt PricingRuleType) IsValid() bool {
	switch prt {
	case PricingRuleDeliveryFee, PricingRuleSmallBasket, PricingRuleCommission, 
		 PricingRuleRegionalFee, PricingRuleExpressFee:
		return true
	default:
		return false
	}
}

func (fft FeatureFlagType) IsValid() bool {
	switch fft {
	case FeatureFlagBoolean, FeatureFlagString, FeatureFlagNumber, FeatureFlagPercentage:
		return true
	default:
		return false
	}
}

// Business logic methods
func (cr *CommissionRate) IsEffective(date time.Time) bool {
	if date.Before(cr.EffectiveFrom) {
		return false
	}
	if cr.EffectiveTo != nil && date.After(*cr.EffectiveTo) {
		return false
	}
	return cr.IsActive
}

func (pr *PricingRule) IsEffective(date time.Time) bool {
	if date.Before(pr.EffectiveFrom) {
		return false
	}
	if pr.EffectiveTo != nil && date.After(*pr.EffectiveTo) {
		return false
	}
	return pr.IsActive
}

func (a *Address) DistanceTo(other *Address) decimal.Decimal {
	// Haversine formula implementation
	lat1 := a.Latitude.InexactFloat64()
	lon1 := a.Longitude.InexactFloat64()
	lat2 := other.Latitude.InexactFloat64()
	lon2 := other.Longitude.InexactFloat64()
	
	const earthRadiusKm = 6371.0
	
	// Convert to radians
	lat1Rad := lat1 * (3.14159265359 / 180)
	lon1Rad := lon1 * (3.14159265359 / 180)
	lat2Rad := lat2 * (3.14159265359 / 180)
	lon2Rad := lon2 * (3.14159265359 / 180)
	
	// Calculate differences
	dLat := lat2Rad - lat1Rad
	dLon := lon2Rad - lon1Rad
	
	// Haversine formula
	a := 0.5 - 0.5*cos(dLat) + cos(lat1Rad)*cos(lat2Rad)*(1-cos(dLon))/2
	distance := earthRadiusKm * 2 * asin(sqrt(a))
	
	return decimal.NewFromFloat(distance)
}

// Helper functions for calculations
func cos(x float64) float64 {
	// Simple cosine approximation for demo
	return 1.0 - (x*x)/2.0 + (x*x*x*x)/24.0
}

func sin(x float64) float64 {
	// Simple sine approximation for demo
	return x - (x*x*x)/6.0 + (x*x*x*x*x)/120.0
}

func asin(x float64) float64 {
	// Simple arcsine approximation for demo
	return x + (x*x*x)/6.0 + (3*x*x*x*x*x)/40.0
}

func sqrt(x float64) float64 {
	// Simple square root approximation for demo
	if x == 0 {
		return 0
	}
	z := x
	for i := 0; i < 10; i++ {
		z = (z + x/z) / 2
	}
	return z
}