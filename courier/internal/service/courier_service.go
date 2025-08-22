package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sort"
	"sync"
	"time"

	"github.com/cebeuygun/platform/services/courier/internal/config"
	"github.com/cebeuygun/platform/services/courier/internal/models"
	"github.com/cebeuygun/platform/services/courier/internal/repository"
	locationService "github.com/cebeuygun/platform/services/courier/internal/service"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
	"golang.org/x/sync/semaphore"
	"golang.org/x/time/rate"
)

type CourierService interface {
	// Courier management
	CreateCourier(req *models.CreateCourierRequest) (*models.Courier, error)
	GetCourier(id uuid.UUID) (*models.Courier, error)
	UpdateCourier(id uuid.UUID, req *models.UpdateCourierRequest) error
	DeleteCourier(id uuid.UUID) error
	GetCouriers(status *models.CourierStatus, vehicleType *models.VehicleType, page, limit int) ([]*models.Courier, int64, error)
	
	// Location management
	UpdateCourierLocation(courierID uuid.UUID, req *models.UpdateLocationRequest) error
	GetCourierLocation(courierID uuid.UUID) (*models.Location, error)
	
	// Assignment operations
	AssignOrder(req *models.AssignOrderRequest) (*models.AssignmentResponse, error)
	ManualAssign(req *models.ManualAssignRequest) (*models.AssignmentResponse, error)
	GetAssignment(id uuid.UUID) (*models.Assignment, error)
	UpdateAssignmentStatus(id uuid.UUID, status models.AssignmentStatus, notes *string) error
	
	// Availability queries
	FindAvailableCouriers(req *models.CourierAvailabilityRequest) ([]*models.Courier, error)
	GetCourierPerformance(courierID uuid.UUID) (*models.CourierPerformanceStats, error)
	
	// Status management
	SetCourierStatus(courierID uuid.UUID, status models.CourierStatus) error
	SetCourierOnlineStatus(courierID uuid.UUID, isOnline bool) error
	
	// Background processes
	StartOrderConsumer()
	StartLocationProcessor()
	
	// Location service access
	GetLocationService() LocationService
}

type courierService struct {
	courierRepo    repository.CourierRepository
	assignmentRepo repository.AssignmentRepository
	locationSvc    LocationService
	redisClient    *redis.Client
	kafkaReader    *kafka.Reader
	kafkaWriter    *kafka.Writer
	config         *config.Config
	
	// Concurrency control
	assignmentSemaphore *semaphore.Weighted
	rateLimiter         *rate.Limiter
	
	// Round-robin state
	roundRobinMutex sync.Mutex
	lastAssignedIndex int
}

func NewCourierService(
	courierRepo repository.CourierRepository,
	assignmentRepo repository.AssignmentRepository,
	redisClient *redis.Client,
	cfg *config.Config,
) (CourierService, error) {
	// Initialize location service
	locationSvc := NewLocationService(courierRepo, redisClient, cfg)
	
	// Initialize Kafka reader for order.paid events
	kafkaReader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:     cfg.KafkaBrokers,
		Topic:       cfg.KafkaTopics.OrderPaid,
		GroupID:     "courier-service-group",
		MinBytes:    10e3, // 10KB
		MaxBytes:    10e6, // 10MB
		MaxWait:     1 * time.Second,
		StartOffset: kafka.LastOffset,
	})

	// Initialize Kafka writer for courier events
	kafkaWriter := &kafka.Writer{
		Addr:     kafka.TCP(cfg.KafkaBrokers...),
		Topic:    cfg.KafkaTopics.CourierAssigned,
		Balancer: &kafka.LeastBytes{},
	}

	// Initialize concurrency controls
	assignmentSemaphore := semaphore.NewWeighted(int64(cfg.MaxConcurrentAssignments))
	rateLimiter := rate.NewLimiter(rate.Every(time.Second/100), 100) // 100 assignments per second max

	return &courierService{
		courierRepo:         courierRepo,
		assignmentRepo:      assignmentRepo,
		locationSvc:         locationSvc,
		redisClient:         redisClient,
		kafkaReader:         kafkaReader,
		kafkaWriter:         kafkaWriter,
		config:              cfg,
		assignmentSemaphore: assignmentSemaphore,
		rateLimiter:         rateLimiter,
		lastAssignedIndex:   0,
	}, nil
}

