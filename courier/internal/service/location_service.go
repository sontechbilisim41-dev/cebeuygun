package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/cebeuygun/platform/services/courier/internal/config"
	"github.com/cebeuygun/platform/services/courier/internal/models"
	"github.com/cebeuygun/platform/services/courier/internal/repository"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
)

type LocationService interface {
	UpdateCourierLocation(courierID uuid.UUID, location *models.Location, metadata *LocationMetadata) error
	GetCourierLocation(courierID uuid.UUID) (*models.Location, error)
	GetLocationHistory(courierID uuid.UUID, limit int) ([]*models.CourierLocationUpdate, error)
	StartLocationProcessor()
	ProcessLocationUpdate(update *models.CourierLocationUpdate) error
}

type LocationMetadata struct {
	Speed    *float64 `json:"speed,omitempty"`
	Heading  *float64 `json:"heading,omitempty"`
	Accuracy *float64 `json:"accuracy,omitempty"`
	OrderID  *string  `json:"order_id,omitempty"`
}

type locationService struct {
	courierRepo repository.CourierRepository
	redisClient *redis.Client
	config      *config.Config
	
	// Throttling and debouncing
	locationLimiters map[string]*rate.Limiter
	limiterMutex     sync.RWMutex
	
	// Location update queue
	updateQueue chan *models.CourierLocationUpdate
	
	// Last known locations for debouncing
	lastLocations map[string]*models.Location
	locationMutex sync.RWMutex
}

func NewLocationService(
	courierRepo repository.CourierRepository,
	redisClient *redis.Client,
	cfg *config.Config,
) LocationService {
	service := &locationService{
		courierRepo:      courierRepo,
		redisClient:      redisClient,
		config:           cfg,
		locationLimiters: make(map[string]*rate.Limiter),
		updateQueue:      make(chan *models.CourierLocationUpdate, 1000),
		lastLocations:    make(map[string]*models.Location),
	}
	
	// Start background processors
	go service.StartLocationProcessor()
	go service.startQueueProcessor()
	
	return service
}

func (s *locationService) UpdateCourierLocation(courierID uuid.UUID, location *models.Location, metadata *LocationMetadata) error {
	courierIDStr := courierID.String()
	
	// Apply rate limiting (max 1 update per 2 seconds per courier)
	limiter := s.getOrCreateLimiter(courierIDStr)
	if !limiter.Allow() {
		return fmt.Errorf("location update rate limit exceeded for courier %s", courierIDStr)
	}
	
	// Apply debouncing - check if location has changed significantly
	if s.shouldDebounceUpdate(courierIDStr, location) {
		logger.debug("Location update debounced for courier %s", courierIDStr)
		return nil
	}
	
	// Create location update
	update := &models.CourierLocationUpdate{
		CourierID: courierID,
		Location:  *location,
		Timestamp: time.Now(),
		Speed:     metadata.Speed,
		Heading:   metadata.Heading,
		Accuracy:  metadata.Accuracy,
	}
	
	// Queue for processing
	select {
	case s.updateQueue <- update:
		logger.debug("Queued location update for courier %s", courierIDStr)
	default:
		logger.warn("Location update queue full, dropping update for courier %s", courierIDStr)
		return fmt.Errorf("location update queue full")
	}
	
	return nil
}

func (s *locationService) ProcessLocationUpdate(update *models.CourierLocationUpdate) error {
	ctx := context.Background()
	courierIDStr := update.CourierID.String()
	
	// Store in database
	err := s.courierRepo.UpdateLocation(update.CourierID, &update.Location)
	if err != nil {
		logger.error("Failed to store location in database for courier %s: %v", courierIDStr, err)
		// Continue with Redis update even if DB fails
	}
	
	// Cache in Redis for fast access
	locationData := map[string]interface{}{
		"latitude":  update.Location.Latitude,
		"longitude": update.Location.Longitude,
		"address":   update.Location.Address,
		"speed":     update.Speed,
		"heading":   update.Heading,
		"accuracy":  update.Accuracy,
		"timestamp": update.Timestamp.Unix(),
	}
	
	locationJSON, err := json.Marshal(locationData)
	if err != nil {
		return fmt.Errorf("failed to marshal location data: %w", err)
	}
	
	// Store current location
	locationKey := fmt.Sprintf("courier:location:%s", courierIDStr)
	err = s.redisClient.SetEx(ctx, locationKey, string(locationJSON), s.config.LocationExpiry).Err()
	if err != nil {
		return fmt.Errorf("failed to cache location: %w", err)
	}
	
	// Update last known location for debouncing
	s.updateLastKnownLocation(courierIDStr, &update.Location)
	
	// Get active order for this courier
	orderID, err := s.getActiveOrderForCourier(update.CourierID)
	if err != nil {
		logger.debug("No active order found for courier %s", courierIDStr)
		return nil
	}
	
	// Publish location update for real-time tracking
	if orderID != "" {
		locationUpdate := map[string]interface{}{
			"orderId":   orderID,
			"courierId": courierIDStr,
			"latitude":  update.Location.Latitude,
			"longitude": update.Location.Longitude,
			"heading":   update.Heading,
			"speed":     update.Speed,
			"accuracy":  update.Accuracy,
			"timestamp": update.Timestamp.Format(time.RFC3339),
		}
		
		updateJSON, _ := json.Marshal(locationUpdate)
		err = s.redisClient.Publish(ctx, fmt.Sprintf("courier:location:%s", orderID), string(updateJSON)).Err()
		if err != nil {
			logger.error("Failed to publish location update: %v", err)
		} else {
			logger.debug("Published location update for order %s", orderID)
		}
	}
	
	return nil
}

