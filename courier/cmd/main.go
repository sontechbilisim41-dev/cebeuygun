package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cebeuygun/platform/services/courier/internal/config"
	"github.com/cebeuygun/platform/services/courier/internal/db"
	"github.com/cebeuygun/platform/services/courier/internal/handler"
	"github.com/cebeuygun/platform/services/courier/internal/repository"
	"github.com/cebeuygun/platform/services/courier/internal/service"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Courier Service API
// @version 1.0
// @description Comprehensive courier management and assignment service
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8006
// @BasePath /api/v1
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	database, err := db.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Run migrations
	if err := db.RunMigrations(cfg.DatabaseURL); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize Redis
	redisClient := db.NewRedisClient(cfg.RedisURL)

	// Initialize repositories
	courierRepo := repository.NewCourierRepository(database)
	assignmentRepo := repository.NewAssignmentRepository(database)

	// Initialize services
	courierService, err := service.NewCourierService(courierRepo, assignmentRepo, redisClient, cfg)
	if err != nil {
		log.Fatal("Failed to create courier service:", err)
	}

	// Start Kafka consumer for order.paid events
	go courierService.StartOrderConsumer()

	// Start location update processor
	go courierService.StartLocationProcessor()
	
	// Start location service processor
	go courierService.GetLocationService().StartLocationProcessor()

	// Initialize HTTP server
	if cfg.Environment != "production" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "courier",
			"timestamp": time.Now().UTC(),
		})
	})

	// API routes
	v1 := router.Group("/api/v1")
	{
		// Initialize handlers
		courierHandler := handler.NewCourierHandler(courierService)
		assignmentHandler := handler.NewAssignmentHandler(courierService)
		locationHandler := handler.NewLocationHandler(courierService.GetLocationService())

		// Register routes
		courierHandler.RegisterRoutes(v1)
		assignmentHandler.RegisterRoutes(v1)
		locationHandler.RegisterRoutes(v1)
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("🚀 Courier service listening on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}