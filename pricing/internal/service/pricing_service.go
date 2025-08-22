package service

import (
	"context"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/cebeuygun/platform/services/pricing/internal/config"
	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/cebeuygun/platform/services/pricing/internal/repository"
	"github.com/google/uuid"
	"github.com/patrickmn/go-cache"
	"github.com/redis/go-redis/v9"
	"github.com/shopspring/decimal"
	"golang.org/x/sync/semaphore"
)

type PricingService interface {
	// Quote Operations
	CalculateQuote(request *models.QuoteRequest) (*models.QuoteResponse, error)
	GetQuoteByID(id uuid.UUID) (*models.QuoteData, error)
	
	// Pricing Rules
	CreatePricingRule(request *models.CreatePricingRuleRequest) (*models.PricingRule, error)
	GetPricingRule(id uuid.UUID) (*models.PricingRule, error)
	UpdatePricingRule(id uuid.UUID, request *models.UpdatePricingRuleRequest) error
	DeletePricingRule(id uuid.UUID) error
	GetPricingRuleVersions(name string) ([]*models.PricingRule, error)
	
	// Commission Rates
	CreateCommissionRate(request *models.CreateCommissionRateRequest) (*models.CommissionRate, error)
	GetCommissionRate(id uuid.UUID) (*models.CommissionRate, error)
	UpdateCommissionRate(id uuid.UUID, request *models.UpdateCommissionRateRequest) error
	DeleteCommissionRate(id uuid.UUID) error
	BulkUpdateCommissionRates(request *models.BulkCommissionUpdateRequest) (*models.BulkCommissionUpdateResponse, error)
	
	// Feature Flags
	CreateFeatureFlag(request *models.CreateFeatureFlagRequest) (*models.FeatureFlag, error)
	GetFeatureFlag(id uuid.UUID) (*models.FeatureFlag, error)
	GetFeatureFlagByKey(key string) (*models.FeatureFlag, error)
	UpdateFeatureFlag(id uuid.UUID, request *models.UpdateFeatureFlagRequest) error
	DeleteFeatureFlag(id uuid.UUID) error
	EvaluateFeatureFlag(key string, context map[string]interface{}) (interface{}, error)
	
	// Analytics
	GetPricingAnalytics(startDate, endDate time.Time, region *string) (*models.PricingAnalytics, error)
	GetCommissionAnalytics(startDate, endDate time.Time, categoryID *uuid.UUID, sellerID *uuid.UUID, region *string) (*models.CommissionAnalytics, error)
}

type pricingService struct {
	pricingRepo     repository.PricingRepository
	commissionRepo  repository.CommissionRepository
	featureFlagRepo repository.FeatureFlagRepository
	redisClient     *redis.Client
	config          *config.Config
	
	// Performance optimizations
	localCache      *cache.Cache
	quoteSemaphore  *semaphore.Weighted
	
	// Feature flag cache
	flagCache       map[string]*models.FeatureFlag
	flagCacheMutex  sync.RWMutex
	flagCacheExpiry time.Time
}

func NewPricingService(
	pricingRepo repository.PricingRepository,
	commissionRepo repository.CommissionRepository,
	featureFlagRepo repository.FeatureFlagRepository,
	redisClient *redis.Client,
	cfg *config.Config,
) (PricingService, error) {
	// Initialize local cache for frequently accessed data
	localCache := cache.New(cfg.CacheExpiry, cfg.CacheExpiry*2)
	
	// Initialize semaphore for concurrency control
	quoteSemaphore := semaphore.NewWeighted(int64(cfg.MaxConcurrentQuotes))

	service := &pricingService{
		pricingRepo:     pricingRepo,
		commissionRepo:  commissionRepo,
		featureFlagRepo: featureFlagRepo,
		redisClient:     redisClient,
		config:          cfg,
		localCache:      localCache,
		quoteSemaphore:  quoteSemaphore,
		flagCache:       make(map[string]*models.FeatureFlag),
	}

	// Start background tasks
	go service.startCacheRefreshWorker()
	go service.startQuoteCleanupWorker()

	return service, nil
}

