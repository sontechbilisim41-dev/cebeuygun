package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/courier/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type CourierRepository interface {
	Create(courier *models.Courier) error
	GetByID(id uuid.UUID) (*models.Courier, error)
	GetByUserID(userID uuid.UUID) (*models.Courier, error)
	Update(id uuid.UUID, updates *models.UpdateCourierRequest) error
	Delete(id uuid.UUID) error
	GetAll(status *models.CourierStatus, vehicleType *models.VehicleType, limit, offset int) ([]*models.Courier, int64, error)
	
	// Location management
	UpdateLocation(courierID uuid.UUID, location *models.Location) error
	GetCurrentLocation(courierID uuid.UUID) (*models.Location, error)
	GetLocationHistory(courierID uuid.UUID, limit int) ([]*models.CourierLocationUpdate, error)
	
	// Service areas
	CreateServiceArea(area *models.ServiceArea) error
	GetServiceAreas(courierID uuid.UUID) ([]*models.ServiceArea, error)
	UpdateServiceArea(id uuid.UUID, area *models.ServiceArea) error
	DeleteServiceArea(id uuid.UUID) error
	
	// Working hours
	SetWorkingHours(courierID uuid.UUID, hours []*models.WorkingHours) error
	GetWorkingHours(courierID uuid.UUID) ([]*models.WorkingHours, error)
	
	// Availability queries
	FindAvailableCouriers(location *models.Location, maxDistance float64, vehicleType *models.VehicleType) ([]*models.Courier, error)
	GetCourierPerformanceStats(courierID uuid.UUID) (*models.CourierPerformanceStats, error)
	
	// Status management
	UpdateStatus(courierID uuid.UUID, status models.CourierStatus) error
	SetOnlineStatus(courierID uuid.UUID, isOnline bool) error
}

type courierRepository struct {
	db *sql.DB
}

func NewCourierRepository(db *sql.DB) CourierRepository {
	return &courierRepository{db: db}
}

func (r *courierRepository) Create(courier *models.Courier) error {
	query := `
		INSERT INTO couriers (id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate, status, rating, is_online)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		courier.ID,
		courier.UserID,
		courier.FirstName,
		courier.LastName,
		courier.Phone,
		courier.Email,
		courier.VehicleType,
		courier.VehiclePlate,
		courier.Status,
		courier.Rating,
		courier.IsOnline,
	).Scan(&courier.CreatedAt, &courier.UpdatedAt)
}

func (r *courierRepository) GetByID(id uuid.UUID) (*models.Courier, error) {
	courier := &models.Courier{}
	query := `
		SELECT id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate,
		       status, rating, completed_orders, is_online, last_seen_at, created_at, updated_at
		FROM couriers WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&courier.ID,
		&courier.UserID,
		&courier.FirstName,
		&courier.LastName,
		&courier.Phone,
		&courier.Email,
		&courier.VehicleType,
		&courier.VehiclePlate,
		&courier.Status,
		&courier.Rating,
		&courier.CompletedOrders,
		&courier.IsOnline,
		&courier.LastSeenAt,
		&courier.CreatedAt,
		&courier.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Load current location
	location, _ := r.GetCurrentLocation(courier.ID)
	courier.CurrentLocation = location
	
	// Load service areas
	serviceAreas, _ := r.GetServiceAreas(courier.ID)
	courier.ServiceAreas = serviceAreas
	
	// Load working hours
	workingHours, _ := r.GetWorkingHours(courier.ID)
	courier.WorkingHours = workingHours
	
	return courier, nil
}

