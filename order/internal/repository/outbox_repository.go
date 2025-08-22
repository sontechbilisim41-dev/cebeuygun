package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cebeuygun/platform/services/order/internal/models"
	"github.com/google/uuid"
)

type OutboxRepository interface {
	Create(event *models.OutboxEvent) error
	GetUnpublished(limit int) ([]*models.OutboxEvent, error)
	MarkAsPublished(id uuid.UUID) error
	MarkAsPublishedBatch(ids []uuid.UUID) error
	DeleteOldEvents(olderThan time.Time) error
}

type outboxRepository struct {
	db *sql.DB
}

func NewOutboxRepository(db *sql.DB) OutboxRepository {
	return &outboxRepository{db: db}
}

func (r *outboxRepository) Create(event *models.OutboxEvent) error {
	eventDataJSON, err := json.Marshal(event.EventData)
	if err != nil {
		return fmt.Errorf("failed to serialize event data: %w", err)
	}
	
	query := `
		INSERT INTO outbox_events (id, aggregate_id, event_type, event_data, published)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at`
	
	return r.db.QueryRow(
		query,
		event.ID,
		event.AggregateID,
		event.EventType,
		eventDataJSON,
		event.Published,
	).Scan(&event.CreatedAt)
}

func (r *outboxRepository) GetUnpublished(limit int) ([]*models.OutboxEvent, error) {
	query := `
		SELECT id, aggregate_id, event_type, event_data, published, created_at, published_at
		FROM outbox_events
		WHERE published = false
		ORDER BY created_at
		LIMIT $1`
	
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var events []*models.OutboxEvent
	for rows.Next() {
		event := &models.OutboxEvent{}
		var eventDataJSON []byte
		
		err := rows.Scan(
			&event.ID,
			&event.AggregateID,
			&event.EventType,
			&eventDataJSON,
			&event.Published,
			&event.CreatedAt,
			&event.PublishedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Deserialize event data
		if len(eventDataJSON) > 0 {
			if err := json.Unmarshal(eventDataJSON, &event.EventData); err != nil {
				return nil, fmt.Errorf("failed to deserialize event data: %w", err)
			}
		}
		
		events = append(events, event)
	}
	
	return events, rows.Err()
}

func (r *outboxRepository) MarkAsPublished(id uuid.UUID) error {
	query := `
		UPDATE outbox_events 
		SET published = true, published_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("outbox event not found")
	}
	
	return nil
}

func (r *outboxRepository) MarkAsPublishedBatch(ids []uuid.UUID) error {
	if len(ids) == 0 {
		return nil
	}
	
	// Build placeholders for IN clause
	placeholders := make([]string, len(ids))
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}
	
	query := fmt.Sprintf(`
		UPDATE outbox_events 
		SET published = true, published_at = now()
		WHERE id IN (%s)`, strings.Join(placeholders, ","))
	
	_, err := r.db.Exec(query, args...)
	return err
}

func (r *outboxRepository) DeleteOldEvents(olderThan time.Time) error {
	query := `
		DELETE FROM outbox_events 
		WHERE published = true AND published_at < $1`
	
	_, err := r.db.Exec(query, olderThan)
	return err
}