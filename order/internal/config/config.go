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
	
	// Kafka Configuration
	KafkaBrokers []string
	KafkaTopics  KafkaTopics
	
	// Business Rules
	MinOrderAmount    decimal.Decimal
	SmallCartFee      decimal.Decimal
	Currency          string
	TaxRate           decimal.Decimal
	DeliveryFee       decimal.Decimal
	ExpressDeliveryFee decimal.Decimal
	
	// External Services
	CatalogServiceURL   string
	PricingServiceURL   string
	PromotionServiceURL string
	PaymentServiceURL   string
	CourierServiceURL   string
	
	// Outbox Configuration
	OutboxProcessInterval time.Duration
	OutboxBatchSize       int
}

type KafkaTopics struct {
	OrderCreated   string
	OrderPaid      string
	OrderAssigned  string
	OrderPickedUp  string
	OrderOnTheWay  string
	OrderDelivered string
	OrderCanceled  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	minOrderAmount, _ := decimal.NewFromString(getEnv("MIN_ORDER_AMOUNT", "50.00"))
	smallCartFee, _ := decimal.NewFromString(getEnv("SMALL_CART_FEE", "5.00"))
	taxRate, _ := decimal.NewFromString(getEnv("TAX_RATE", "18.00"))
	deliveryFee, _ := decimal.NewFromString(getEnv("DELIVERY_FEE", "10.00"))
	expressDeliveryFee, _ := decimal.NewFromString(getEnv("EXPRESS_DELIVERY_FEE", "20.00"))
	
	outboxInterval, _ := time.ParseDuration(getEnv("OUTBOX_PROCESS_INTERVAL", "5s"))
	outboxBatchSize, _ := strconv.Atoi(getEnv("OUTBOX_BATCH_SIZE", "100"))

	return &Config{
		Port:        getEnv("ORDER_SERVICE_PORT", "8004"),
		Environment: getEnv("GO_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		
		KafkaBrokers: []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
		KafkaTopics: KafkaTopics{
			OrderCreated:   getEnv("KAFKA_TOPIC_ORDER_CREATED", "order.created"),
			OrderPaid:      getEnv("KAFKA_TOPIC_ORDER_PAID", "order.paid"),
			OrderAssigned:  getEnv("KAFKA_TOPIC_ORDER_ASSIGNED", "order.assigned"),
			OrderPickedUp:  getEnv("KAFKA_TOPIC_ORDER_PICKED_UP", "order.picked_up"),
			OrderOnTheWay:  getEnv("KAFKA_TOPIC_ORDER_ON_THE_WAY", "order.on_the_way"),
			OrderDelivered: getEnv("KAFKA_TOPIC_ORDER_DELIVERED", "order.delivered"),
			OrderCanceled:  getEnv("KAFKA_TOPIC_ORDER_CANCELED", "order.canceled"),
		},
		
		MinOrderAmount:     minOrderAmount,
		SmallCartFee:       smallCartFee,
		Currency:           getEnv("CURRENCY", "TRY"),
		TaxRate:            taxRate,
		DeliveryFee:        deliveryFee,
		ExpressDeliveryFee: expressDeliveryFee,
		
		CatalogServiceURL:   getEnv("CATALOG_SERVICE_URL", "http://localhost:8002"),
		PricingServiceURL:   getEnv("PRICING_SERVICE_URL", "http://localhost:8010"),
		PromotionServiceURL: getEnv("PROMOTION_SERVICE_URL", "http://localhost:8007"),
		PaymentServiceURL:   getEnv("PAYMENT_SERVICE_URL", "http://localhost:8005"),
		CourierServiceURL:   getEnv("COURIER_SERVICE_URL", "http://localhost:8006"),
		
		OutboxProcessInterval: outboxInterval,
		OutboxBatchSize:       outboxBatchSize,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}