func (s *pricingService) CalculateQuote(request *models.QuoteRequest) (*models.QuoteResponse, error) {
	startTime := time.Now()
	
	// Acquire semaphore for concurrency control
	ctx, cancel := context.WithTimeout(context.Background(), s.config.QuoteTimeout)
	defer cancel()
	
	if err := s.quoteSemaphore.Acquire(ctx, 1); err != nil {
		return &models.QuoteResponse{
			Success:        false,
			Message:        "Service overloaded, please try again",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}
	defer s.quoteSemaphore.Release(1)

	log.Printf("Calculating quote for customer %s, seller %s", request.CustomerID, request.SellerID)

	// Generate quote hash for caching
	quoteHash := s.generateQuoteHash(request)
	
	// Check cache first
	if cachedQuote := s.getCachedQuote(quoteHash); cachedQuote != nil {
		log.Printf("Returning cached quote for hash %s", quoteHash)
		return &models.QuoteResponse{
			Success:        true,
			Message:        "Quote calculated successfully (cached)",
			Data:           cachedQuote,
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}

	// Calculate pricing components
	quote, err := s.calculatePricingComponents(request)
	if err != nil {
		return &models.QuoteResponse{
			Success:        false,
			Message:        "Failed to calculate quote",
			Error:          err.Error(),
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, err
	}

	// Cache the quote
	s.cacheQuote(quoteHash, quote)

	// Store quote in database for analytics
	go func() {
		if err := s.pricingRepo.CreateQuote(&models.PricingQuote{
			ID:                  quote.QuoteID,
			CustomerID:          request.CustomerID,
			SellerID:            request.SellerID,
			QuoteHash:           quoteHash,
			Subtotal:            quote.Subtotal,
			TaxAmount:           quote.TaxAmount,
			DeliveryFee:         quote.DeliveryFee,
			SmallBasketFee:      quote.SmallBasketFee,
			TotalAmount:         quote.TotalAmount,
			Currency:            quote.Currency,
			CommissionBreakdown: quote.CommissionBreakdown,
			PricingBreakdown:    quote.PricingBreakdown,
			AppliedRules:        quote.AppliedRules,
			FeatureFlags:        quote.FeatureFlags,
			Region:              &request.DeliveryAddress.City,
			ValidUntil:          quote.ValidUntil,
		}); err != nil {
			log.Printf("Failed to store quote: %v", err)
		}
	}()

	return &models.QuoteResponse{
		Success:        true,
		Message:        "Quote calculated successfully",
		Data:           quote,
		ProcessingTime: time.Since(startTime).Milliseconds(),
	}, nil
}

func (s *pricingService) calculatePricingComponents(request *models.QuoteRequest) (*models.QuoteData, error) {
	now := time.Now()
	
	// Initialize quote data
	quote := &models.QuoteData{
		QuoteID:             uuid.New(),
		Currency:            request.Currency,
		ValidUntil:          now.Add(15 * time.Minute), // 15 minutes validity
		CommissionBreakdown: models.CommissionBreakdown{Currency: request.Currency},
		PricingBreakdown:    models.PricingBreakdown{Currency: request.Currency},
		FeatureFlags:        make(map[string]interface{}),
	}

	var calculations []models.CalculationStep
	runningTotal := decimal.Zero

	// Step 1: Calculate item total
	itemTotal := decimal.Zero
	for _, item := range request.Items {
		itemAmount := item.UnitPrice.Mul(decimal.NewFromInt(int64(item.Quantity)))
		itemTotal = itemTotal.Add(itemAmount)
	}
	
	calculations = append(calculations, models.CalculationStep{
		Step:         "item_total",
		Description:  "Sum of all item prices",
		Amount:       itemTotal,
		RunningTotal: itemTotal,
	})
	runningTotal = itemTotal
	quote.Subtotal = itemTotal
	quote.PricingBreakdown.ItemTotal = itemTotal
	quote.PricingBreakdown.Subtotal = itemTotal

	// Step 2: Calculate tax
	taxAmount := itemTotal.Mul(s.config.PriceCalculationRules.TaxRate).Div(decimal.NewFromInt(100))
	calculations = append(calculations, models.CalculationStep{
		Step:         "tax_calculation",
		Description:  fmt.Sprintf("Tax at %.2f%%", s.config.PriceCalculationRules.TaxRate),
		Amount:       taxAmount,
		RunningTotal: runningTotal.Add(taxAmount),
	})
	runningTotal = runningTotal.Add(taxAmount)
	quote.TaxAmount = taxAmount
	quote.PricingBreakdown.TaxAmount = taxAmount

	// Step 3: Calculate delivery fee
	deliveryFee, err := s.calculateDeliveryFee(request)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate delivery fee: %w", err)
	}
	
	calculations = append(calculations, models.CalculationStep{
		Step:         "delivery_fee",
		Description:  "Delivery fee based on distance and type",
		Amount:       deliveryFee,
		RunningTotal: runningTotal.Add(deliveryFee),
	})
	runningTotal = runningTotal.Add(deliveryFee)
	quote.DeliveryFee = deliveryFee
	quote.PricingBreakdown.DeliveryFee = deliveryFee

	// Step 4: Calculate small basket fee
	smallBasketFee := decimal.Zero
	if itemTotal.LessThan(s.config.SmallBasketThreshold) {
		smallBasketFee = s.config.SmallBasketFee
		calculations = append(calculations, models.CalculationStep{
			Step:         "small_basket_fee",
			Description:  fmt.Sprintf("Small basket fee (under %.2f %s)", s.config.SmallBasketThreshold, request.Currency),
			Amount:       smallBasketFee,
			RunningTotal: runningTotal.Add(smallBasketFee),
		})
		runningTotal = runningTotal.Add(smallBasketFee)
	}
	quote.SmallBasketFee = smallBasketFee
	quote.PricingBreakdown.SmallBasketFee = smallBasketFee

	// Step 5: Calculate commission
	commissionBreakdown, err := s.calculateCommission(request, itemTotal)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate commission: %w", err)
	}
	quote.CommissionBreakdown = *commissionBreakdown

	// Step 6: Final total
	quote.TotalAmount = runningTotal
	quote.PricingBreakdown.TotalAmount = runningTotal
	quote.PricingBreakdown.Calculations = calculations

	// Load feature flags
	s.loadFeatureFlags(quote, request)

	// Load applied rules
	s.loadAppliedRules(quote, request)

	return quote, nil
}

func (s *pricingService) calculateDeliveryFee(request *models.QuoteRequest) (decimal.Decimal, error) {
	// Get delivery fee rules
	deliveryRules, err := s.pricingRepo.GetActivePricingRules(
		func() *models.PricingRuleType { t := models.PricingRuleDeliveryFee; return &t }(),
		&request.DeliveryAddress.City,
		time.Now(),
	)
	if err != nil {
		return decimal.Zero, err
	}

	baseFee := s.config.DefaultDeliveryFee
	
	// Apply delivery fee rules
	for _, rule := range deliveryRules {
		if config, ok := rule.Configuration["base_fee"].(float64); ok {
			baseFee = decimal.NewFromFloat(config)
		}
	}

	// Apply express delivery multiplier
	if request.IsExpressDelivery {
		if s.config.EnableDynamicPricing {
			multiplier, err := s.EvaluateFeatureFlag("express_delivery_multiplier", map[string]interface{}{
				"region": request.DeliveryAddress.City,
			})
			if err == nil {
				if mult, ok := multiplier.(float64); ok {
					baseFee = baseFee.Mul(decimal.NewFromFloat(mult))
				}
			}
		} else {
			baseFee = s.config.ExpressDeliveryFee
		}
	}

	// Calculate distance-based fee (if pickup address provided)
	if request.PickupAddress != nil {
		distance := request.PickupAddress.DistanceTo(&request.DeliveryAddress)
		
		// Apply distance-based pricing
		for _, feeRange := range s.config.PriceCalculationRules.DeliveryFeeRanges {
			if distance.GreaterThanOrEqual(feeRange.MinDistance) && 
			   (feeRange.MaxDistance.IsZero() || distance.LessThan(feeRange.MaxDistance)) {
				baseFee = feeRange.Fee
				break
			}
		}
	}

	return baseFee, nil
}

func (s *pricingService) calculateCommission(request *models.QuoteRequest, itemTotal decimal.Decimal) (*models.CommissionBreakdown, error) {
	breakdown := &models.CommissionBreakdown{
		Currency: request.Currency,
		Details:  []models.CommissionDetail{},
	}

	totalCommission := decimal.Zero
	
	// Get applicable commission rates for each item
	for _, item := range request.Items {
		rates, err := s.commissionRepo.GetApplicableCommissionRates(
			&item.CategoryID,
			&request.SellerID,
			nil, // logistics provider
			&request.DeliveryAddress.City,
			time.Now(),
		)
		if err != nil {
			return nil, err
		}

		// Apply the highest priority rate
		if len(rates) > 0 {
			rate := rates[0] // Already sorted by priority
			itemAmount := item.UnitPrice.Mul(decimal.NewFromInt(int64(item.Quantity)))
			
			var commissionAmount decimal.Decimal
			switch rate.CommissionType {
			case models.CommissionTypePercentage:
				commissionAmount = itemAmount.Mul(rate.Rate).Div(decimal.NewFromInt(100))
			case models.CommissionTypeFlat:
				commissionAmount = rate.Rate.Mul(decimal.NewFromInt(int64(item.Quantity)))
			case models.CommissionTypeTiered:
				// Implement tiered commission logic
				commissionAmount = s.calculateTieredCommission(itemAmount, rate)
			}

			// Apply min/max limits
			if rate.MinAmount != nil && commissionAmount.LessThan(*rate.MinAmount) {
				commissionAmount = *rate.MinAmount
			}
			if rate.MaxAmount != nil && commissionAmount.GreaterThan(*rate.MaxAmount) {
				commissionAmount = *rate.MaxAmount
			}

			totalCommission = totalCommission.Add(commissionAmount)
			
			breakdown.Details = append(breakdown.Details, models.CommissionDetail{
				Type:        string(rate.CommissionType),
				Rate:        rate.Rate,
				Amount:      commissionAmount,
				AppliedTo:   fmt.Sprintf("Product %s", item.ProductID),
				Description: fmt.Sprintf("Commission for category/seller"),
			})
		}
	}

	breakdown.TotalCommission = totalCommission
	breakdown.SellerCommission = totalCommission.Mul(decimal.NewFromFloat(0.85)) // 85% to seller
	breakdown.CategoryCommission = totalCommission.Mul(decimal.NewFromFloat(0.10)) // 10% category
	breakdown.LogisticsCommission = totalCommission.Mul(decimal.NewFromFloat(0.05)) // 5% logistics

	return breakdown, nil
}

func (s *pricingService) calculateTieredCommission(amount decimal.Decimal, rate *models.CommissionRate) decimal.Decimal {
	// Simplified tiered commission calculation
	// In real implementation, this would have multiple tiers
	baseRate := rate.Rate
	
	if amount.GreaterThan(decimal.NewFromFloat(1000)) {
		baseRate = baseRate.Mul(decimal.NewFromFloat(1.2)) // 20% bonus for large orders
	}
	
	return amount.Mul(baseRate).Div(decimal.NewFromInt(100))
}

func (s *pricingService) generateQuoteHash(request *models.QuoteRequest) string {
	// Create a hash of the request for caching
	hashData := struct {
		CustomerID        uuid.UUID `json:"customer_id"`
		SellerID          uuid.UUID `json:"seller_id"`
		Items             []models.QuoteItem `json:"items"`
		DeliveryCity      string `json:"delivery_city"`
		IsExpressDelivery bool `json:"is_express_delivery"`
		Currency          string `json:"currency"`
	}{
		CustomerID:        request.CustomerID,
		SellerID:          request.SellerID,
		Items:             request.Items,
		DeliveryCity:      request.DeliveryAddress.City,
		IsExpressDelivery: request.IsExpressDelivery,
		Currency:          request.Currency,
	}

	hashJSON, _ := json.Marshal(hashData)
	hash := md5.Sum(hashJSON)
	return fmt.Sprintf("%x", hash)
}

func (s *pricingService) getCachedQuote(hash string) *models.QuoteData {
	// Try local cache first
	if cached, found := s.localCache.Get(hash); found {
		if quote, ok := cached.(*models.QuoteData); ok {
			return quote
		}
	}

	// Try Redis cache
	ctx := context.Background()
	cached, err := s.redisClient.Get(ctx, fmt.Sprintf("quote:%s", hash)).Result()
	if err != nil {
		return nil
	}

	var quote models.QuoteData
	if err := json.Unmarshal([]byte(cached), &quote); err != nil {
		return nil
	}

	// Store in local cache for faster access
	s.localCache.Set(hash, &quote, s.config.CacheExpiry)
	
	return &quote
}

func (s *pricingService) cacheQuote(hash string, quote *models.QuoteData) {
	// Store in local cache
	s.localCache.Set(hash, quote, s.config.CacheExpiry)

	// Store in Redis for distributed caching
	go func() {
		ctx := context.Background()
		quoteJSON, err := json.Marshal(quote)
		if err != nil {
			return
		}
		
		s.redisClient.SetEx(ctx, fmt.Sprintf("quote:%s", hash), string(quoteJSON), s.config.CacheExpiry)
	}()
}

func (s *pricingService) loadFeatureFlags(quote *models.QuoteData, request *models.QuoteRequest) {
	context := map[string]interface{}{
		"user_id":      request.CustomerID.String(),
		"region":       request.DeliveryAddress.City,
		"user_segment": "regular", // This would come from customer service
	}

	// Load relevant feature flags
	flagKeys := []string{
		"dynamic_pricing",
		"regional_pricing", 
		"commission_tiers",
		"express_delivery_multiplier",
		"small_basket_threshold",
	}

	for _, key := range flagKeys {
		if value, err := s.EvaluateFeatureFlag(key, context); err == nil {
			quote.FeatureFlags[key] = value
		}
	}
}

func (s *pricingService) loadAppliedRules(quote *models.QuoteData, request *models.QuoteRequest) {
	// This would load the actual rules that were applied during calculation
	// For now, we'll add some sample applied rules
	quote.AppliedRules = []models.AppliedRule{
		{
			RuleID:      uuid.New(),
			RuleName:    "Standard Tax Rate",
			RuleType:    "TAX",
			Amount:      quote.TaxAmount,
			Description: fmt.Sprintf("%.2f%% tax applied", s.config.PriceCalculationRules.TaxRate),
		},
		{
			RuleID:      uuid.New(),
			RuleName:    "Delivery Fee",
			RuleType:    "DELIVERY",
			Amount:      quote.DeliveryFee,
			Description: "Standard delivery fee",
		},
	}

	if !quote.SmallBasketFee.IsZero() {
		quote.AppliedRules = append(quote.AppliedRules, models.AppliedRule{
			RuleID:      uuid.New(),
			RuleName:    "Small Basket Fee",
			RuleType:    "SMALL_BASKET",
			Amount:      quote.SmallBasketFee,
			Description: fmt.Sprintf("Small basket fee for orders under %.2f %s", s.config.SmallBasketThreshold, request.Currency),
		})
	}
}

// Background workers
func (s *pricingService) startCacheRefreshWorker() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.refreshFeatureFlagCache()
		}
	}
}