func (s *courierService) GetLocationService() LocationService {
	return s.locationSvc
}

// Courier management
func (s *courierService) CreateCourier(req *models.CreateCourierRequest) (*models.Courier, error) {
	courier := &models.Courier{
		ID:              uuid.New(),
		UserID:          req.UserID,
		FirstName:       req.FirstName,
		LastName:        req.LastName,
		Phone:           req.Phone,
		Email:           req.Email,
		VehicleType:     req.VehicleType,
		VehiclePlate:    req.VehiclePlate,
		Status:          models.CourierStatusInactive,
		Rating:          decimal.NewFromFloat(5.0),
		CompletedOrders: 0,
		IsOnline:        false,
	}

	err := s.courierRepo.Create(courier)
	if err != nil {
		return nil, fmt.Errorf("failed to create courier: %w", err)
	}

	return courier, nil
}

func (s *courierService) GetCourier(id uuid.UUID) (*models.Courier, error) {
	return s.courierRepo.GetByID(id)
}

func (s *courierService) UpdateCourier(id uuid.UUID, req *models.UpdateCourierRequest) error {
	return s.courierRepo.Update(id, req)
}

func (s *courierService) DeleteCourier(id uuid.UUID) error {
	return s.courierRepo.Delete(id)
}

func (s *courierService) GetCouriers(status *models.CourierStatus, vehicleType *models.VehicleType, page, limit int) ([]*models.Courier, int64, error) {
	offset := (page - 1) * limit
	return s.courierRepo.GetAll(status, vehicleType, limit, offset)
}

// Location management
func (s *courierService) UpdateCourierLocation(courierID uuid.UUID, req *models.UpdateLocationRequest) error {
	location := &models.Location{
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
	}

	metadata := &LocationMetadata{
		Speed:    req.Speed,
		Heading:  req.Heading,
		Accuracy: req.Accuracy,
	}

	return s.locationSvc.UpdateCourierLocation(courierID, location, metadata)
}

func (s *courierService) GetCourierLocation(courierID uuid.UUID) (*models.Location, error) {
	return s.locationSvc.GetCourierLocation(courierID)
}

// Assignment operations
func (s *courierService) AssignOrder(req *models.AssignOrderRequest) (*models.AssignmentResponse, error) {
	startTime := time.Now()
	
	// Acquire semaphore for concurrency control
	ctx, cancel := context.WithTimeout(context.Background(), s.config.AssignmentTimeout)
	defer cancel()
	
	if err := s.assignmentSemaphore.Acquire(ctx, 1); err != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Assignment service overloaded",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}
	defer s.assignmentSemaphore.Release(1)

	// Rate limiting
	if err := s.rateLimiter.Wait(ctx); err != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Rate limit exceeded",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}

	log.Printf("Starting assignment for order %s", req.OrderID)

	// Primary strategy: Find nearest available courier
	assignment, method, err := s.assignByProximity(req)
	if err == nil && assignment != nil {
		return s.createAssignmentResponse(assignment, method, startTime), nil
	}

	log.Printf("Proximity assignment failed for order %s: %v", req.OrderID, err)

	// Fallback strategy: Round-robin assignment
	assignment, method, err = s.assignByRoundRobin(req)
	if err == nil && assignment != nil {
		return s.createAssignmentResponse(assignment, method, startTime), nil
	}

	log.Printf("Round-robin assignment failed for order %s: %v", req.OrderID, err)

	// No available couriers
	return &models.AssignmentResponse{
		Success:          false,
		Message:          "No available couriers found",
		AssignmentMethod: "none",
		ProcessingTime:   time.Since(startTime).Milliseconds(),
	}, nil
}

