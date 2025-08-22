package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cebeuygun/platform/services/auth/internal/config"
	"github.com/cebeuygun/platform/services/auth/internal/db"
	"github.com/cebeuygun/platform/services/auth/internal/handler"
	"github.com/cebeuygun/platform/services/auth/internal/repository"
	"github.com/cebeuygun/platform/services/auth/internal/service"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

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

	// Initialize repository
	repo := repository.NewUserRepository(database)

	// Initialize service
	authService := service.NewAuthService(repo, redisClient, cfg)

	// Initialize gRPC server
	grpcServer := grpc.NewServer()
	reflection.Register(grpcServer)

	// Initialize HTTP server
	if cfg.Environment != "production" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "auth",
			"timestamp": time.Now().UTC(),
		})
	})

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	authHandler.RegisterRoutes(router)

	// Start gRPC server
	go func() {
		lis, err := net.Listen("tcp", ":9001")
		if err != nil {
			log.Fatal("Failed to listen for gRPC:", err)
		}
		log.Printf("🚀 gRPC Auth service listening on port 9001")
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatal("Failed to serve gRPC:", err)
		}
	}()

	// Start HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("🚀 Auth service listening on port %s", cfg.Port)
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

	grpcServer.GracefulStop()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}