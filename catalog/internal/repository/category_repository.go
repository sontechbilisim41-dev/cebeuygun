package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/cebeuygun/platform/services/catalog/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type CategoryRepository interface {
	Create(category *models.Category) error
	GetByID(id uuid.UUID) (*models.Category, error)
	GetAll(parentID *uuid.UUID, activeOnly bool) ([]*models.Category, error)
	GetTree() ([]*models.Category, error)
	Update(id uuid.UUID, updates *models.UpdateCategoryRequest) error
	Delete(id uuid.UUID) error
	GetProductCount(categoryID uuid.UUID) (int, error)
}

type categoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) Create(category *models.Category) error {
	query := `
		INSERT INTO categories (id, name, description, parent_id, image_url, sort_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at`
	
	return r.db.QueryRow(
		query,
		category.ID,
		category.Name,
		category.Description,
		category.ParentID,
		category.ImageURL,
		category.SortOrder,
		category.IsActive,
	).Scan(&category.CreatedAt, &category.UpdatedAt)
}

func (r *categoryRepository) GetByID(id uuid.UUID) (*models.Category, error) {
	category := &models.Category{}
	query := `
		SELECT id, name, description, parent_id, image_url, sort_order, is_active, created_at, updated_at
		FROM categories WHERE id = $1`
	
	err := r.db.QueryRow(query, id).Scan(
		&category.ID,
		&category.Name,
		&category.Description,
		&category.ParentID,
		&category.ImageURL,
		&category.SortOrder,
		&category.IsActive,
		&category.CreatedAt,
		&category.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	
	return category, err
}

func (r *categoryRepository) GetAll(parentID *uuid.UUID, activeOnly bool) ([]*models.Category, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if parentID != nil {
		conditions = append(conditions, fmt.Sprintf("parent_id = $%d", argIndex))
		args = append(args, *parentID)
		argIndex++
	} else {
		conditions = append(conditions, "parent_id IS NULL")
	}

	if activeOnly {
		conditions = append(conditions, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, true)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT id, name, description, parent_id, image_url, sort_order, is_active, created_at, updated_at
		FROM categories %s
		ORDER BY sort_order, name`, whereClause)
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var categories []*models.Category
	for rows.Next() {
		category := &models.Category{}
		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Description,
			&category.ParentID,
			&category.ImageURL,
			&category.SortOrder,
			&category.IsActive,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	
	return categories, rows.Err()
}

func (r *categoryRepository) GetTree() ([]*models.Category, error) {
	query := `
		WITH RECURSIVE category_tree AS (
			-- Base case: root categories
			SELECT id, name, description, parent_id, image_url, sort_order, is_active, created_at, updated_at, 0 as level
			FROM categories
			WHERE parent_id IS NULL
			
			UNION ALL
			
			-- Recursive case: child categories
			SELECT c.id, c.name, c.description, c.parent_id, c.image_url, c.sort_order, c.is_active, c.created_at, c.updated_at, ct.level + 1
			FROM categories c
			INNER JOIN category_tree ct ON c.parent_id = ct.id
		)
		SELECT id, name, description, parent_id, image_url, sort_order, is_active, created_at, updated_at
		FROM category_tree
		ORDER BY level, sort_order, name`
	
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var categories []*models.Category
	categoryMap := make(map[uuid.UUID]*models.Category)
	
	for rows.Next() {
		category := &models.Category{}
		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Description,
			&category.ParentID,
			&category.ImageURL,
			&category.SortOrder,
			&category.IsActive,
			&category.CreatedAt,
			&category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		categoryMap[category.ID] = category
		
		if category.ParentID == nil {
			categories = append(categories, category)
		} else {
			if parent, exists := categoryMap[*category.ParentID]; exists {
				parent.Children = append(parent.Children, category)
			}
		}
	}
	
	return categories, rows.Err()
}

func (r *categoryRepository) Update(id uuid.UUID, updates *models.UpdateCategoryRequest) error {
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

	if updates.ParentID != nil {
		setParts = append(setParts, fmt.Sprintf("parent_id = $%d", argIndex))
		args = append(args, *updates.ParentID)
		argIndex++
	}

	if updates.ImageURL != nil {
		setParts = append(setParts, fmt.Sprintf("image_url = $%d", argIndex))
		args = append(args, *updates.ImageURL)
		argIndex++
	}

	if updates.SortOrder != nil {
		setParts = append(setParts, fmt.Sprintf("sort_order = $%d", argIndex))
		args = append(args, *updates.SortOrder)
		argIndex++
	}

	if updates.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *updates.IsActive)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE categories SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
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
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *categoryRepository) Delete(id uuid.UUID) error {
	// Check if category has children
	var childCount int
	err := r.db.QueryRow("SELECT COUNT(*) FROM categories WHERE parent_id = $1", id).Scan(&childCount)
	if err != nil {
		return err
	}

	if childCount > 0 {
		return fmt.Errorf("cannot delete category with children")
	}

	// Check if category has products
	var productCount int
	err = r.db.QueryRow("SELECT COUNT(*) FROM products WHERE category_id = $1", id).Scan(&productCount)
	if err != nil {
		return err
	}

	if productCount > 0 {
		return fmt.Errorf("cannot delete category with products")
	}

	result, err := r.db.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("category not found")
	}

	return nil
}

func (r *categoryRepository) GetProductCount(categoryID uuid.UUID) (int, error) {
	var count int
	query := `
		WITH RECURSIVE category_tree AS (
			SELECT id FROM categories WHERE id = $1
			UNION ALL
			SELECT c.id FROM categories c
			INNER JOIN category_tree ct ON c.parent_id = ct.id
		)
		SELECT COUNT(*) FROM products p
		INNER JOIN category_tree ct ON p.category_id = ct.id
		WHERE p.is_active = true`
	
	err := r.db.QueryRow(query, categoryID).Scan(&count)
	return count, err
}