func (s *locationService) GetCourierLocation(courierID uuid.UUID) (*models.Location, error) {
	ctx := context.Background()
	locationKey := fmt.Sprintf("courier:location:%s", courierID.String())
	
	// Try Redis first
	locationJSON, err := s.redisClient.Get(ctx, locationKey).Result()
	if err == nil {
		var locationData map[string]interface{}
		if json.Unmarshal([]byte(locationJSON), &locationData) == nil {
			if lat, ok := locationData["latitude"].(float64); ok {
				if lng, ok := locationData["longitude"].(float64); ok {
					location := &models.Location{
						Latitude:  lat,
						Longitude: lng,
					}
					if addr, ok := locationData["address"].(string); ok {
						location.Address = addr
					}
					return location, nil
				}
			}
		}
	}
	
	// Fallback to database
	return s.courierRepo.GetCurrentLocation(courierID)
}

func (s *locationService) GetLocationHistory(courierID uuid.UUID, limit int) ([]*models.CourierLocationUpdate, error) {
	return s.courierRepo.GetLocationHistory(courierID, limit)
}

func (s *locationService) StartLocationProcessor() {
	log.Println("Starting location update processor...")
	
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			s.cleanupExpiredLocations()
		}
	}
}

func (s *locationService) startQueueProcessor() {
	log.Println("Starting location update queue processor...")
	
	// Process updates from queue with batching
	batchSize := 10
	batchTimeout := 100 * time.Millisecond
	
	var batch []*models.CourierLocationUpdate
	timer := time.NewTimer(batchTimeout)
	
	for {
		select {
		case update := <-s.updateQueue:
			batch = append(batch, update)
			
			if len(batch) >= batchSize {
				s.processBatch(batch)
				batch = batch[:0]
				timer.Reset(batchTimeout)
			}
			
		case <-timer.C:
			if len(batch) > 0 {
				s.processBatch(batch)
				batch = batch[:0]
			}
			timer.Reset(batchTimeout)
		}
	}
}

func (s *locationService) processBatch(batch []*models.CourierLocationUpdate) {
	for _, update := range batch {
		if err := s.ProcessLocationUpdate(update); err != nil {
			logger.error("Failed to process location update: %v", err)
		}
	}
	
	logger.debug("Processed batch of %d location updates", len(batch))
}

func (s *locationService) getOrCreateLimiter(courierID string) *rate.Limiter {
	s.limiterMutex.RLock()
	limiter, exists := s.locationLimiters[courierID]
	s.limiterMutex.RUnlock()
	
	if exists {
		return limiter
	}
	
	s.limiterMutex.Lock()
	defer s.limiterMutex.Unlock()
	
	// Double-check after acquiring write lock
	if limiter, exists := s.locationLimiters[courierID]; exists {
		return limiter
	}
	
	// Create new limiter: 1 update per 2 seconds
	limiter = rate.NewLimiter(rate.Every(2*time.Second), 1)
	s.locationLimiters[courierID] = limiter
	
	return limiter
}

func (s *locationService) shouldDebounceUpdate(courierID string, newLocation *models.Location) bool {
	s.locationMutex.RLock()
	lastLocation, exists := s.lastLocations[courierID]
	s.locationMutex.RUnlock()
	
	if !exists {
		return false
	}
	
	// Calculate distance from last known location
	distance := lastLocation.DistanceTo(newLocation)
	
	// Debounce if movement is less than 10 meters
	return distance < 0.01 // 0.01 km = 10 meters
}

func (s *locationService) updateLastKnownLocation(courierID string, location *models.Location) {
	s.locationMutex.Lock()
	defer s.locationMutex.Unlock()
	
	s.lastLocations[courierID] = &models.Location{
		Latitude:  location.Latitude,
		Longitude: location.Longitude,
		Address:   location.Address,
	}
}

func (s *locationService) getActiveOrderForCourier(courierID uuid.UUID) (string, error) {
	ctx := context.Background()
	
	// Check Redis for active assignment
	assignmentKey := fmt.Sprintf("courier:active_order:%s", courierID.String())
	orderID, err := s.redisClient.Get(ctx, assignmentKey).Result()
	if err != nil {
		// Fallback to database query
		// This would typically query the assignments table
		return "", nil
	}
	
	return orderID, nil
}

func (s *locationService) cleanupExpiredLocations() {
	ctx := context.Background()
	
	// Clean up expired location data
	pattern := "courier:location:*"
	keys, err := s.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		logger.error("Failed to get location keys for cleanup: %v", err)
		return
	}
	
	expiredCount := 0
	for _, key := range keys {
		ttl, err := s.redisClient.TTL(ctx, key).Result()
		if err != nil {
			continue
		}
		
		if ttl < time.Minute {
			// Location is about to expire, mark courier as potentially offline
			courierIDStr := strings.TrimPrefix(key, "courier:location:")
			if courierID, err := uuid.Parse(courierIDStr); err == nil {
				// This could trigger a status check or notification
				logger.debug("Location data expiring for courier %s", courierIDStr)
			}
			expiredCount++
		}
	}
	
	if expiredCount > 0 {
		logger.info("Found %d expiring location records", expiredCount)
	}
	
	// Clean up old limiters
	s.limiterMutex.Lock()
	for courierID := range s.locationLimiters {
		// Remove limiters for couriers not seen in last hour
		locationKey := fmt.Sprintf("courier:location:%s", courierID)
		exists, err := s.redisClient.Exists(ctx, locationKey).Result()
		if err != nil || exists == 0 {
			delete(s.locationLimiters, courierID)
		}
	}
	s.limiterMutex.Unlock()
}