func (r *courierRepository) GetByUserID(userID uuid.UUID) (*models.Courier, error) {
	courier := &models.Courier{}
	query := `
		SELECT id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate,
		       status, rating, completed_orders, is_online, last_seen_at, created_at, updated_at
		FROM couriers WHERE user_id = $1`
	
	err := r.db.QueryRow(query, userID).Scan(
		&courier.ID,
		&courier.UserID,
		&courier.FirstName,
		&courier.LastName,
		&courier.Phone,
		&courier.Email,
		&courier.VehicleType,
		&courier.VehiclePlate,
		&courier.Status,
		&courier.Rating,
		&courier.CompletedOrders,
		&courier.IsOnline,
		&courier.LastSeenAt,
		&courier.CreatedAt,
		&courier.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return courier, err
}

func (r *courierRepository) Update(id uuid.UUID, updates *models.UpdateCourierRequest) error {
	var setParts []string
	var args []interface{}
	argIndex := 1

	if updates.FirstName != nil {
		setParts = append(setParts, fmt.Sprintf("first_name = $%d", argIndex))
		args = append(args, *updates.FirstName)
		argIndex++
	}

	if updates.LastName != nil {
		setParts = append(setParts, fmt.Sprintf("last_name = $%d", argIndex))
		args = append(args, *updates.LastName)
		argIndex++
	}

	if updates.Phone != nil {
		setParts = append(setParts, fmt.Sprintf("phone = $%d", argIndex))
		args = append(args, *updates.Phone)
		argIndex++
	}

	if updates.Email != nil {
		setParts = append(setParts, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, *updates.Email)
		argIndex++
	}

	if updates.VehicleType != nil {
		setParts = append(setParts, fmt.Sprintf("vehicle_type = $%d", argIndex))
		args = append(args, *updates.VehicleType)
		argIndex++
	}

	if updates.VehiclePlate != nil {
		setParts = append(setParts, fmt.Sprintf("vehicle_plate = $%d", argIndex))
		args = append(args, *updates.VehiclePlate)
		argIndex++
	}

	if updates.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *updates.Status)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE couriers SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
	args = append(args, id)

	result, err := r.db.Exec(query, args...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("courier not found")
	}

	return nil
}

func (r *courierRepository) Delete(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM couriers WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("courier not found")
	}

	return nil
}

