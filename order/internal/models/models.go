package models

import (
	"time"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Order Status Enum
type OrderStatus string

const (
	OrderStatusCreated   OrderStatus = "CREATED"
	OrderStatusPaid      OrderStatus = "PAID"
	OrderStatusAssigned  OrderStatus = "ASSIGNED"
	OrderStatusPickedUp  OrderStatus = "PICKED_UP"
	OrderStatusOnTheWay  OrderStatus = "ON_THE_WAY"
	OrderStatusDelivered OrderStatus = "DELIVERED"
	OrderStatusCanceled  OrderStatus = "CANCELED"
)

// Valid state transitions
var ValidTransitions = map[OrderStatus][]OrderStatus{
	OrderStatusCreated:   {OrderStatusPaid, OrderStatusCanceled},
	OrderStatusPaid:      {OrderStatusAssigned, OrderStatusCanceled},
	OrderStatusAssigned:  {OrderStatusPickedUp, OrderStatusCanceled},
	OrderStatusPickedUp:  {OrderStatusOnTheWay, OrderStatusCanceled},
	OrderStatusOnTheWay:  {OrderStatusDelivered, OrderStatusCanceled},
	OrderStatusDelivered: {},
	OrderStatusCanceled:  {},
}

// Cart represents a shopping cart
type Cart struct {
	ID         uuid.UUID    `json:"id" db:"id"`
	CustomerID uuid.UUID    `json:"customer_id" db:"customer_id"`
	SellerID   *uuid.UUID   `json:"seller_id,omitempty" db:"seller_id"`
	Items      []*CartItem  `json:"items" db:"-"`
	CreatedAt  time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at" db:"updated_at"`
}

// CartItem represents an item in the cart
type CartItem struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	CartID    uuid.UUID       `json:"cart_id" db:"cart_id"`
	ProductID uuid.UUID       `json:"product_id" db:"product_id"`
	VariantID *uuid.UUID      `json:"variant_id,omitempty" db:"variant_id"`
	SellerID  uuid.UUID       `json:"seller_id" db:"seller_id"`
	Quantity  int             `json:"quantity" db:"quantity"`
	UnitPrice decimal.Decimal `json:"unit_price" db:"unit_price"`
	Notes     *string         `json:"notes,omitempty" db:"notes"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt time.Time       `json:"updated_at" db:"updated_at"`
	
	// Computed fields
	Product *Product `json:"product,omitempty" db:"-"`
}

// Product represents product information for cart/order items
type Product struct {
	ID                uuid.UUID       `json:"id"`
	Name              string          `json:"name"`
	Description       *string         `json:"description,omitempty"`
	ImageURL          *string         `json:"image_url,omitempty"`
	BasePrice         decimal.Decimal `json:"base_price"`
	Currency          string          `json:"currency"`
	IsExpressDelivery bool            `json:"is_express_delivery"`
	PreparationTime   int             `json:"preparation_time"`
	SellerName        string          `json:"seller_name"`
}

// Order represents a customer order
type Order struct {
	ID                    uuid.UUID       `json:"id" db:"id"`
	CustomerID            uuid.UUID       `json:"customer_id" db:"customer_id"`
	SellerID              uuid.UUID       `json:"seller_id" db:"seller_id"`
	Status                OrderStatus     `json:"status" db:"status"`
	Items                 []*OrderItem    `json:"items" db:"-"`
	Subtotal              decimal.Decimal `json:"subtotal" db:"subtotal"`
	TaxAmount             decimal.Decimal `json:"tax_amount" db:"tax_amount"`
	DeliveryFee           decimal.Decimal `json:"delivery_fee" db:"delivery_fee"`
	SmallCartFee          decimal.Decimal `json:"small_cart_fee" db:"small_cart_fee"`
	DiscountAmount        decimal.Decimal `json:"discount_amount" db:"discount_amount"`
	TotalAmount           decimal.Decimal `json:"total_amount" db:"total_amount"`
	Currency              string          `json:"currency" db:"currency"`
	DeliveryAddress       *Address        `json:"delivery_address,omitempty" db:"delivery_address"`
	EstimatedDeliveryTime *time.Time      `json:"estimated_delivery_time,omitempty" db:"estimated_delivery_time"`
	ActualDeliveryTime    *time.Time      `json:"actual_delivery_time,omitempty" db:"actual_delivery_time"`
	CourierID             *uuid.UUID      `json:"courier_id,omitempty" db:"courier_id"`
	PaymentID             *uuid.UUID      `json:"payment_id,omitempty" db:"payment_id"`
	CouponCode            *string         `json:"coupon_code,omitempty" db:"coupon_code"`
	Notes                 *string         `json:"notes,omitempty" db:"notes"`
	CreatedAt             time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time       `json:"updated_at" db:"updated_at"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	OrderID   uuid.UUID       `json:"order_id" db:"order_id"`
	ProductID uuid.UUID       `json:"product_id" db:"product_id"`
	VariantID *uuid.UUID      `json:"variant_id,omitempty" db:"variant_id"`
	Quantity  int             `json:"quantity" db:"quantity"`
	UnitPrice decimal.Decimal `json:"unit_price" db:"unit_price"`
	TotalPrice decimal.Decimal `json:"total_price" db:"total_price"`
	Notes     *string         `json:"notes,omitempty" db:"notes"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	
	// Computed fields
	Product *Product `json:"product,omitempty" db:"-"`
}

// Address represents delivery address
type Address struct {
	Street     string  `json:"street"`
	City       string  `json:"city"`
	District   string  `json:"district"`
	PostalCode *string `json:"postal_code,omitempty"`
	Country    string  `json:"country"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}

