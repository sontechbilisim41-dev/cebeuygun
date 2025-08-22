package models

import (
	"time"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Courier Status Enum
type CourierStatus string

const (
	CourierStatusActive      CourierStatus = "ACTIVE"
	CourierStatusInactive    CourierStatus = "INACTIVE"
	CourierStatusBusy        CourierStatus = "BUSY"
	CourierStatusOffline     CourierStatus = "OFFLINE"
	CourierStatusUnavailable CourierStatus = "UNAVAILABLE"
)

// Vehicle Type Enum
type VehicleType string

const (
	VehicleTypeBicycle    VehicleType = "BICYCLE"
	VehicleTypeMotorbike  VehicleType = "MOTORBIKE"
	VehicleTypeCar        VehicleType = "CAR"
	VehicleTypeWalking    VehicleType = "WALKING"
)

// Assignment Status Enum
type AssignmentStatus string

const (
	AssignmentStatusPending   AssignmentStatus = "PENDING"
	AssignmentStatusAccepted  AssignmentStatus = "ACCEPTED"
	AssignmentStatusRejected  AssignmentStatus = "REJECTED"
	AssignmentStatusCompleted AssignmentStatus = "COMPLETED"
	AssignmentStatusCanceled  AssignmentStatus = "CANCELED"
)

// Location represents geographic coordinates
type Location struct {
	Latitude  float64 `json:"latitude" validate:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" validate:"required,min=-180,max=180"`
	Address   string  `json:"address,omitempty"`
	City      string  `json:"city,omitempty"`
	District  string  `json:"district,omitempty"`
}

// WorkingHours represents courier working schedule
type WorkingHours struct {
	DayOfWeek int    `json:"day_of_week" validate:"min=0,max=6"` // 0=Sunday, 6=Saturday
	StartTime string `json:"start_time" validate:"required"`     // HH:MM format
	EndTime   string `json:"end_time" validate:"required"`       // HH:MM format
}

// ServiceArea represents courier's service coverage area
type ServiceArea struct {
	ID          uuid.UUID `json:"id" db:"id"`
	CourierID   uuid.UUID `json:"courier_id" db:"courier_id"`
	CenterLat   float64   `json:"center_lat" db:"center_lat"`
	CenterLng   float64   `json:"center_lng" db:"center_lng"`
	RadiusKm    float64   `json:"radius_km" db:"radius_km"`
	City        string    `json:"city" db:"city"`
	District    string    `json:"district" db:"district"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Courier represents a delivery courier
type Courier struct {
	ID              uuid.UUID      `json:"id" db:"id"`
	UserID          uuid.UUID      `json:"user_id" db:"user_id"`
	FirstName       string         `json:"first_name" db:"first_name"`
	LastName        string         `json:"last_name" db:"last_name"`
	Phone           string         `json:"phone" db:"phone"`
	Email           string         `json:"email" db:"email"`
	VehicleType     VehicleType    `json:"vehicle_type" db:"vehicle_type"`
	VehiclePlate    *string        `json:"vehicle_plate,omitempty" db:"vehicle_plate"`
	Status          CourierStatus  `json:"status" db:"status"`
	CurrentLocation *Location      `json:"current_location,omitempty" db:"-"`
	Rating          decimal.Decimal `json:"rating" db:"rating"`
	CompletedOrders int            `json:"completed_orders" db:"completed_orders"`
	IsOnline        bool           `json:"is_online" db:"is_online"`
	LastSeenAt      *time.Time     `json:"last_seen_at,omitempty" db:"last_seen_at"`
	CreatedAt       time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	ServiceAreas    []*ServiceArea   `json:"service_areas,omitempty" db:"-"`
	WorkingHours    []*WorkingHours  `json:"working_hours,omitempty" db:"-"`
	CurrentDistance *float64         `json:"current_distance,omitempty" db:"-"`
}

// Assignment represents courier assignment to an order
type Assignment struct {
	ID                uuid.UUID        `json:"id" db:"id"`
	OrderID           uuid.UUID        `json:"order_id" db:"order_id"`
	CourierID         uuid.UUID        `json:"courier_id" db:"courier_id"`
	Status            AssignmentStatus `json:"status" db:"status"`
	AssignedAt        time.Time        `json:"assigned_at" db:"assigned_at"`
	AcceptedAt        *time.Time       `json:"accepted_at,omitempty" db:"accepted_at"`
	RejectedAt        *time.Time       `json:"rejected_at,omitempty" db:"rejected_at"`
	CompletedAt       *time.Time       `json:"completed_at,omitempty" db:"completed_at"`
	PickupLocation    Location         `json:"pickup_location" db:"pickup_location"`
	DeliveryLocation  Location         `json:"delivery_location" db:"delivery_location"`
	EstimatedDistance float64          `json:"estimated_distance" db:"estimated_distance"`
	EstimatedDuration int              `json:"estimated_duration" db:"estimated_duration"` // in minutes
	ActualDistance    *float64         `json:"actual_distance,omitempty" db:"actual_distance"`
	ActualDuration    *int             `json:"actual_duration,omitempty" db:"actual_duration"`
	Notes             *string          `json:"notes,omitempty" db:"notes"`
	CreatedAt         time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time        `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	Courier *Courier `json:"courier,omitempty" db:"-"`
}

// CourierLocationUpdate represents a real-time location update
type CourierLocationUpdate struct {
	CourierID uuid.UUID `json:"courier_id"`
	Location  Location  `json:"location"`
	Speed     *float64  `json:"speed,omitempty"`     // km/h
	Heading   *float64  `json:"heading,omitempty"`   // degrees
	Accuracy  *float64  `json:"accuracy,omitempty"`  // meters
	Timestamp time.Time `json:"timestamp"`
}

// DTOs for API requests/responses

type CreateCourierRequest struct {
	UserID       uuid.UUID   `json:"user_id" validate:"required"`
	FirstName    string      `json:"first_name" validate:"required,min=2,max=50"`
	LastName     string      `json:"last_name" validate:"required,min=2,max=50"`
	Phone        string      `json:"phone" validate:"required,min=10,max=20"`
	Email        string      `json:"email" validate:"required,email"`
	VehicleType  VehicleType `json:"vehicle_type" validate:"required"`
	VehiclePlate *string     `json:"vehicle_plate,omitempty"`
}

type UpdateCourierRequest struct {
	FirstName    *string      `json:"first_name,omitempty" validate:"omitempty,min=2,max=50"`
	LastName     *string      `json:"last_name,omitempty" validate:"omitempty,min=2,max=50"`
	Phone        *string      `json:"phone,omitempty" validate:"omitempty,min=10,max=20"`
	Email        *string      `json:"email,omitempty" validate:"omitempty,email"`
	VehicleType  *VehicleType `json:"vehicle_type,omitempty"`
	VehiclePlate *string      `json:"vehicle_plate,omitempty"`
	Status       *CourierStatus `json:"status,omitempty"`
}

type UpdateLocationRequest struct {
	Latitude  float64 `json:"latitude" validate:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" validate:"required,min=-180,max=180"`
	Address   *string `json:"address,omitempty"`
	Speed     *float64 `json:"speed,omitempty"`     // km/h
	Heading   *float64 `json:"heading,omitempty"`   // degrees
	Accuracy  *float64 `json:"accuracy,omitempty"`  // GPS accuracy in meters
}

type AssignOrderRequest struct {
	OrderID          uuid.UUID `json:"order_id" validate:"required"`
	PickupLocation   Location  `json:"pickup_location" validate:"required"`
	DeliveryLocation Location  `json:"delivery_location" validate:"required"`
	Priority         int       `json:"priority" validate:"min=1,max=5"` // 1=low, 5=urgent
	RequiredVehicle  *VehicleType `json:"required_vehicle,omitempty"`
	MaxDistance      *float64  `json:"max_distance,omitempty"`
	Notes            *string   `json:"notes,omitempty"`
}

type ManualAssignRequest struct {
	OrderID   uuid.UUID `json:"order_id" validate:"required"`
	CourierID uuid.UUID `json:"courier_id" validate:"required"`
	Reason    string    `json:"reason" validate:"required,min=5,max=200"`
}

type CourierAvailabilityRequest struct {
	Location    Location     `json:"location" validate:"required"`
	MaxDistance *float64     `json:"max_distance,omitempty"`
	VehicleType *VehicleType `json:"vehicle_type,omitempty"`
}

type AssignmentResponse struct {
	Success          bool      `json:"success"`
	Message          string    `json:"message"`
	Assignment       *Assignment `json:"assignment,omitempty"`
	EstimatedETA     *int      `json:"estimated_eta,omitempty"` // in minutes
	AssignmentMethod string    `json:"assignment_method"`       // "proximity", "round_robin", "manual"
	ProcessingTime   int64     `json:"processing_time_ms"`
}

type CourierLocationUpdate struct {
	CourierID uuid.UUID `json:"courier_id"`
	Location  Location  `json:"location"`
	Timestamp time.Time `json:"timestamp"`
	Speed     *float64  `json:"speed,omitempty"`     // km/h
	Heading   *float64  `json:"heading,omitempty"`   // degrees
	Accuracy  *float64  `json:"accuracy,omitempty"`  // meters
}

type ETACalculation struct {
	EstimatedMinutes int     `json:"estimated_minutes"`
	Distance         float64 `json:"distance_km"`
	Method           string  `json:"calculation_method"`
	Factors          map[string]interface{} `json:"factors,omitempty"`
}

type CourierPerformanceStats struct {
	CourierID           uuid.UUID       `json:"courier_id"`
	TotalAssignments    int             `json:"total_assignments"`
	CompletedOrders     int             `json:"completed_orders"`
	CanceledOrders      int             `json:"canceled_orders"`
	AverageRating       decimal.Decimal `json:"average_rating"`
	AverageDeliveryTime int             `json:"average_delivery_time_minutes"`
	OnTimeDeliveryRate  float64         `json:"on_time_delivery_rate"`
	LastActiveDate      *time.Time      `json:"last_active_date,omitempty"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data,omitempty"`
	Pagination Pagination `json:"pagination"`
	Error      string      `json:"error,omitempty"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// Event payloads for Kafka
type OrderPaidEvent struct {
	OrderID          uuid.UUID       `json:"order_id"`
	CustomerID       uuid.UUID       `json:"customer_id"`
	SellerID         uuid.UUID       `json:"seller_id"`
	TotalAmount      decimal.Decimal `json:"total_amount"`
	Currency         string          `json:"currency"`
	PickupLocation   Location        `json:"pickup_location"`
	DeliveryLocation Location        `json:"delivery_location"`
	Priority         int             `json:"priority"`
	RequiredVehicle  *VehicleType    `json:"required_vehicle,omitempty"`
	Timestamp        time.Time       `json:"timestamp"`
}

type CourierAssignedEvent struct {
	AssignmentID     uuid.UUID `json:"assignment_id"`
	OrderID          uuid.UUID `json:"order_id"`
	CourierID        uuid.UUID `json:"courier_id"`
	EstimatedETA     int       `json:"estimated_eta_minutes"`
	AssignmentMethod string    `json:"assignment_method"`
	Distance         float64   `json:"distance_km"`
	Timestamp        time.Time `json:"timestamp"`
}

// Geographic utilities
func (l *Location) DistanceTo(other *Location) float64 {
	return calculateHaversineDistance(l.Latitude, l.Longitude, other.Latitude, other.Longitude)
}

// Haversine formula for calculating distance between two points
func calculateHaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadiusKm = 6371.0
	
	// Convert degrees to radians
	lat1Rad := lat1 * (3.14159265359 / 180)
	lon1Rad := lon1 * (3.14159265359 / 180)
	lat2Rad := lat2 * (3.14159265359 / 180)
	lon2Rad := lon2 * (3.14159265359 / 180)
	
	// Haversine formula
	dLat := lat2Rad - lat1Rad
	dLon := lon2Rad - lon1Rad
	
	a := 0.5 - 0.5 * (dLat * 2) + 
		0.5 * (1 - (lat1Rad * 2)) * 0.5 * (1 - (lat2Rad * 2)) * 
		(1 - 0.5 * (dLon * 2))
	
	return earthRadiusKm * 2 * (a * (1 - a))
}

// Validation methods
func (s CourierStatus) IsValid() bool {
	switch s {
	case CourierStatusActive, CourierStatusInactive, CourierStatusBusy, 
		 CourierStatusOffline, CourierStatusUnavailable:
		return true
	default:
		return false
	}
}

func (v VehicleType) IsValid() bool {
	switch v {
	case VehicleTypeBicycle, VehicleTypeMotorbike, VehicleTypeCar, VehicleTypeWalking:
		return true
	default:
		return false
	}
}

func (s AssignmentStatus) IsValid() bool {
	switch s {
	case AssignmentStatusPending, AssignmentStatusAccepted, AssignmentStatusRejected,
		 AssignmentStatusCompleted, AssignmentStatusCanceled:
		return true
	default:
		return false
	}
}

// Business logic methods
func (c *Courier) IsAvailableForAssignment() bool {
	return c.Status == CourierStatusActive && c.IsOnline
}

func (c *Courier) CanServeLocation(location *Location, maxDistance float64) bool {
	if c.CurrentLocation == nil {
		return false
	}
	
	distance := c.CurrentLocation.DistanceTo(location)
	return distance <= maxDistance
}

func (c *Courier) IsInServiceArea(location *Location) bool {
	for _, area := range c.ServiceAreas {
		if !area.IsActive {
			continue
		}
		
		areaCenter := &Location{
			Latitude:  area.CenterLat,
			Longitude: area.CenterLng,
		}
		
		distance := location.DistanceTo(areaCenter)
		if distance <= area.RadiusKm {
			return true
		}
	}
	
	return false
}

func (c *Courier) IsWorkingNow() bool {
	now := time.Now()
	currentDay := int(now.Weekday())
	currentTime := now.Format("15:04")
	
	for _, wh := range c.WorkingHours {
		if wh.DayOfWeek == currentDay {
			if currentTime >= wh.StartTime && currentTime <= wh.EndTime {
				return true
			}
		}
	}
	
	return false
}

func (a *Assignment) CalculateETA(etaFactor float64) int {
	// Base ETA calculation: distance * factor + preparation time
	baseETA := int(a.EstimatedDistance * etaFactor)
	
	// Add preparation time based on vehicle type
	var prepTime int
	if a.Courier != nil {
		switch a.Courier.VehicleType {
		case VehicleTypeWalking:
			prepTime = 5
		case VehicleTypeBicycle:
			prepTime = 3
		case VehicleTypeMotorbike:
			prepTime = 2
		case VehicleTypeCar:
			prepTime = 2
		}
	}
	
	return baseETA + prepTime
}