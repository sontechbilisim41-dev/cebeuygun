package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string
type UserStatus string

const (
	RoleCustomer UserRole = "CUSTOMER"
	RoleCourier  UserRole = "COURIER"
	RoleSeller   UserRole = "SELLER"
	RoleAdmin    UserRole = "ADMIN"

	StatusPending   UserStatus = "PENDING"
	StatusActive    UserStatus = "ACTIVE"
	StatusSuspended UserStatus = "SUSPENDED"
	StatusBanned    UserStatus = "BANNED"
)

type User struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	Phone          string     `json:"phone" db:"phone"`
	Email          *string    `json:"email,omitempty" db:"email"`
	PasswordHash   *string    `json:"-" db:"password_hash"`
	FirstName      string     `json:"first_name" db:"first_name"`
	LastName       string     `json:"last_name" db:"last_name"`
	Role           UserRole   `json:"role" db:"role"`
	Status         UserStatus `json:"status" db:"status"`
	PhoneVerified  bool       `json:"phone_verified" db:"phone_verified"`
	EmailVerified  bool       `json:"email_verified" db:"email_verified"`
	LastLoginAt    *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
}

type RefreshToken struct {
	ID         uuid.UUID `json:"id" db:"id"`
	UserID     uuid.UUID `json:"user_id" db:"user_id"`
	TokenHash  string    `json:"-" db:"token_hash"`
	DeviceID   *string   `json:"device_id,omitempty" db:"device_id"`
	DeviceInfo *string   `json:"device_info,omitempty" db:"device_info"`
	ExpiresAt  time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type Device struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	DeviceID     string    `json:"device_id" db:"device_id"`
	DeviceName   *string   `json:"device_name,omitempty" db:"device_name"`
	DeviceType   *string   `json:"device_type,omitempty" db:"device_type"`
	Platform     *string   `json:"platform,omitempty" db:"platform"`
	PushToken    *string   `json:"push_token,omitempty" db:"push_token"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	LastSeenAt   time.Time `json:"last_seen_at" db:"last_seen_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// Request/Response DTOs
type SendOTPRequest struct {
	Phone     string   `json:"phone" validate:"required,min=10,max=20"`
	Role      UserRole `json:"role" validate:"required,oneof=CUSTOMER COURIER SELLER ADMIN"`
	FirstName string   `json:"first_name" validate:"required,min=2,max=100"`
	LastName  string   `json:"last_name" validate:"required,min=2,max=100"`
	DeviceID  *string  `json:"device_id,omitempty"`
}

type VerifyOTPRequest struct {
	Phone    string  `json:"phone" validate:"required,min=10,max=20"`
	OTP      string  `json:"otp" validate:"required,len=6"`
	DeviceID *string `json:"device_id,omitempty"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type AuthResponse struct {
	Success      bool   `json:"success"`
	Message      string `json:"message"`
	User         *User  `json:"user,omitempty"`
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type UserProfileResponse struct {
	Success bool  `json:"success"`
	Message string `json:"message"`
	User    *User `json:"user,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// JWT Claims
type JWTClaims struct {
	UserID   string   `json:"user_id"`
	Phone    string   `json:"phone"`
	Role     UserRole `json:"role"`
	DeviceID *string  `json:"device_id,omitempty"`
}

// OTP Data stored in Redis
type OTPData struct {
	Phone     string   `json:"phone"`
	OTP       string   `json:"otp"`
	Role      UserRole `json:"role"`
	FirstName string   `json:"first_name"`
	LastName  string   `json:"last_name"`
	Attempts  int      `json:"attempts"`
	CreatedAt time.Time `json:"created_at"`
}