func (s *pricingService) startQuoteCleanupWorker() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := s.pricingRepo.CleanupExpiredQuotes(); err != nil {
				log.Printf("Failed to cleanup expired quotes: %v", err)
			}
		}
	}
}

func (s *pricingService) refreshFeatureFlagCache() {
	flags, err := s.featureFlagRepo.GetAllFeatureFlags(true)
	if err != nil {
		log.Printf("Failed to refresh feature flag cache: %v", err)
		return
	}

	s.flagCacheMutex.Lock()
	defer s.flagCacheMutex.Unlock()

	s.flagCache = make(map[string]*models.FeatureFlag)
	for _, flag := range flags {
		s.flagCache[flag.Key] = flag
	}
	s.flagCacheExpiry = time.Now().Add(5 * time.Minute)

	log.Printf("Refreshed feature flag cache with %d flags", len(flags))
}

// Pricing Rules
func (s *pricingService) CreatePricingRule(request *models.CreatePricingRuleRequest) (*models.PricingRule, error) {
	rule := &models.PricingRule{
		ID:            uuid.New(),
		Name:          request.Name,
		Type:          request.Type,
		Configuration: request.Configuration,
		Region:        request.Region,
		EffectiveFrom: request.EffectiveFrom,
		EffectiveTo:   request.EffectiveTo,
		IsActive:      true,
		Version:       1,
		CreatedBy:     uuid.New(), // This would come from auth context
	}

	err := s.pricingRepo.CreatePricingRule(rule)
	if err != nil {
		return nil, fmt.Errorf("failed to create pricing rule: %w", err)
	}

	return rule, nil
}

