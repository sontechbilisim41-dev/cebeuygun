package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/courier/internal/models"
	"github.com/google/uuid"
)

type AssignmentRepository interface {
	Create(assignment *models.Assignment) error
	GetByID(id uuid.UUID) (*models.Assignment, error)
	GetByOrderID(orderID uuid.UUID) (*models.Assignment, error)
	GetByCourierID(courierID uuid.UUID, status *models.AssignmentStatus, limit, offset int) ([]*models.Assignment, int64, error)
	UpdateStatus(id uuid.UUID, status models.AssignmentStatus, notes *string) error
	UpdateActualMetrics(id uuid.UUID, distance *float64, duration *int) error
	GetActiveAssignments(courierID uuid.UUID) ([]*models.Assignment, error)
	GetAssignmentHistory(orderID uuid.UUID) ([]*models.Assignment, error)
	
	// Round-robin support
	GetLastAssignedCourier() (uuid.UUID, error)
	SetLastAssignedCourier(courierID uuid.UUID) error
	
	// Performance queries
	GetAssignmentStats(courierID *uuid.UUID, fromDate, toDate *string) (map[string]interface{}, error)
}

type assignmentRepository struct {
	db *sql.DB
}

func NewAssignmentRepository(db *sql.DB) AssignmentRepository {
	return &assignmentRepository{db: db}
}

func (r *assignmentRepository) Create(assignment *models.Assignment) error {
	// Serialize locations to JSON
	pickupJSON, err := json.Marshal(assignment.PickupLocation)
	if err != nil {
		return fmt.Errorf("failed to serialize pickup location: %w", err)
	}
	
	deliveryJSON, err := json.Marshal(assignment.DeliveryLocation)
	if err != nil {
		return fmt.Errorf("failed to serialize delivery location: %w", err)
	}
	
	query := `
		INSERT INTO assignments (id, order_id, courier_id, status, pickup_location, delivery_location,
		                        estimated_distance, estimated_duration, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING assigned_at, created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		assignment.ID,
		assignment.OrderID,
		assignment.CourierID,
		assignment.Status,
		pickupJSON,
		deliveryJSON,
		assignment.EstimatedDistance,
		assignment.EstimatedDuration,
		assignment.Notes,
	).Scan(&assignment.AssignedAt, &assignment.CreatedAt, &assignment.UpdatedAt)
}

func (r *assignmentRepository) GetByID(id uuid.UUID) (*models.Assignment, error) {
	assignment := &models.Assignment{}
	query := `
		SELECT id, order_id, courier_id, status, assigned_at, accepted_at, rejected_at, completed_at,
		       pickup_location, delivery_location, estimated_distance, estimated_duration,
		       actual_distance, actual_duration, notes, created_at, updated_at
		FROM assignments WHERE id = $1`
	
	var pickupJSON, deliveryJSON []byte
	err := r.db.QueryRow(query, id).Scan(
		&assignment.ID,
		&assignment.OrderID,
		&assignment.CourierID,
		&assignment.Status,
		&assignment.AssignedAt,
		&assignment.AcceptedAt,
		&assignment.RejectedAt,
		&assignment.CompletedAt,
		&pickupJSON,
		&deliveryJSON,
		&assignment.EstimatedDistance,
		&assignment.EstimatedDuration,
		&assignment.ActualDistance,
		&assignment.ActualDuration,
		&assignment.Notes,
		&assignment.CreatedAt,
		&assignment.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Deserialize locations
	if err := json.Unmarshal(pickupJSON, &assignment.PickupLocation); err != nil {
		return nil, fmt.Errorf("failed to deserialize pickup location: %w", err)
	}
	
	if err := json.Unmarshal(deliveryJSON, &assignment.DeliveryLocation); err != nil {
		return nil, fmt.Errorf("failed to deserialize delivery location: %w", err)
	}
	
	return assignment, nil
}

func (r *assignmentRepository) GetByOrderID(orderID uuid.UUID) (*models.Assignment, error) {
	assignment := &models.Assignment{}
	query := `
		SELECT id, order_id, courier_id, status, assigned_at, accepted_at, rejected_at, completed_at,
		       pickup_location, delivery_location, estimated_distance, estimated_duration,
		       actual_distance, actual_duration, notes, created_at, updated_at
		FROM assignments WHERE order_id = $1`
	
	var pickupJSON, deliveryJSON []byte
	err := r.db.QueryRow(query, orderID).Scan(
		&assignment.ID,
		&assignment.OrderID,
		&assignment.CourierID,
		&assignment.Status,
		&assignment.AssignedAt,
		&assignment.AcceptedAt,
		&assignment.RejectedAt,
		&assignment.CompletedAt,
		&pickupJSON,
		&deliveryJSON,
		&assignment.EstimatedDistance,
		&assignment.EstimatedDuration,
		&assignment.ActualDistance,
		&assignment.ActualDuration,
		&assignment.Notes,
		&assignment.CreatedAt,
		&assignment.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Deserialize locations
	if err := json.Unmarshal(pickupJSON, &assignment.PickupLocation); err != nil {
		return nil, fmt.Errorf("failed to deserialize pickup location: %w", err)
	}
	
	if err := json.Unmarshal(deliveryJSON, &assignment.DeliveryLocation); err != nil {
		return nil, fmt.Errorf("failed to deserialize delivery location: %w", err)
	}
	
	return assignment, nil
}

func (r *assignmentRepository) GetByCourierID(courierID uuid.UUID, status *models.AssignmentStatus, limit, offset int) ([]*models.Assignment, int64, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	conditions = append(conditions, fmt.Sprintf("courier_id = $%d", argIndex))
	args = append(args, courierID)
	argIndex++

	if status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *status)
		argIndex++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM assignments %s", whereClause)
	var total int64
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := fmt.Sprintf(`
		SELECT id, order_id, courier_id, status, assigned_at, accepted_at, rejected_at, completed_at,
		       pickup_location, delivery_location, estimated_distance, estimated_duration,
		       actual_distance, actual_duration, notes, created_at, updated_at
		FROM assignments %s
		ORDER BY assigned_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argIndex, argIndex+1)
	
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var assignments []*models.Assignment
	for rows.Next() {
		assignment := &models.Assignment{}
		var pickupJSON, deliveryJSON []byte
		
		err := rows.Scan(
			&assignment.ID,
			&assignment.OrderID,
			&assignment.CourierID,
			&assignment.Status,
			&assignment.AssignedAt,
			&assignment.AcceptedAt,
			&assignment.RejectedAt,
			&assignment.CompletedAt,
			&pickupJSON,
			&deliveryJSON,
			&assignment.EstimatedDistance,
			&assignment.EstimatedDuration,
			&assignment.ActualDistance,
			&assignment.ActualDuration,
			&assignment.Notes,
			&assignment.CreatedAt,
			&assignment.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		
		// Deserialize locations
		if err := json.Unmarshal(pickupJSON, &assignment.PickupLocation); err == nil {
			if err := json.Unmarshal(deliveryJSON, &assignment.DeliveryLocation); err == nil {
				assignments = append(assignments, assignment)
			}
		}
	}

	return assignments, total, rows.Err()
}

