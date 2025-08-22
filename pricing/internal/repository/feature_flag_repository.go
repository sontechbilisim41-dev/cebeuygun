package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/google/uuid"
)

type FeatureFlagRepository interface {
	CreateFeatureFlag(flag *models.FeatureFlag) error
	GetFeatureFlagByID(id uuid.UUID) (*models.FeatureFlag, error)
	GetFeatureFlagByKey(key string) (*models.FeatureFlag, error)
	GetAllFeatureFlags(enabledOnly bool) ([]*models.FeatureFlag, error)
	UpdateFeatureFlag(id uuid.UUID, updates *models.UpdateFeatureFlagRequest) error
	DeleteFeatureFlag(id uuid.UUID) error
	EvaluateFeatureFlag(key string, context map[string]interface{}) (interface{}, error)
}

type featureFlagRepository struct {
	db *sql.DB
}

func NewFeatureFlagRepository(db *sql.DB) FeatureFlagRepository {
	return &featureFlagRepository{db: db}
}

func (r *featureFlagRepository) CreateFeatureFlag(flag *models.FeatureFlag) error {
	valueJSON, err := json.Marshal(flag.Value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	var rolloutJSON []byte
	if flag.Rollout != nil {
		rolloutJSON, err = json.Marshal(flag.Rollout)
		if err != nil {
			return fmt.Errorf("failed to marshal rollout: %w", err)
		}
	}

	query := `
		INSERT INTO feature_flags (id, key, name, description, type, value, is_enabled, rollout)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		flag.ID,
		flag.Key,
		flag.Name,
		flag.Description,
		flag.Type,
		valueJSON,
		flag.IsEnabled,
		rolloutJSON,
	).Scan(&flag.CreatedAt, &flag.UpdatedAt)
}

func (r *featureFlagRepository) GetFeatureFlagByID(id uuid.UUID) (*models.FeatureFlag, error) {
	flag := &models.FeatureFlag{}
	query := `
		SELECT id, key, name, description, type, value, is_enabled, rollout, created_at, updated_at
		FROM feature_flags WHERE id = $1`
	
	var valueJSON, rolloutJSON []byte
	err := r.db.QueryRow(query, id).Scan(
		&flag.ID,
		&flag.Key,
		&flag.Name,
		&flag.Description,
		&flag.Type,
		&valueJSON,
		&flag.IsEnabled,
		&rolloutJSON,
		&flag.CreatedAt,
		&flag.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Unmarshal JSON fields
	if err := json.Unmarshal(valueJSON, &flag.Value); err != nil {
		return nil, fmt.Errorf("failed to unmarshal value: %w", err)
	}
	
	if len(rolloutJSON) > 0 {
		if err := json.Unmarshal(rolloutJSON, &flag.Rollout); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rollout: %w", err)
		}
	}
	
	return flag, nil
}

func (r *featureFlagRepository) GetFeatureFlagByKey(key string) (*models.FeatureFlag, error) {
	flag := &models.FeatureFlag{}
	query := `
		SELECT id, key, name, description, type, value, is_enabled, rollout, created_at, updated_at
		FROM feature_flags WHERE key = $1`
	
	var valueJSON, rolloutJSON []byte
	err := r.db.QueryRow(query, key).Scan(
		&flag.ID,
		&flag.Key,
		&flag.Name,
		&flag.Description,
		&flag.Type,
		&valueJSON,
		&flag.IsEnabled,
		&rolloutJSON,
		&flag.CreatedAt,
		&flag.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Unmarshal JSON fields
	if err := json.Unmarshal(valueJSON, &flag.Value); err != nil {
		return nil, fmt.Errorf("failed to unmarshal value: %w", err)
	}
	
	if len(rolloutJSON) > 0 {
		if err := json.Unmarshal(rolloutJSON, &flag.Rollout); err != nil {
			return nil, fmt.Errorf("failed to unmarshal rollout: %w", err)
		}
	}
	
	return flag, nil
}

func (r *featureFlagRepository) GetAllFeatureFlags(enabledOnly bool) ([]*models.FeatureFlag, error) {
	query := `
		SELECT id, key, name, description, type, value, is_enabled, rollout, created_at, updated_at
		FROM feature_flags`
	
	if enabledOnly {
		query += " WHERE is_enabled = true"
	}
	
	query += " ORDER BY key"

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flags []*models.FeatureFlag
	for rows.Next() {
		flag := &models.FeatureFlag{}
		var valueJSON, rolloutJSON []byte
		
		err := rows.Scan(
			&flag.ID,
			&flag.Key,
			&flag.Name,
			&flag.Description,
			&flag.Type,
			&valueJSON,
			&flag.IsEnabled,
			&rolloutJSON,
			&flag.CreatedAt,
			&flag.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Unmarshal JSON fields
		if err := json.Unmarshal(valueJSON, &flag.Value); err != nil {
			continue // Skip invalid flags
		}
		
		if len(rolloutJSON) > 0 {
			if err := json.Unmarshal(rolloutJSON, &flag.Rollout); err == nil {
				// Only set if unmarshal succeeds
			}
		}
		
		flags = append(flags, flag)
	}

	return flags, rows.Err()
}

func (r *featureFlagRepository) UpdateFeatureFlag(id uuid.UUID, updates *models.UpdateFeatureFlagRequest) error {
	var setParts []string
	var args []interface{}
	argIndex := 1

	if updates.Name != nil {
		setParts = append(setParts, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, *updates.Name)
		argIndex++
	}

	if updates.Description != nil {
		setParts = append(setParts, fmt.Sprintf("description = $%d", argIndex))
		args = append(args, *updates.Description)
		argIndex++
	}

	if updates.Value != nil {
		valueJSON, err := json.Marshal(updates.Value)
		if err != nil {
			return fmt.Errorf("failed to marshal value: %w", err)
		}
		setParts = append(setParts, fmt.Sprintf("value = $%d", argIndex))
		args = append(args, valueJSON)
		argIndex++
	}

	if updates.IsEnabled != nil {
		setParts = append(setParts, fmt.Sprintf("is_enabled = $%d", argIndex))
		args = append(args, *updates.IsEnabled)
		argIndex++
	}

	if updates.Rollout != nil {
		rolloutJSON, err := json.Marshal(updates.Rollout)
		if err != nil {
			return fmt.Errorf("failed to marshal rollout: %w", err)
		}
		setParts = append(setParts, fmt.Sprintf("rollout = $%d", argIndex))
		args = append(args, rolloutJSON)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE feature_flags SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
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
		return fmt.Errorf("feature flag not found")
	}

	return nil
}

func (r *featureFlagRepository) DeleteFeatureFlag(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM feature_flags WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("feature flag not found")
	}

	return nil
}

func (r *featureFlagRepository) EvaluateFeatureFlag(key string, context map[string]interface{}) (interface{}, error) {
	flag, err := r.GetFeatureFlagByKey(key)
	if err != nil {
		return nil, err
	}

	if flag == nil || !flag.IsEnabled {
		return nil, fmt.Errorf("feature flag not found or disabled")
	}

	// Simple rollout evaluation
	if flag.Rollout != nil {
		// Check user segments
		if len(flag.Rollout.UserSegments) > 0 {
			userSegment, ok := context["user_segment"].(string)
			if !ok || !contains(flag.Rollout.UserSegments, userSegment) {
				return nil, fmt.Errorf("user not in rollout segment")
			}
		}

		// Check regions
		if len(flag.Rollout.Regions) > 0 {
			region, ok := context["region"].(string)
			if !ok || !contains(flag.Rollout.Regions, region) {
				return nil, fmt.Errorf("region not in rollout")
			}
		}

		// Check percentage rollout (simplified)
		if !flag.Rollout.Percentage.IsZero() && flag.Rollout.Percentage.LessThan(decimal.NewFromInt(100)) {
			// In real implementation, this would use consistent hashing
			// For demo, we'll use a simple random check
			userID, ok := context["user_id"].(string)
			if ok {
				hash := simpleHash(userID)
				threshold := flag.Rollout.Percentage.InexactFloat64()
				if float64(hash%100) >= threshold {
					return nil, fmt.Errorf("user not in percentage rollout")
				}
			}
		}
	}

	return flag.Value, nil
}

// Helper functions
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func simpleHash(s string) int {
	hash := 0
	for _, c := range s {
		hash = hash*31 + int(c)
	}
	if hash < 0 {
		hash = -hash
	}
	return hash
}