func (s *pricingService) GetPricingRule(id uuid.UUID) (*models.PricingRule, error) {
	return s.pricingRepo.GetPricingRuleByID(id)
}

func (s *pricingService) UpdatePricingRule(id uuid.UUID, request *models.UpdatePricingRuleRequest) error {
	return s.pricingRepo.UpdatePricingRule(id, request)
}

func (s *pricingService) DeletePricingRule(id uuid.UUID) error {
	return s.pricingRepo.DeletePricingRule(id)
}

func (s *pricingService) GetPricingRuleVersions(name string) ([]*models.PricingRule, error) {
	return s.pricingRepo.GetPricingRuleVersions(name)
}

// Commission Rates
func (s *pricingService) CreateCommissionRate(request *models.CreateCommissionRateRequest) (*models.CommissionRate, error) {
	rate := &models.CommissionRate{
		ID:                uuid.New(),
		CategoryID:        request.CategoryID,
		SellerID:          request.SellerID,
		LogisticsProvider: request.LogisticsProvider,
		CommissionType:    request.CommissionType,
		Rate:              request.Rate,
		MinAmount:         request.MinAmount,
		MaxAmount:         request.MaxAmount,
		Currency:          request.Currency,
		Region:            request.Region,
		EffectiveFrom:     request.EffectiveFrom,
		EffectiveTo:       request.EffectiveTo,
		IsActive:          true,
		Priority:          request.Priority,
	}

	err := s.commissionRepo.CreateCommissionRate(rate)
	if err != nil {
		return nil, fmt.Errorf("failed to create commission rate: %w", err)
	}

	return rate, nil
}