func (s *courierService) assignByProximity(req *models.AssignOrderRequest) (*models.Assignment, string, error) {
	maxDistance := s.config.MaxAssignmentDistance
	if req.MaxDistance != nil && *req.MaxDistance < maxDistance {
		maxDistance = *req.MaxDistance
	}

	// Find available couriers within range
	couriers, err := s.courierRepo.FindAvailableCouriers(&req.PickupLocation, maxDistance, req.RequiredVehicle)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find available couriers: %w", err)
	}

	if len(couriers) == 0 {
		return nil, "", fmt.Errorf("no available couriers within %f km", maxDistance)
	}

	// Select the best courier (closest with highest rating)
	bestCourier := s.selectBestCourier(couriers, &req.PickupLocation)
	
	// Create assignment
	assignment := &models.Assignment{
		ID:                uuid.New(),
		OrderID:           req.OrderID,
		CourierID:         bestCourier.ID,
		Status:            models.AssignmentStatusPending,
		PickupLocation:    req.PickupLocation,
		DeliveryLocation:  req.DeliveryLocation,
		EstimatedDistance: *bestCourier.CurrentDistance,
		EstimatedDuration: s.calculateETA(*bestCourier.CurrentDistance, bestCourier.VehicleType),
		Notes:             req.Notes,
	}

	err = s.assignmentRepo.Create(assignment)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create assignment: %w", err)
	}

	// Update courier status to busy
	s.courierRepo.UpdateStatus(bestCourier.ID, models.CourierStatusBusy)

	// Publish assignment event
	go s.publishAssignmentEvent(assignment, "proximity")

	return assignment, "proximity", nil
}

func (s *courierService) assignByRoundRobin(req *models.AssignOrderRequest) (*models.Assignment, string, error) {
	s.roundRobinMutex.Lock()
	defer s.roundRobinMutex.Unlock()

	// Get all active couriers
	couriers, _, err := s.courierRepo.GetAll(
		func() *models.CourierStatus { status := models.CourierStatusActive; return &status }(),
		req.RequiredVehicle,
		100, // Get up to 100 couriers
		0,
	)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get couriers for round-robin: %w", err)
	}

	// Filter online couriers
	var availableCouriers []*models.Courier
	for _, courier := range couriers {
		if courier.IsOnline {
			availableCouriers = append(availableCouriers, courier)
		}
	}

	if len(availableCouriers) == 0 {
		return nil, "", fmt.Errorf("no online couriers available for round-robin")
	}

	// Round-robin selection
	selectedCourier := availableCouriers[s.lastAssignedIndex%len(availableCouriers)]
	s.lastAssignedIndex++

	// Calculate distance and ETA
	courierLocation, err := s.GetCourierLocation(selectedCourier.ID)
	if err != nil || courierLocation == nil {
		return nil, "", fmt.Errorf("courier location not available")
	}

	distance := courierLocation.DistanceTo(&req.PickupLocation)
	
	// Create assignment
	assignment := &models.Assignment{
		ID:                uuid.New(),
		OrderID:           req.OrderID,
		CourierID:         selectedCourier.ID,
		Status:            models.AssignmentStatusPending,
		PickupLocation:    req.PickupLocation,
		DeliveryLocation:  req.DeliveryLocation,
		EstimatedDistance: distance,
		EstimatedDuration: s.calculateETA(distance, selectedCourier.VehicleType),
		Notes:             req.Notes,
	}

	err = s.assignmentRepo.Create(assignment)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create round-robin assignment: %w", err)
	}

	// Update courier status to busy
	s.courierRepo.UpdateStatus(selectedCourier.ID, models.CourierStatusBusy)

	// Publish assignment event
	go s.publishAssignmentEvent(assignment, "round_robin")

	return assignment, "round_robin", nil
}