func (r *assignmentRepository) UpdateStatus(id uuid.UUID, status models.AssignmentStatus, notes *string) error {
	var query string
	var args []interface{}
	
	switch status {
	case models.AssignmentStatusAccepted:
		query = `UPDATE assignments SET status = $1, accepted_at = now(), notes = COALESCE($2, notes) WHERE id = $3`
		args = []interface{}{status, notes, id}
	case models.AssignmentStatusRejected:
		query = `UPDATE assignments SET status = $1, rejected_at = now(), notes = COALESCE($2, notes) WHERE id = $3`
		args = []interface{}{status, notes, id}
	case models.AssignmentStatusCompleted:
		query = `UPDATE assignments SET status = $1, completed_at = now(), notes = COALESCE($2, notes) WHERE id = $3`
		args = []interface{}{status, notes, id}
	default:
		query = `UPDATE assignments SET status = $1, notes = COALESCE($2, notes) WHERE id = $3`
		args = []interface{}{status, notes, id}
	}
	
	result, err := r.db.Exec(query, args...)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("assignment not found")
	}

	return nil
}

func (r *assignmentRepository) UpdateActualMetrics(id uuid.UUID, distance *float64, duration *int) error {
	query := `
		UPDATE assignments 
		SET actual_distance = $2, actual_duration = $3, updated_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id, distance, duration)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("assignment not found")
	}

	return nil
}

func (r *assignmentRepository) GetActiveAssignments(courierID uuid.UUID) ([]*models.Assignment, error) {
	query := `
		SELECT id, order_id, courier_id, status, assigned_at, accepted_at, rejected_at, completed_at,
		       pickup_location, delivery_location, estimated_distance, estimated_duration,
		       actual_distance, actual_duration, notes, created_at, updated_at
		FROM assignments
		WHERE courier_id = $1 AND status IN ('PENDING', 'ACCEPTED')
		ORDER BY assigned_at`
	
	rows, err := r.db.Query(query, courierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*models.Assignment
	for rows.Next() {
		assignment := &models.Assignment{}
		var pickupJSON, deliveryJSON []byte
		
		err := rows.Scan(
			&assignment.ID,
			&assignment.OrderID,
			&assignment.CourierID,
			&assignment.Status,
			&assignment.AssignedAt,
			&assignment.AcceptedAt,
			&assignment.RejectedAt,
			&assignment.CompletedAt,
			&pickupJSON,
			&deliveryJSON,
			&assignment.EstimatedDistance,
			&assignment.EstimatedDuration,
			&assignment.ActualDistance,
			&assignment.ActualDuration,
			&assignment.Notes,
			&assignment.CreatedAt,
			&assignment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Deserialize locations
		if err := json.Unmarshal(pickupJSON, &assignment.PickupLocation); err == nil {
			if err := json.Unmarshal(deliveryJSON, &assignment.DeliveryLocation); err == nil {
				assignments = append(assignments, assignment)
			}
		}
	}

	return assignments, rows.Err()
}

func (r *assignmentRepository) GetAssignmentHistory(orderID uuid.UUID) ([]*models.Assignment, error) {
	query := `
		SELECT id, order_id, courier_id, status, assigned_at, accepted_at, rejected_at, completed_at,
		       pickup_location, delivery_location, estimated_distance, estimated_duration,
		       actual_distance, actual_duration, notes, created_at, updated_at
		FROM assignments
		WHERE order_id = $1
		ORDER BY assigned_at`
	
	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*models.Assignment
	for rows.Next() {
		assignment := &models.Assignment{}
		var pickupJSON, deliveryJSON []byte
		
		err := rows.Scan(
			&assignment.ID,
			&assignment.OrderID,
			&assignment.CourierID,
			&assignment.Status,
			&assignment.AssignedAt,
			&assignment.AcceptedAt,
			&assignment.RejectedAt,
			&assignment.CompletedAt,
			&pickupJSON,
			&deliveryJSON,
			&assignment.EstimatedDistance,
			&assignment.EstimatedDuration,
			&assignment.ActualDistance,
			&assignment.ActualDuration,
			&assignment.Notes,
			&assignment.CreatedAt,
			&assignment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Deserialize locations
		if err := json.Unmarshal(pickupJSON, &assignment.PickupLocation); err == nil {
			if err := json.Unmarshal(deliveryJSON, &assignment.DeliveryLocation); err == nil {
				assignments = append(assignments, assignment)
			}
		}
	}

	return assignments, rows.Err()
}

func (r *assignmentRepository) GetLastAssignedCourier() (uuid.UUID, error) {
	var courierID uuid.UUID
	query := `
		SELECT courier_id 
		FROM assignments 
		WHERE status != 'REJECTED'
		ORDER BY assigned_at DESC 
		LIMIT 1`
	
	err := r.db.QueryRow(query).Scan(&courierID)
	if err == sql.ErrNoRows {
		return uuid.Nil, nil
	}
	
	return courierID, err
}

func (r *assignmentRepository) SetLastAssignedCourier(courierID uuid.UUID) error {
	// This is handled automatically by the assignment creation
	// We could implement a separate tracking table if needed
	return nil
}

func (r *assignmentRepository) GetAssignmentStats(courierID *uuid.UUID, fromDate, toDate *string) (map[string]interface{}, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if courierID != nil {
		conditions = append(conditions, fmt.Sprintf("courier_id = $%d", argIndex))
		args = append(args, *courierID)
		argIndex++
	}

	if fromDate != nil {
		conditions = append(conditions, fmt.Sprintf("assigned_at >= $%d", argIndex))
		args = append(args, *fromDate)
		argIndex++
	}

	if toDate != nil {
		conditions = append(conditions, fmt.Sprintf("assigned_at <= $%d", argIndex))
		args = append(args, *toDate)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			COUNT(*) as total_assignments,
			COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_assignments,
			COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_assignments,
			COUNT(CASE WHEN status = 'CANCELED' THEN 1 END) as canceled_assignments,
			AVG(estimated_distance) as avg_distance,
			AVG(estimated_duration) as avg_duration,
			AVG(actual_distance) as avg_actual_distance,
			AVG(actual_duration) as avg_actual_duration
		FROM assignments %s`, whereClause)

	var stats struct {
		TotalAssignments     int
		CompletedAssignments int
		RejectedAssignments  int
		CanceledAssignments  int
		AvgDistance          sql.NullFloat64
		AvgDuration          sql.NullFloat64
		AvgActualDistance    sql.NullFloat64
		AvgActualDuration    sql.NullFloat64
	}

	err := r.db.QueryRow(query, args...).Scan(
		&stats.TotalAssignments,
		&stats.CompletedAssignments,
		&stats.RejectedAssignments,
		&stats.CanceledAssignments,
		&stats.AvgDistance,
		&stats.AvgDuration,
		&stats.AvgActualDistance,
		&stats.AvgActualDuration,
	)
	
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"total_assignments":     stats.TotalAssignments,
		"completed_assignments": stats.CompletedAssignments,
		"rejected_assignments":  stats.RejectedAssignments,
		"canceled_assignments":  stats.CanceledAssignments,
	}

	if stats.AvgDistance.Valid {
		result["avg_distance_km"] = stats.AvgDistance.Float64
	}
	if stats.AvgDuration.Valid {
		result["avg_duration_minutes"] = stats.AvgDuration.Float64
	}
	if stats.AvgActualDistance.Valid {
		result["avg_actual_distance_km"] = stats.AvgActualDistance.Float64
	}
	if stats.AvgActualDuration.Valid {
		result["avg_actual_duration_minutes"] = stats.AvgActualDuration.Float64
	}

	// Calculate success rate
	if stats.TotalAssignments > 0 {
		successRate := float64(stats.CompletedAssignments) / float64(stats.TotalAssignments) * 100
		result["success_rate_percent"] = successRate
	}

	return result, nil
}