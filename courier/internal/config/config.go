package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string
	
	// Kafka Configuration
	KafkaBrokers []string
	KafkaTopics  KafkaTopics
	
	// Assignment Configuration
	AssignmentTimeout     time.Duration
	MaxAssignmentDistance float64 // in kilometers
	ETACalculationFactor  float64 // minutes per km
	
	// Location Update Configuration
	LocationUpdateInterval time.Duration
	LocationExpiry         time.Duration
	
	// Performance Configuration
	MaxConcurrentAssignments int
	AssignmentRetryAttempts  int
	AssignmentRetryDelay     time.Duration
	
	// Geographic Configuration
	DefaultCity      string
	DefaultCountry   string
	MaxServiceRadius float64 // in kilometers
}

type KafkaTopics struct {
	OrderPaid       string
	CourierAssigned string
	CourierUpdated  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	assignmentTimeout, _ := time.ParseDuration(getEnv("ASSIGNMENT_TIMEOUT", "1s"))
	maxDistance, _ := strconv.ParseFloat(getEnv("MAX_ASSIGNMENT_DISTANCE", "10.0"), 64)
	etaFactor, _ := strconv.ParseFloat(getEnv("ETA_CALCULATION_FACTOR", "2.5"), 64)
	locationInterval, _ := time.ParseDuration(getEnv("LOCATION_UPDATE_INTERVAL", "30s"))
	locationExpiry, _ := time.ParseDuration(getEnv("LOCATION_EXPIRY", "5m"))
	maxConcurrent, _ := strconv.Atoi(getEnv("MAX_CONCURRENT_ASSIGNMENTS", "100"))
	retryAttempts, _ := strconv.Atoi(getEnv("ASSIGNMENT_RETRY_ATTEMPTS", "3"))
	retryDelay, _ := time.ParseDuration(getEnv("ASSIGNMENT_RETRY_DELAY", "100ms"))
	maxServiceRadius, _ := strconv.ParseFloat(getEnv("MAX_SERVICE_RADIUS", "50.0"), 64)

	return &Config{
		Port:        getEnv("COURIER_SERVICE_PORT", "8006"),
		Environment: getEnv("GO_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		
		KafkaBrokers: []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
		KafkaTopics: KafkaTopics{
			OrderPaid:       getEnv("KAFKA_TOPIC_ORDER_PAID", "order.paid"),
			CourierAssigned: getEnv("KAFKA_TOPIC_COURIER_ASSIGNED", "courier.assigned"),
			CourierUpdated:  getEnv("KAFKA_TOPIC_COURIER_UPDATED", "courier.updated"),
		},
		
		AssignmentTimeout:     assignmentTimeout,
		MaxAssignmentDistance: maxDistance,
		ETACalculationFactor:  etaFactor,
		
		LocationUpdateInterval: locationInterval,
		LocationExpiry:         locationExpiry,
		
		MaxConcurrentAssignments: maxConcurrent,
		AssignmentRetryAttempts:  retryAttempts,
		AssignmentRetryDelay:     retryDelay,
		
		DefaultCity:      getEnv("DEFAULT_CITY", "Istanbul"),
		DefaultCountry:   getEnv("DEFAULT_COUNTRY", "Turkey"),
		MaxServiceRadius: maxServiceRadius,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}