func (s *courierService) ManualAssign(req *models.ManualAssignRequest) (*models.AssignmentResponse, error) {
	startTime := time.Now()

	// Verify courier exists and is available
	courier, err := s.courierRepo.GetByID(req.CourierID)
	if err != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Failed to get courier information",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, err
	}

	if courier == nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Courier not found",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}

	// Check if order is already assigned
	existingAssignment, err := s.assignmentRepo.GetByOrderID(req.OrderID)
	if err != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Failed to check existing assignment",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, err
	}

	if existingAssignment != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Order is already assigned",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, nil
	}

	// Create manual assignment (we need pickup/delivery locations from order service)
	// For now, create a placeholder assignment
	assignment := &models.Assignment{
		ID:        uuid.New(),
		OrderID:   req.OrderID,
		CourierID: req.CourierID,
		Status:    models.AssignmentStatusPending,
		Notes:     &req.Reason,
	}

	err = s.assignmentRepo.Create(assignment)
	if err != nil {
		return &models.AssignmentResponse{
			Success:        false,
			Message:        "Failed to create manual assignment",
			ProcessingTime: time.Since(startTime).Milliseconds(),
		}, err
	}

	// Update courier status
	s.courierRepo.UpdateStatus(req.CourierID, models.CourierStatusBusy)

	// Publish assignment event
	go s.publishAssignmentEvent(assignment, "manual")

	return &models.AssignmentResponse{
		Success:          true,
		Message:          "Manual assignment created successfully",
		Assignment:       assignment,
		AssignmentMethod: "manual",
		ProcessingTime:   time.Since(startTime).Milliseconds(),
	}, nil
}

func (s *courierService) GetAssignment(id uuid.UUID) (*models.Assignment, error) {
	return s.assignmentRepo.GetByID(id)
}

func (s *courierService) UpdateAssignmentStatus(id uuid.UUID, status models.AssignmentStatus, notes *string) error {
	return s.assignmentRepo.UpdateStatus(id, status, notes)
}

func (s *courierService) FindAvailableCouriers(req *models.CourierAvailabilityRequest) ([]*models.Courier, error) {
	maxDistance := s.config.MaxAssignmentDistance
	if req.MaxDistance != nil {
		maxDistance = *req.MaxDistance
	}

	return s.courierRepo.FindAvailableCouriers(&req.Location, maxDistance, req.VehicleType)
}

func (s *courierService) GetCourierPerformance(courierID uuid.UUID) (*models.CourierPerformanceStats, error) {
	return s.courierRepo.GetCourierPerformanceStats(courierID)
}

func (s *courierService) SetCourierStatus(courierID uuid.UUID, status models.CourierStatus) error {
	return s.courierRepo.UpdateStatus(courierID, status)
}

func (s *courierService) SetCourierOnlineStatus(courierID uuid.UUID, isOnline bool) error {
	return s.courierRepo.SetOnlineStatus(courierID, isOnline)
}

// Helper methods
func (s *courierService) selectBestCourier(couriers []*models.Courier, pickupLocation *models.Location) *models.Courier {
	if len(couriers) == 0 {
		return nil
	}

	// Sort by distance first, then by rating and completed orders
	sort.Slice(couriers, func(i, j int) bool {
		// Primary: distance
		if couriers[i].CurrentDistance != nil && couriers[j].CurrentDistance != nil {
			if math.Abs(*couriers[i].CurrentDistance - *couriers[j].CurrentDistance) > 0.1 {
				return *couriers[i].CurrentDistance < *couriers[j].CurrentDistance
			}
		}
		
		// Secondary: rating
		if !couriers[i].Rating.Equal(couriers[j].Rating) {
			return couriers[i].Rating.GreaterThan(couriers[j].Rating)
		}
		
		// Tertiary: completed orders
		return couriers[i].CompletedOrders > couriers[j].CompletedOrders
	})

	return couriers[0]
}

func (s *courierService) calculateETA(distanceKm float64, vehicleType models.VehicleType) int {
	// Base calculation using distance and vehicle speed
	var speedKmH float64
	switch vehicleType {
	case models.VehicleTypeWalking:
		speedKmH = 5.0
	case models.VehicleTypeBicycle:
		speedKmH = 15.0
	case models.VehicleTypeMotorbike:
		speedKmH = 30.0
	case models.VehicleTypeCar:
		speedKmH = 25.0 // Slower in city traffic
	default:
		speedKmH = 20.0
	}

	// Calculate base time in minutes
	baseTimeMinutes := (distanceKm / speedKmH) * 60

	// Add preparation time
	var prepTimeMinutes float64
	switch vehicleType {
	case models.VehicleTypeWalking:
		prepTimeMinutes = 5
	case models.VehicleTypeBicycle:
		prepTimeMinutes = 3
	case models.VehicleTypeMotorbike:
		prepTimeMinutes = 2
	case models.VehicleTypeCar:
		prepTimeMinutes = 2
	}

	// Add traffic factor (20% increase for city traffic)
	trafficFactor := 1.2
	
	totalMinutes := (baseTimeMinutes + prepTimeMinutes) * trafficFactor
	
	// Round up to nearest minute
	return int(math.Ceil(totalMinutes))
}

