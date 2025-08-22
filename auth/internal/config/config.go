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
	JWTSecret   string
	JWTExpiry   time.Duration
	
	// Rate limiting
	RateLimitRequests int
	RateLimitWindow   time.Duration
	
	// OTP settings
	OTPExpiry   time.Duration
	OTPLength   int
	
	// SMS settings (mock)
	SMSEnabled bool
	SMSAPIKey  string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	jwtExpiry, _ := time.ParseDuration(getEnv("JWT_EXPIRES_IN", "24h"))
	rateLimitWindow, _ := time.ParseDuration(getEnv("RATE_LIMIT_WINDOW", "1m"))
	otpExpiry, _ := time.ParseDuration(getEnv("OTP_EXPIRY", "5m"))
	
	rateLimitRequests, _ := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "10"))
	otpLength, _ := strconv.Atoi(getEnv("OTP_LENGTH", "6"))
	smsEnabled, _ := strconv.ParseBool(getEnv("SMS_ENABLED", "false"))

	return &Config{
		Port:        getEnv("AUTH_SERVICE_PORT", "8001"),
		Environment: getEnv("GO_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"),
		JWTExpiry:   jwtExpiry,
		
		RateLimitRequests: rateLimitRequests,
		RateLimitWindow:   rateLimitWindow,
		
		OTPExpiry: otpExpiry,
		OTPLength: otpLength,
		
		SMSEnabled: smsEnabled,
		SMSAPIKey:  getEnv("SMS_API_KEY", "mock-api-key"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}