package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/cebeuygun/platform/services/auth/internal/models"
	"github.com/google/uuid"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	GetUserByPhone(phone string) (*models.User, error)
	GetUserByID(id uuid.UUID) (*models.User, error)
	UpdateUser(user *models.User) error
	UpdateLastLogin(userID uuid.UUID) error
	
	CreateRefreshToken(token *models.RefreshToken) error
	GetRefreshToken(tokenHash string) (*models.RefreshToken, error)
	DeleteRefreshToken(tokenHash string) error
	DeleteUserRefreshTokens(userID uuid.UUID) error
	
	CreateOrUpdateDevice(device *models.Device) error
	GetUserDevices(userID uuid.UUID) ([]*models.Device, error)
	DeactivateDevice(userID uuid.UUID, deviceID string) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, phone, email, password_hash, first_name, last_name, role, status, phone_verified, email_verified)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		user.ID,
		user.Phone,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.PhoneVerified,
		user.EmailVerified,
	).Scan(&user.CreatedAt, &user.UpdatedAt)
}

func (r *userRepository) GetUserByPhone(phone string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, phone, email, password_hash, first_name, last_name, role, status, 
		       phone_verified, email_verified, last_login_at, created_at, updated_at
		FROM users WHERE phone = $1`
	
	err := r.db.QueryRow(query, phone).Scan(
		&user.ID,
		&user.Phone,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.PhoneVerified,
		&user.EmailVerified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return user, err
}

func (r *userRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, phone, email, password_hash, first_name, last_name, role, status, 
		       phone_verified, email_verified, last_login_at, created_at, updated_at
		FROM users WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Phone,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.Status,
		&user.PhoneVerified,
		&user.EmailVerified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return user, err
}

func (r *userRepository) UpdateUser(user *models.User) error {
	query := `
		UPDATE users 
		SET email = $2, password_hash = $3, first_name = $4, last_name = $5, 
		    role = $6, status = $7, phone_verified = $8, email_verified = $9
		WHERE id = $1`
	
	_, err := r.db.Exec(
		query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.Role,
		user.Status,
		user.PhoneVerified,
		user.EmailVerified,
	)
	
	return err
}

func (r *userRepository) UpdateLastLogin(userID uuid.UUID) error {
	query := `UPDATE users SET last_login_at = $1 WHERE id = $2`
	_, err := r.db.Exec(query, time.Now(), userID)
	return err
}

func (r *userRepository) CreateRefreshToken(token *models.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token_hash, device_id, device_info, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at`
	
	return r.db.QueryRow(
		query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.DeviceID,
		token.DeviceInfo,
		token.ExpiresAt,
	).Scan(&token.CreatedAt)
}

func (r *userRepository) GetRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	token := &models.RefreshToken{}
	query := `
		SELECT id, user_id, token_hash, device_id, device_info, expires_at, created_at
		FROM refresh_tokens 
		WHERE token_hash = $1 AND expires_at > NOW()`
	
	err := r.db.QueryRow(query, tokenHash).Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.DeviceID,
		&token.DeviceInfo,
		&token.ExpiresAt,
		&token.CreatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return token, err
}

func (r *userRepository) DeleteRefreshToken(tokenHash string) error {
	query := `DELETE FROM refresh_tokens WHERE token_hash = $1`
	_, err := r.db.Exec(query, tokenHash)
	return err
}

func (r *userRepository) DeleteUserRefreshTokens(userID uuid.UUID) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

func (r *userRepository) CreateOrUpdateDevice(device *models.Device) error {
	query := `
		INSERT INTO devices (id, user_id, device_id, device_name, device_type, platform, push_token, is_active, last_seen_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id, device_id) 
		DO UPDATE SET 
			device_name = EXCLUDED.device_name,
			device_type = EXCLUDED.device_type,
			platform = EXCLUDED.platform,
			push_token = EXCLUDED.push_token,
			is_active = EXCLUDED.is_active,
			last_seen_at = EXCLUDED.last_seen_at
		RETURNING created_at`
	
	return r.db.QueryRow(
		query,
		device.ID,
		device.UserID,
		device.DeviceID,
		device.DeviceName,
		device.DeviceType,
		device.Platform,
		device.PushToken,
		device.IsActive,
		device.LastSeenAt,
	).Scan(&device.CreatedAt)
}

func (r *userRepository) GetUserDevices(userID uuid.UUID) ([]*models.Device, error) {
	query := `
		SELECT id, user_id, device_id, device_name, device_type, platform, push_token, is_active, last_seen_at, created_at
		FROM devices 
		WHERE user_id = $1 AND is_active = true
		ORDER BY last_seen_at DESC`
	
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var devices []*models.Device
	for rows.Next() {
		device := &models.Device{}
		err := rows.Scan(
			&device.ID,
			&device.UserID,
			&device.DeviceID,
			&device.DeviceName,
			&device.DeviceType,
			&device.Platform,
			&device.PushToken,
			&device.IsActive,
			&device.LastSeenAt,
			&device.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		devices = append(devices, device)
	}
	
	return devices, rows.Err()
}

func (r *userRepository) DeactivateDevice(userID uuid.UUID, deviceID string) error {
	query := `UPDATE devices SET is_active = false WHERE user_id = $1 AND device_id = $2`
	result, err := r.db.Exec(query, userID, deviceID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("device not found")
	}
	
	return nil
}