func (s *courierService) createAssignmentResponse(assignment *models.Assignment, method string, startTime time.Time) *models.AssignmentResponse {
	eta := assignment.CalculateETA(s.config.ETACalculationFactor)
	
	return &models.AssignmentResponse{
		Success:          true,
		Message:          "Courier assigned successfully",
		Assignment:       assignment,
		EstimatedETA:     &eta,
		AssignmentMethod: method,
		ProcessingTime:   time.Since(startTime).Milliseconds(),
	}
}

func (s *courierService) publishAssignmentEvent(assignment *models.Assignment, method string) {
	event := models.CourierAssignedEvent{
		AssignmentID:     assignment.ID,
		OrderID:          assignment.OrderID,
		CourierID:        assignment.CourierID,
		EstimatedETA:     assignment.EstimatedDuration,
		AssignmentMethod: method,
		Distance:         assignment.EstimatedDistance,
		Timestamp:        time.Now().UTC(),
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal assignment event: %v", err)
		return
	}

	err = s.kafkaWriter.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(assignment.OrderID.String()),
			Value: eventJSON,
			Headers: []kafka.Header{
				{Key: "event_type", Value: []byte("courier.assigned")},
				{Key: "assignment_id", Value: []byte(assignment.ID.String())},
				{Key: "order_id", Value: []byte(assignment.OrderID.String())},
			},
		},
	)
	if err != nil {
		log.Printf("Failed to publish assignment event: %v", err)
	} else {
		log.Printf("Published courier.assigned event for order %s", assignment.OrderID)
	}
}

// Background processes
func (s *courierService) StartOrderConsumer() {
	log.Println("Starting order.paid event consumer...")
	
	for {
		message, err := s.kafkaReader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("Failed to read Kafka message: %v", err)
			time.Sleep(1 * time.Second)
			continue
		}

		// Parse order.paid event
		var orderEvent models.OrderPaidEvent
		if err := json.Unmarshal(message.Value, &orderEvent); err != nil {
			log.Printf("Failed to unmarshal order event: %v", err)
			continue
		}

		log.Printf("Received order.paid event for order %s", orderEvent.OrderID)

		// Create assignment request
		assignReq := &models.AssignOrderRequest{
			OrderID:          orderEvent.OrderID,
			PickupLocation:   orderEvent.PickupLocation,
			DeliveryLocation: orderEvent.DeliveryLocation,
			Priority:         orderEvent.Priority,
			RequiredVehicle:  orderEvent.RequiredVehicle,
		}

		// Assign courier
		response, err := s.AssignOrder(assignReq)
		if err != nil {
			log.Printf("Failed to assign courier for order %s: %v", orderEvent.OrderID, err)
		} else if response.Success {
			log.Printf("Successfully assigned courier for order %s in %dms", 
				orderEvent.OrderID, response.ProcessingTime)
		} else {
			log.Printf("No courier available for order %s: %s", 
				orderEvent.OrderID, response.Message)
		}
	}
}

func (s *courierService) StartLocationProcessor() {
	log.Println("Starting location update processor...")
	
	ticker := time.NewTicker(s.config.LocationUpdateInterval)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			s.processLocationUpdates()
		}
	}
}

func (s *courierService) processLocationUpdates() {
	// Clean up expired location data
	ctx := context.Background()
	pattern := "courier:location:*"
	
	keys, err := s.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		log.Printf("Failed to get location keys: %v", err)
		return
	}

	for _, key := range keys {
		// Check if location data is expired
		ttl, err := s.redisClient.TTL(ctx, key).Result()
		if err != nil {
			continue
		}
		
		if ttl < time.Minute {
			// Location is about to expire, mark courier as offline
			courierIDStr := strings.TrimPrefix(key, "courier:location:")
			if courierID, err := uuid.Parse(courierIDStr); err == nil {
				s.courierRepo.SetOnlineStatus(courierID, false)
			}
		}
	}
}