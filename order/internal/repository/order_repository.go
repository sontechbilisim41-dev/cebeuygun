package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/order/internal/models"
	"github.com/google/uuid"
)

type OrderRepository interface {
	Create(order *models.Order) error
	GetByID(id uuid.UUID) (*models.Order, error)
	GetByCustomerID(customerID uuid.UUID, limit, offset int) ([]*models.Order, int64, error)
	GetBySellerID(sellerID uuid.UUID, limit, offset int) ([]*models.Order, int64, error)
	GetByCourierID(courierID uuid.UUID, limit, offset int) ([]*models.Order, int64, error)
	UpdateStatus(id uuid.UUID, status models.OrderStatus, notes *string) error
	AssignCourier(id uuid.UUID, courierID uuid.UUID) error
	SetPaymentID(id uuid.UUID, paymentID uuid.UUID) error
	SetActualDeliveryTime(id uuid.UUID) error
	GetOrderItems(orderID uuid.UUID) ([]*models.OrderItem, error)
	CreateOrderItem(item *models.OrderItem) error
	GetOrdersByStatus(status models.OrderStatus, limit, offset int) ([]*models.Order, int64, error)
}

type orderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(order *models.Order) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Serialize delivery address
	addressJSON, err := json.Marshal(order.DeliveryAddress)
	if err != nil {
		return fmt.Errorf("failed to serialize delivery address: %w", err)
	}
	
	// Create order
	query := `
		INSERT INTO orders (id, customer_id, seller_id, status, subtotal, tax_amount, delivery_fee, 
		                   small_cart_fee, discount_amount, total_amount, currency, delivery_address,
		                   estimated_delivery_time, coupon_code, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING created_at, updated_at`
	
	err = tx.QueryRow(
		query,
		order.ID,
		order.CustomerID,
		order.SellerID,
		order.Status,
		order.Subtotal,
		order.TaxAmount,
		order.DeliveryFee,
		order.SmallCartFee,
		order.DiscountAmount,
		order.TotalAmount,
		order.Currency,
		addressJSON,
		order.EstimatedDeliveryTime,
		order.CouponCode,
		order.Notes,
	).Scan(&order.CreatedAt, &order.UpdatedAt)
	
	if err != nil {
		return err
	}
	
	// Create order items
	for _, item := range order.Items {
		item.OrderID = order.ID
		err = r.createOrderItemTx(tx, item)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

func (r *orderRepository) createOrderItemTx(tx *sql.Tx, item *models.OrderItem) error {
	query := `
		INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at`
	
	return tx.QueryRow(
		query,
		item.ID,
		item.OrderID,
		item.ProductID,
		item.VariantID,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Notes,
	).Scan(&item.CreatedAt)
}

func (r *orderRepository) GetByID(id uuid.UUID) (*models.Order, error) {
	order := &models.Order{}
	query := `
		SELECT id, customer_id, seller_id, status, subtotal, tax_amount, delivery_fee, small_cart_fee,
		       discount_amount, total_amount, currency, delivery_address, estimated_delivery_time,
		       actual_delivery_time, courier_id, payment_id, coupon_code, notes, created_at, updated_at
		FROM orders WHERE id = $1`
	
	var addressJSON []byte
	err := r.db.QueryRow(query, id).Scan(
		&order.ID,
		&order.CustomerID,
		&order.SellerID,
		&order.Status,
		&order.Subtotal,
		&order.TaxAmount,
		&order.DeliveryFee,
		&order.SmallCartFee,
		&order.DiscountAmount,
		&order.TotalAmount,
		&order.Currency,
		&addressJSON,
		&order.EstimatedDeliveryTime,
		&order.ActualDeliveryTime,
		&order.CourierID,
		&order.PaymentID,
		&order.CouponCode,
		&order.Notes,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Deserialize delivery address
	if len(addressJSON) > 0 {
		var address models.Address
		if err := json.Unmarshal(addressJSON, &address); err != nil {
			return nil, fmt.Errorf("failed to deserialize delivery address: %w", err)
		}
		order.DeliveryAddress = &address
	}
	
	// Load order items
	items, err := r.GetOrderItems(order.ID)
	if err != nil {
		return nil, err
	}
	order.Items = items
	
	return order, nil
}

func (r *orderRepository) GetByCustomerID(customerID uuid.UUID, limit, offset int) ([]*models.Order, int64, error) {
	return r.getOrdersWithFilter("customer_id = $1", []interface{}{customerID}, limit, offset)
}

func (r *orderRepository) GetBySellerID(sellerID uuid.UUID, limit, offset int) ([]*models.Order, int64, error) {
	return r.getOrdersWithFilter("seller_id = $1", []interface{}{sellerID}, limit, offset)
}

func (r *orderRepository) GetByCourierID(courierID uuid.UUID, limit, offset int) ([]*models.Order, int64, error) {
	return r.getOrdersWithFilter("courier_id = $1", []interface{}{courierID}, limit, offset)
}

func (r *orderRepository) GetOrdersByStatus(status models.OrderStatus, limit, offset int) ([]*models.Order, int64, error) {
	return r.getOrdersWithFilter("status = $1", []interface{}{status}, limit, offset)
}

func (r *orderRepository) getOrdersWithFilter(whereClause string, args []interface{}, limit, offset int) ([]*models.Order, int64, error) {
	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM orders WHERE %s", whereClause)
	var total int64
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	// Main query
	query := fmt.Sprintf(`
		SELECT id, customer_id, seller_id, status, subtotal, tax_amount, delivery_fee, small_cart_fee,
		       discount_amount, total_amount, currency, delivery_address, estimated_delivery_time,
		       actual_delivery_time, courier_id, payment_id, coupon_code, notes, created_at, updated_at
		FROM orders 
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, len(args)+1, len(args)+2)
	
	args = append(args, limit, offset)
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	
	var orders []*models.Order
	for rows.Next() {
		order := &models.Order{}
		var addressJSON []byte
		
		err := rows.Scan(
			&order.ID,
			&order.CustomerID,
			&order.SellerID,
			&order.Status,
			&order.Subtotal,
			&order.TaxAmount,
			&order.DeliveryFee,
			&order.SmallCartFee,
			&order.DiscountAmount,
			&order.TotalAmount,
			&order.Currency,
			&addressJSON,
			&order.EstimatedDeliveryTime,
			&order.ActualDeliveryTime,
			&order.CourierID,
			&order.PaymentID,
			&order.CouponCode,
			&order.Notes,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		
		// Deserialize delivery address
		if len(addressJSON) > 0 {
			var address models.Address
			if err := json.Unmarshal(addressJSON, &address); err == nil {
				order.DeliveryAddress = &address
			}
		}
		
		orders = append(orders, order)
	}
	
	return orders, total, rows.Err()
}

func (r *orderRepository) UpdateStatus(id uuid.UUID, status models.OrderStatus, notes *string) error {
	query := `
		UPDATE orders 
		SET status = $2, notes = COALESCE($3, notes), updated_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id, status, notes)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}
	
	return nil
}

func (r *orderRepository) AssignCourier(id uuid.UUID, courierID uuid.UUID) error {
	query := `
		UPDATE orders 
		SET courier_id = $2, updated_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id, courierID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}
	
	return nil
}

func (r *orderRepository) SetPaymentID(id uuid.UUID, paymentID uuid.UUID) error {
	query := `
		UPDATE orders 
		SET payment_id = $2, updated_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id, paymentID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}
	
	return nil
}

func (r *orderRepository) SetActualDeliveryTime(id uuid.UUID) error {
	query := `
		UPDATE orders 
		SET actual_delivery_time = now(), updated_at = now()
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
		return fmt.Errorf("order not found")
	}
	
	return nil
}

func (r *orderRepository) GetOrderItems(orderID uuid.UUID) ([]*models.OrderItem, error) {
	query := `
		SELECT id, order_id, product_id, variant_id, quantity, unit_price, total_price, notes, created_at
		FROM order_items
		WHERE order_id = $1
		ORDER BY created_at`
	
	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var items []*models.OrderItem
	for rows.Next() {
		item := &models.OrderItem{}
		err := rows.Scan(
			&item.ID,
			&item.OrderID,
			&item.ProductID,
			&item.VariantID,
			&item.Quantity,
			&item.UnitPrice,
			&item.TotalPrice,
			&item.Notes,
			&item.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	
	return items, rows.Err()
}

func (r *orderRepository) CreateOrderItem(item *models.OrderItem) error {
	query := `
		INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at`
	
	return r.db.QueryRow(
		query,
		item.ID,
		item.OrderID,
		item.ProductID,
		item.VariantID,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Notes,
	).Scan(&item.CreatedAt)
}