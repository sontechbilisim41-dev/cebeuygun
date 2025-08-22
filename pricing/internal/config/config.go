package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/shopspring/decimal"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string
	
	// Business Configuration
	DefaultCurrency        string
	SmallBasketThreshold   decimal.Decimal
	SmallBasketFee         decimal.Decimal
	DefaultDeliveryFee     decimal.Decimal
	ExpressDeliveryFee     decimal.Decimal
	DefaultCommissionRate  decimal.Decimal
	
	// Feature Flags
	EnableDynamicPricing   bool
	EnableRegionalPricing  bool
	EnableCommissionTiers  bool
	EnableABTesting        bool
	
	// Performance Configuration
	CacheExpiry           time.Duration
	QuoteTimeout          time.Duration
	MaxConcurrentQuotes   int
	
	// External Services
	CatalogServiceURL     string
	PromotionServiceURL   string
	
	// Pricing Rules
	PriceCalculationRules PriceCalculationRules
}

type PriceCalculationRules struct {
	TaxRate                decimal.Decimal
	MinOrderAmount         decimal.Decimal
	MaxDiscountPercentage  decimal.Decimal
	CommissionCap          decimal.Decimal
	DeliveryFeeRanges      []DeliveryFeeRange
}

type DeliveryFeeRange struct {
	MinDistance decimal.Decimal
	MaxDistance decimal.Decimal
	Fee         decimal.Decimal
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	smallBasketThreshold, _ := decimal.NewFromString(getEnv("SMALL_BASKET_THRESHOLD", "50.00"))
	smallBasketFee, _ := decimal.NewFromString(getEnv("SMALL_BASKET_FEE", "5.00"))
	defaultDeliveryFee, _ := decimal.NewFromString(getEnv("DEFAULT_DELIVERY_FEE", "10.00"))
	expressDeliveryFee, _ := decimal.NewFromString(getEnv("EXPRESS_DELIVERY_FEE", "20.00"))
	defaultCommissionRate, _ := decimal.NewFromString(getEnv("DEFAULT_COMMISSION_RATE", "15.00"))
	taxRate, _ := decimal.NewFromString(getEnv("TAX_RATE", "18.00"))
	minOrderAmount, _ := decimal.NewFromString(getEnv("MIN_ORDER_AMOUNT", "20.00"))
	maxDiscountPercentage, _ := decimal.NewFromString(getEnv("MAX_DISCOUNT_PERCENTAGE", "50.00"))
	commissionCap, _ := decimal.NewFromString(getEnv("COMMISSION_CAP", "100.00"))
	
	cacheExpiry, _ := time.ParseDuration(getEnv("CACHE_EXPIRY", "5m"))
	quoteTimeout, _ := time.ParseDuration(getEnv("QUOTE_TIMEOUT", "2s"))
	maxConcurrentQuotes, _ := strconv.Atoi(getEnv("MAX_CONCURRENT_QUOTES", "1000"))
	
	enableDynamicPricing, _ := strconv.ParseBool(getEnv("ENABLE_DYNAMIC_PRICING", "true"))
	enableRegionalPricing, _ := strconv.ParseBool(getEnv("ENABLE_REGIONAL_PRICING", "true"))
	enableCommissionTiers, _ := strconv.ParseBool(getEnv("ENABLE_COMMISSION_TIERS", "true"))
	enableABTesting, _ := strconv.ParseBool(getEnv("ENABLE_AB_TESTING", "false"))

	return &Config{
		Port:        getEnv("PRICING_SERVICE_PORT", "8010"),
		Environment: getEnv("GO_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		
		DefaultCurrency:       getEnv("DEFAULT_CURRENCY", "TRY"),
		SmallBasketThreshold:  smallBasketThreshold,
		SmallBasketFee:        smallBasketFee,
		DefaultDeliveryFee:    defaultDeliveryFee,
		ExpressDeliveryFee:    expressDeliveryFee,
		DefaultCommissionRate: defaultCommissionRate,
		
		EnableDynamicPricing:  enableDynamicPricing,
		EnableRegionalPricing: enableRegionalPricing,
		EnableCommissionTiers: enableCommissionTiers,
		EnableABTesting:       enableABTesting,
		
		CacheExpiry:         cacheExpiry,
		QuoteTimeout:        quoteTimeout,
		MaxConcurrentQuotes: maxConcurrentQuotes,
		
		CatalogServiceURL:   getEnv("CATALOG_SERVICE_URL", "http://localhost:8002"),
		PromotionServiceURL: getEnv("PROMOTION_SERVICE_URL", "http://localhost:8007"),
		
		PriceCalculationRules: PriceCalculationRules{
			TaxRate:               taxRate,
			MinOrderAmount:        minOrderAmount,
			MaxDiscountPercentage: maxDiscountPercentage,
			CommissionCap:         commissionCap,
			DeliveryFeeRanges: []DeliveryFeeRange{
				{MinDistance: decimal.Zero, MaxDistance: decimal.NewFromFloat(5.0), Fee: decimal.NewFromFloat(8.00)},
				{MinDistance: decimal.NewFromFloat(5.0), MaxDistance: decimal.NewFromFloat(15.0), Fee: defaultDeliveryFee},
				{MinDistance: decimal.NewFromFloat(15.0), MaxDistance: decimal.NewFromFloat(30.0), Fee: decimal.NewFromFloat(15.00)},
				{MinDistance: decimal.NewFromFloat(30.0), MaxDistance: decimal.NewFromFloat(50.0), Fee: decimal.NewFromFloat(25.00)},
			},
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}