func (s *pricingService) GetCommissionRate(id uuid.UUID) (*models.CommissionRate, error) {
	return s.commissionRepo.GetCommissionRateByID(id)
}

func (s *pricingService) UpdateCommissionRate(id uuid.UUID, request *models.UpdateCommissionRateRequest) error {
	return s.commissionRepo.UpdateCommissionRate(id, request)
}

func (s *pricingService) DeleteCommissionRate(id uuid.UUID) error {
	return s.commissionRepo.DeleteCommissionRate(id)
}

func (s *pricingService) BulkUpdateCommissionRates(request *models.BulkCommissionUpdateRequest) (*models.BulkCommissionUpdateResponse, error) {
	return s.commissionRepo.BulkUpdateCommissionRates(request)
}

// Feature Flags
func (s *pricingService) CreateFeatureFlag(request *models.CreateFeatureFlagRequest) (*models.FeatureFlag, error) {
	flag := &models.FeatureFlag{
		ID:          uuid.New(),
		Key:         request.Key,
		Name:        request.Name,
		Description: request.Description,
		Type:        request.Type,
		Value:       request.Value,
		IsEnabled:   request.IsEnabled,
		Rollout:     request.Rollout,
	}

	err := s.featureFlagRepo.CreateFeatureFlag(flag)
	if err != nil {
		return nil, fmt.Errorf("failed to create feature flag: %w", err)
	}

	// Refresh cache
	s.refreshFeatureFlagCache()

	return flag, nil
}

