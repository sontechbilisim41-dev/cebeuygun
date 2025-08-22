package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	
	// MinIO Configuration
	MinIOEndpoint   string
	MinIOAccessKey  string
	MinIOSecretKey  string
	MinIOUseSSL     bool
	MinIOBucketName string
	
	// Elasticsearch Configuration
	ElasticsearchURL string
	ElasticsearchIndex string
	
	// Kafka Configuration
	KafkaBrokers []string
	KafkaTopic   string
	
	// File Upload Configuration
	MaxFileSize int64 // in bytes
	AllowedFileTypes []string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	useSSL, _ := strconv.ParseBool(getEnv("MINIO_USE_SSL", "false"))
	maxFileSize, _ := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "10485760"), 10, 64) // 10MB default

	return &Config{
		Port:        getEnv("CATALOG_SERVICE_PORT", "8002"),
		Environment: getEnv("GO_ENV", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/cebeuygun?sslmode=disable"),
		
		MinIOEndpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinIOAccessKey:  getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinIOSecretKey:  getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinIOUseSSL:     useSSL,
		MinIOBucketName: getEnv("MINIO_BUCKET_NAME", "catalog-media"),
		
		ElasticsearchURL:   getEnv("ELASTICSEARCH_URL", "http://localhost:9200"),
		ElasticsearchIndex: getEnv("ELASTICSEARCH_INDEX", "products"),
		
		KafkaBrokers: []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
		KafkaTopic:   getEnv("KAFKA_TOPIC", "catalog.product.upsert"),
		
		MaxFileSize: maxFileSize,
		AllowedFileTypes: []string{"image/jpeg", "image/png", "image/webp", "video/mp4"},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}