func (r *courierRepository) GetAll(status *models.CourierStatus, vehicleType *models.VehicleType, limit, offset int) ([]*models.Courier, int64, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *status)
		argIndex++
	}

	if vehicleType != nil {
		conditions = append(conditions, fmt.Sprintf("vehicle_type = $%d", argIndex))
		args = append(args, *vehicleType)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM couriers %s", whereClause)
	var total int64
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := fmt.Sprintf(`
		SELECT id, user_id, first_name, last_name, phone, email, vehicle_type, vehicle_plate,
		       status, rating, completed_orders, is_online, last_seen_at, created_at, updated_at
		FROM couriers %s
		ORDER BY rating DESC, completed_orders DESC
		LIMIT $%d OFFSET $%d`, whereClause, argIndex, argIndex+1)
	
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var couriers []*models.Courier
	for rows.Next() {
		courier := &models.Courier{}
		err := rows.Scan(
			&courier.ID,
			&courier.UserID,
			&courier.FirstName,
			&courier.LastName,
			&courier.Phone,
			&courier.Email,
			&courier.VehicleType,
			&courier.VehiclePlate,
			&courier.Status,
			&courier.Rating,
			&courier.CompletedOrders,
			&courier.IsOnline,
			&courier.LastSeenAt,
			&courier.CreatedAt,
			&courier.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		couriers = append(couriers, courier)
	}

	return couriers, total, rows.Err()
}

func (r *courierRepository) UpdateLocation(courierID uuid.UUID, location *models.Location) error {
	// Insert new location record
	query := `
		INSERT INTO courier_locations (courier_id, latitude, longitude, address, timestamp)
		VALUES ($1, $2, $3, $4, now())`
	
	_, err := r.db.Exec(query, courierID, location.Latitude, location.Longitude, location.Address)
	if err != nil {
		return err
	}
	
	// Update courier's last_seen_at
	_, err = r.db.Exec("UPDATE couriers SET last_seen_at = now() WHERE id = $1", courierID)
	return err
}

func (r *courierRepository) GetCurrentLocation(courierID uuid.UUID) (*models.Location, error) {
	location := &models.Location{}
	query := `
		SELECT latitude, longitude, address
		FROM courier_locations
		WHERE courier_id = $1
		ORDER BY timestamp DESC
		LIMIT 1`
	
	err := r.db.QueryRow(query, courierID).Scan(
		&location.Latitude,
		&location.Longitude,
		&location.Address,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return location, err
}

func (r *courierRepository) GetLocationHistory(courierID uuid.UUID, limit int) ([]*models.CourierLocationUpdate, error) {
	query := `
		SELECT latitude, longitude, address, accuracy, speed, heading, timestamp
		FROM courier_locations
		WHERE courier_id = $1
		ORDER BY timestamp DESC
		LIMIT $2`
	
	rows, err := r.db.Query(query, courierID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var updates []*models.CourierLocationUpdate
	for rows.Next() {
		update := &models.CourierLocationUpdate{
			CourierID: courierID,
		}
		
		err := rows.Scan(
			&update.Location.Latitude,
			&update.Location.Longitude,
			&update.Location.Address,
			&update.Accuracy,
			&update.Speed,
			&update.Heading,
			&update.Timestamp,
		)
		if err != nil {
			return nil, err
		}
		updates = append(updates, update)
	}
	
	return updates, rows.Err()
}

func (r *courierRepository) CreateServiceArea(area *models.ServiceArea) error {
	query := `
		INSERT INTO courier_service_areas (id, courier_id, center_lat, center_lng, radius_km, city, district, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		area.ID,
		area.CourierID,
		area.CenterLat,
		area.CenterLng,
		area.RadiusKm,
		area.City,
		area.District,
		area.IsActive,
	).Scan(&area.CreatedAt, &area.UpdatedAt)
}

func (r *courierRepository) GetServiceAreas(courierID uuid.UUID) ([]*models.ServiceArea, error) {
	query := `
		SELECT id, courier_id, center_lat, center_lng, radius_km, city, district, is_active, created_at, updated_at
		FROM courier_service_areas
		WHERE courier_id = $1 AND is_active = true
		ORDER BY city, district`
	
	rows, err := r.db.Query(query, courierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var areas []*models.ServiceArea
	for rows.Next() {
		area := &models.ServiceArea{}
		err := rows.Scan(
			&area.ID,
			&area.CourierID,
			&area.CenterLat,
			&area.CenterLng,
			&area.RadiusKm,
			&area.City,
			&area.District,
			&area.IsActive,
			&area.CreatedAt,
			&area.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		areas = append(areas, area)
	}
	
	return areas, rows.Err()
}

func (r *courierRepository) UpdateServiceArea(id uuid.UUID, area *models.ServiceArea) error {
	query := `
		UPDATE courier_service_areas 
		SET center_lat = $2, center_lng = $3, radius_km = $4, city = $5, district = $6, is_active = $7
		WHERE id = $1`
	
	result, err := r.db.Exec(
		query,
		id,
		area.CenterLat,
		area.CenterLng,
		area.RadiusKm,
		area.City,
		area.District,
		area.IsActive,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("service area not found")
	}

	return nil
}

func (r *courierRepository) DeleteServiceArea(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM courier_service_areas WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("service area not found")
	}

	return nil
}

func (r *courierRepository) SetWorkingHours(courierID uuid.UUID, hours []*models.WorkingHours) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Delete existing working hours
	_, err = tx.Exec("DELETE FROM courier_working_hours WHERE courier_id = $1", courierID)
	if err != nil {
		return err
	}
	
	// Insert new working hours
	for _, wh := range hours {
		query := `
			INSERT INTO courier_working_hours (id, courier_id, day_of_week, start_time, end_time, is_active)
			VALUES ($1, $2, $3, $4, $5, $6)`
		
		_, err = tx.Exec(
			query,
			uuid.New(),
			courierID,
			wh.DayOfWeek,
			wh.StartTime,
			wh.EndTime,
			true,
		)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

func (r *courierRepository) GetWorkingHours(courierID uuid.UUID) ([]*models.WorkingHours, error) {
	query := `
		SELECT day_of_week, start_time, end_time
		FROM courier_working_hours
		WHERE courier_id = $1 AND is_active = true
		ORDER BY day_of_week`
	
	rows, err := r.db.Query(query, courierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var hours []*models.WorkingHours
	for rows.Next() {
		wh := &models.WorkingHours{}
		err := rows.Scan(
			&wh.DayOfWeek,
			&wh.StartTime,
			&wh.EndTime,
		)
		if err != nil {
			return nil, err
		}
		hours = append(hours, wh)
	}
	
	return hours, rows.Err()
}

func (r *courierRepository) FindAvailableCouriers(location *models.Location, maxDistance float64, vehicleType *models.VehicleType) ([]*models.Courier, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Base conditions for availability
	conditions = append(conditions, "c.status = 'ACTIVE'")
	conditions = append(conditions, "c.is_online = true")
	conditions = append(conditions, "cl.timestamp > now() - interval '5 minutes'")

	// Vehicle type filter
	if vehicleType != nil {
		conditions = append(conditions, fmt.Sprintf("c.vehicle_type = $%d", argIndex))
		args = append(args, *vehicleType)
		argIndex++
	}

	// Distance filter
	conditions = append(conditions, fmt.Sprintf("calculate_distance(cl.latitude, cl.longitude, $%d, $%d) <= $%d", argIndex, argIndex+1, argIndex+2))
	args = append(args, location.Latitude, location.Longitude, maxDistance)
	argIndex += 3

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	query := fmt.Sprintf(`
		SELECT c.id, c.user_id, c.first_name, c.last_name, c.phone, c.email, c.vehicle_type, c.vehicle_plate,
		       c.status, c.rating, c.completed_orders, c.is_online, c.last_seen_at, c.created_at, c.updated_at,
		       cl.latitude, cl.longitude, cl.address,
		       calculate_distance(cl.latitude, cl.longitude, $1, $2) as distance
		FROM couriers c
		JOIN courier_locations cl ON c.id = cl.courier_id
		%s
		ORDER BY distance, c.rating DESC, c.completed_orders DESC
		LIMIT 50`, whereClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var couriers []*models.Courier
	for rows.Next() {
		courier := &models.Courier{}
		location := &models.Location{}
		var distance float64
		
		err := rows.Scan(
			&courier.ID,
			&courier.UserID,
			&courier.FirstName,
			&courier.LastName,
			&courier.Phone,
			&courier.Email,
			&courier.VehicleType,
			&courier.VehiclePlate,
			&courier.Status,
			&courier.Rating,
			&courier.CompletedOrders,
			&courier.IsOnline,
			&courier.LastSeenAt,
			&courier.CreatedAt,
			&courier.UpdatedAt,
			&location.Latitude,
			&location.Longitude,
			&location.Address,
			&distance,
		)
		if err != nil {
			return nil, err
		}
		
		courier.CurrentLocation = location
		courier.CurrentDistance = &distance
		couriers = append(couriers, courier)
	}

	return couriers, rows.Err()
}

func (r *courierRepository) GetCourierPerformanceStats(courierID uuid.UUID) (*models.CourierPerformanceStats, error) {
	stats := &models.CourierPerformanceStats{
		CourierID: courierID,
	}
	
	query := `
		SELECT 
			c.completed_orders,
			c.rating,
			COALESCE(COUNT(a.id), 0) as total_assignments,
			COALESCE(COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END), 0) as completed_assignments,
			COALESCE(COUNT(CASE WHEN a.status = 'CANCELED' THEN 1 END), 0) as canceled_assignments,
			COALESCE(AVG(a.actual_duration), 0) as avg_delivery_time,
			c.last_seen_at
		FROM couriers c
		LEFT JOIN assignments a ON c.id = a.courier_id
		WHERE c.id = $1
		GROUP BY c.id, c.completed_orders, c.rating, c.last_seen_at`
	
	var avgDeliveryTime sql.NullFloat64
	err := r.db.QueryRow(query, courierID).Scan(
		&stats.CompletedOrders,
		&stats.AverageRating,
		&stats.TotalAssignments,
		&stats.CompletedOrders, // This will be overwritten
		&stats.CanceledOrders,
		&avgDeliveryTime,
		&stats.LastActiveDate,
	)
	
	if err != nil {
		return nil, err
	}
	
	if avgDeliveryTime.Valid {
		stats.AverageDeliveryTime = int(avgDeliveryTime.Float64)
	}
	
	// Calculate on-time delivery rate
	if stats.CompletedOrders > 0 {
		stats.OnTimeDeliveryRate = float64(stats.CompletedOrders) / float64(stats.TotalAssignments) * 100
	}
	
	return stats, nil
}

func (r *courierRepository) UpdateStatus(courierID uuid.UUID, status models.CourierStatus) error {
	query := `UPDATE couriers SET status = $1, updated_at = now() WHERE id = $2`
	
	result, err := r.db.Exec(query, status, courierID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("courier not found")
	}

	return nil
}

func (r *courierRepository) SetOnlineStatus(courierID uuid.UUID, isOnline bool) error {
	query := `UPDATE couriers SET is_online = $1, last_seen_at = now(), updated_at = now() WHERE id = $2`
	
	result, err := r.db.Exec(query, isOnline, courierID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("courier not found")
	}

	return nil
}