// OutboxEvent represents an event to be published
type OutboxEvent struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	AggregateID uuid.UUID   `json:"aggregate_id" db:"aggregate_id"`
	EventType   string      `json:"event_type" db:"event_type"`
	EventData   interface{} `json:"event_data" db:"event_data"`
	Published   bool        `json:"published" db:"published"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	PublishedAt *time.Time  `json:"published_at,omitempty" db:"published_at"`
}

// Campaign represents a promotion campaign
type Campaign struct {
	ID               uuid.UUID       `json:"id"`
	Name             string          `json:"name"`
	DiscountType     string          `json:"discount_type"` // percentage, fixed_amount
	DiscountValue    decimal.Decimal `json:"discount_value"`
	MinOrderAmount   *decimal.Decimal `json:"min_order_amount,omitempty"`
	MaxDiscountAmount *decimal.Decimal `json:"max_discount_amount,omitempty"`
	ValidFrom        time.Time       `json:"valid_from"`
	ValidUntil       time.Time       `json:"valid_until"`
	IsActive         bool            `json:"is_active"`
}

// DTOs for API requests/responses

type AddToCartRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	VariantID *uuid.UUID `json:"variant_id,omitempty"`
	Quantity  int       `json:"quantity" validate:"required,min=1"`
	Notes     *string   `json:"notes,omitempty"`
}

type UpdateCartItemRequest struct {
	Quantity int     `json:"quantity" validate:"required,min=1"`
	Notes    *string `json:"notes,omitempty"`
}

type CreateOrderRequest struct {
	DeliveryAddress Address `json:"delivery_address" validate:"required"`
	CouponCode      *string `json:"coupon_code,omitempty"`
	Notes           *string `json:"notes,omitempty"`
	PaymentMethodID *string `json:"payment_method_id,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" validate:"required"`
	Notes  *string     `json:"notes,omitempty"`
}

type CartSummary struct {
	ItemCount      int             `json:"item_count"`
	Subtotal       decimal.Decimal `json:"subtotal"`
	TaxAmount      decimal.Decimal `json:"tax_amount"`
	DeliveryFee    decimal.Decimal `json:"delivery_fee"`
	SmallCartFee   decimal.Decimal `json:"small_cart_fee"`
	DiscountAmount decimal.Decimal `json:"discount_amount"`
	TotalAmount    decimal.Decimal `json:"total_amount"`
	Currency       string          `json:"currency"`
	SellerID       *uuid.UUID      `json:"seller_id,omitempty"`
	SellerName     *string         `json:"seller_name,omitempty"`
}

type OrderSummary struct {
	ID                    uuid.UUID  `json:"id"`
	Status                OrderStatus `json:"status"`
	ItemCount             int        `json:"item_count"`
	TotalAmount           decimal.Decimal `json:"total_amount"`
	Currency              string     `json:"currency"`
	SellerName            string     `json:"seller_name"`
	EstimatedDeliveryTime *time.Time `json:"estimated_delivery_time,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
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
type OrderEventPayload struct {
	OrderID    uuid.UUID   `json:"order_id"`
	CustomerID uuid.UUID   `json:"customer_id"`
	SellerID   uuid.UUID   `json:"seller_id"`
	Status     OrderStatus `json:"status"`
	TotalAmount decimal.Decimal `json:"total_amount"`
	Currency   string      `json:"currency"`
	Items      []OrderItemEvent `json:"items"`
	Timestamp  time.Time   `json:"timestamp"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

type OrderItemEvent struct {
	ProductID  uuid.UUID       `json:"product_id"`
	VariantID  *uuid.UUID      `json:"variant_id,omitempty"`
	Quantity   int             `json:"quantity"`
	UnitPrice  decimal.Decimal `json:"unit_price"`
	TotalPrice decimal.Decimal `json:"total_price"`
}

// State machine validation
func (s OrderStatus) CanTransitionTo(newStatus OrderStatus) bool {
	validTransitions, exists := ValidTransitions[s]
	if !exists {
		return false
	}
	
	for _, validStatus := range validTransitions {
		if validStatus == newStatus {
			return true
		}
	}
	
	return false
}

func (s OrderStatus) IsValid() bool {
	switch s {
	case OrderStatusCreated, OrderStatusPaid, OrderStatusAssigned, 
		 OrderStatusPickedUp, OrderStatusOnTheWay, OrderStatusDelivered, OrderStatusCanceled:
		return true
	default:
		return false
	}
}

func (s OrderStatus) IsFinal() bool {
	return s == OrderStatusDelivered || s == OrderStatusCanceled
}