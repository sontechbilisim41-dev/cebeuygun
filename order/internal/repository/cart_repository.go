package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/cebeuygun/platform/services/order/internal/models"
	"github.com/google/uuid"
)

type CartRepository interface {
	GetOrCreateCart(customerID uuid.UUID) (*models.Cart, error)
	GetCartByID(id uuid.UUID) (*models.Cart, error)
	GetCartByCustomerID(customerID uuid.UUID) (*models.Cart, error)
	AddItem(item *models.CartItem) error
	UpdateItem(id uuid.UUID, quantity int, notes *string) error
	RemoveItem(id uuid.UUID) error
	GetCartItems(cartID uuid.UUID) ([]*models.CartItem, error)
	ClearCart(cartID uuid.UUID) error
	DeleteCart(id uuid.UUID) error
}

type cartRepository struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) GetOrCreateCart(customerID uuid.UUID) (*models.Cart, error) {
	// Try to get existing cart
	cart, err := r.GetCartByCustomerID(customerID)
	if err != nil {
		return nil, err
	}
	
	if cart != nil {
		return cart, nil
	}
	
	// Create new cart
	cart = &models.Cart{
		ID:         uuid.New(),
		CustomerID: customerID,
	}
	
	query := `
		INSERT INTO carts (id, customer_id)
		VALUES ($1, $2)
		RETURNING created_at, updated_at`
	
	err = r.db.QueryRow(query, cart.ID, cart.CustomerID).Scan(&cart.CreatedAt, &cart.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create cart: %w", err)
	}
	
	return cart, nil
}

func (r *cartRepository) GetCartByID(id uuid.UUID) (*models.Cart, error) {
	cart := &models.Cart{}
	query := `
		SELECT id, customer_id, seller_id, created_at, updated_at
		FROM carts WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&cart.ID,
		&cart.CustomerID,
		&cart.SellerID,
		&cart.CreatedAt,
		&cart.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Load cart items
	items, err := r.GetCartItems(cart.ID)
	if err != nil {
		return nil, err
	}
	cart.Items = items
	
	return cart, nil
}

func (r *cartRepository) GetCartByCustomerID(customerID uuid.UUID) (*models.Cart, error) {
	cart := &models.Cart{}
	query := `
		SELECT id, customer_id, seller_id, created_at, updated_at
		FROM carts WHERE customer_id = $1`
	
	err := r.db.QueryRow(query, customerID).Scan(
		&cart.ID,
		&cart.CustomerID,
		&cart.SellerID,
		&cart.CreatedAt,
		&cart.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	if err != nil {
		return nil, err
	}
	
	// Load cart items
	items, err := r.GetCartItems(cart.ID)
	if err != nil {
		return nil, err
	}
	cart.Items = items
	
	return cart, nil
}

func (r *cartRepository) AddItem(item *models.CartItem) error {
	query := `
		INSERT INTO cart_items (id, cart_id, product_id, variant_id, seller_id, quantity, unit_price, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (cart_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
		DO UPDATE SET
			quantity = cart_items.quantity + EXCLUDED.quantity,
			unit_price = EXCLUDED.unit_price,
			notes = EXCLUDED.notes,
			updated_at = now()
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		item.ID,
		item.CartID,
		item.ProductID,
		item.VariantID,
		item.SellerID,
		item.Quantity,
		item.UnitPrice,
		item.Notes,
	).Scan(&item.CreatedAt, &item.UpdatedAt)
}

func (r *cartRepository) UpdateItem(id uuid.UUID, quantity int, notes *string) error {
	query := `
		UPDATE cart_items 
		SET quantity = $2, notes = $3, updated_at = now()
		WHERE id = $1`
	
	result, err := r.db.Exec(query, id, quantity, notes)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("cart item not found")
	}
	
	return nil
}

func (r *cartRepository) RemoveItem(id uuid.UUID) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Get cart_id before deleting
	var cartID uuid.UUID
	err = tx.QueryRow("SELECT cart_id FROM cart_items WHERE id = $1", id).Scan(&cartID)
	if err != nil {
		return err
	}
	
	// Delete the item
	result, err := tx.Exec("DELETE FROM cart_items WHERE id = $1", id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("cart item not found")
	}
	
	// Check if cart is now empty and clear seller_id
	var itemCount int
	err = tx.QueryRow("SELECT COUNT(*) FROM cart_items WHERE cart_id = $1", cartID).Scan(&itemCount)
	if err != nil {
		return err
	}
	
	if itemCount == 0 {
		_, err = tx.Exec("UPDATE carts SET seller_id = NULL WHERE id = $1", cartID)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

func (r *cartRepository) GetCartItems(cartID uuid.UUID) ([]*models.CartItem, error) {
	query := `
		SELECT id, cart_id, product_id, variant_id, seller_id, quantity, unit_price, notes, created_at, updated_at
		FROM cart_items
		WHERE cart_id = $1
		ORDER BY created_at`
	
	rows, err := r.db.Query(query, cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var items []*models.CartItem
	for rows.Next() {
		item := &models.CartItem{}
		err := rows.Scan(
			&item.ID,
			&item.CartID,
			&item.ProductID,
			&item.VariantID,
			&item.SellerID,
			&item.Quantity,
			&item.UnitPrice,
			&item.Notes,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	
	return items, rows.Err()
}

func (r *cartRepository) ClearCart(cartID uuid.UUID) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Delete all cart items
	_, err = tx.Exec("DELETE FROM cart_items WHERE cart_id = $1", cartID)
	if err != nil {
		return err
	}
	
	// Clear seller_id from cart
	_, err = tx.Exec("UPDATE carts SET seller_id = NULL WHERE id = $1", cartID)
	if err != nil {
		return err
	}
	
	return tx.Commit()
}

func (r *cartRepository) DeleteCart(id uuid.UUID) error {
	result, err := r.db.Exec("DELETE FROM carts WHERE id = $1", id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("cart not found")
	}
	
	return nil
}