func (s *pricingService) GetFeatureFlag(id uuid.UUID) (*models.FeatureFlag, error) {
	return s.featureFlagRepo.GetFeatureFlagByID(id)
}

func (s *pricingService) GetFeatureFlagByKey(key string) (*models.FeatureFlag, error) {
	// Check cache first
	s.flagCacheMutex.RLock()
	if time.Now().Before(s.flagCacheExpiry) {
		if flag, exists := s.flagCache[key]; exists {
			s.flagCacheMutex.RUnlock()
			return flag, nil
		}
	}
	s.flagCacheMutex.RUnlock()

	// Fallback to database
	return s.featureFlagRepo.GetFeatureFlagByKey(key)
}

func (s *pricingService) UpdateFeatureFlag(id uuid.UUID, request *models.UpdateFeatureFlagRequest) error {
	err := s.featureFlagRepo.UpdateFeatureFlag(id, request)
	if err != nil {
		return err
	}

	// Refresh cache
	s.refreshFeatureFlagCache()
	return nil
}

func (s *pricingService) DeleteFeatureFlag(id uuid.UUID) error {
	err := s.featureFlagRepo.DeleteFeatureFlag(id)
	if err != nil {
		return err
	}

	// Refresh cache
	s.refreshFeatureFlagCache()
	return nil
}

func (s *pricingService) EvaluateFeatureFlag(key string, context map[string]interface{}) (interface{}, error) {
	return s.featureFlagRepo.EvaluateFeatureFlag(key, context)
}

func (s *pricingService) GetQuoteByID(id uuid.UUID) (*models.QuoteData, error) {
	// This would typically retrieve from database
	// For now, return nil as quotes are accessed by hash
	return nil, fmt.Errorf("quote retrieval by ID not implemented")
}

// Analytics
func (s *pricingService) GetPricingAnalytics(startDate, endDate time.Time, region *string) (*models.PricingAnalytics, error) {
	return s.pricingRepo.GetPricingAnalytics(startDate, endDate, region)
}

func (s *pricingService) GetCommissionAnalytics(startDate, endDate time.Time, categoryID *uuid.UUID, sellerID *uuid.UUID, region *string) (*models.CommissionAnalytics, error) {
	return s.commissionRepo.GetCommissionAnalytics(startDate, endDate, categoryID, sellerID, region)
}