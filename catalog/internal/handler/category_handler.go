package handler

import (
	"net/http"
	"strconv"

	"github.com/cebeuygun/platform/services/catalog/internal/models"
	"github.com/cebeuygun/platform/services/catalog/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CategoryHandler struct {
	service   service.CatalogService
	validator *validator.Validate
}

func NewCategoryHandler(service service.CatalogService) *CategoryHandler {
	return &CategoryHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create a new category
// @Description Create a new product category
// @Tags categories
// @Accept json
// @Produce json
// @Param category body models.CreateCategoryRequest true "Category data"
// @Success 201 {object} models.APIResponse{data=models.Category}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /categories [post]
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	var req models.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Validation failed",
			Error:   err.Error(),
		})
		return
	}

	category, err := h.service.CreateCategory(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create category",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Category created successfully",
		Data:    category,
	})
}

// @Summary Get category by ID
// @Description Get a category by its ID
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} models.APIResponse{data=models.Category}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /categories/{id} [get]
func (h *CategoryHandler) GetCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	category, err := h.service.GetCategory(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get category",
			Error:   err.Error(),
		})
		return
	}

	if category == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Category not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Category retrieved successfully",
		Data:    category,
	})
}

// @Summary List categories
// @Description Get list of categories with optional parent filter
// @Tags categories
// @Produce json
// @Param parent_id query string false "Parent category ID"
// @Param active_only query boolean false "Filter active categories only"
// @Success 200 {object} models.APIResponse{data=[]models.Category}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /categories [get]
func (h *CategoryHandler) GetCategories(c *gin.Context) {
	var parentID *uuid.UUID
	if parentIDStr := c.Query("parent_id"); parentIDStr != "" {
		id, err := uuid.Parse(parentIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid parent_id",
				Error:   err.Error(),
			})
			return
		}
		parentID = &id
	}

	activeOnly := false
	if activeOnlyStr := c.Query("active_only"); activeOnlyStr != "" {
		var err error
		activeOnly, err = strconv.ParseBool(activeOnlyStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid active_only parameter",
				Error:   err.Error(),
			})
			return
		}
	}

	categories, err := h.service.GetCategories(parentID, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get categories",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Categories retrieved successfully",
		Data:    categories,
	})
}

// @Summary Get category tree
// @Description Get hierarchical category tree
// @Tags categories
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.Category}
// @Failure 500 {object} models.APIResponse
// @Router /categories/tree [get]
func (h *CategoryHandler) GetCategoryTree(c *gin.Context) {
	categories, err := h.service.GetCategoryTree()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get category tree",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Category tree retrieved successfully",
		Data:    categories,
	})
}

// @Summary Update category
// @Description Update an existing category
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param category body models.UpdateCategoryRequest true "Category update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /categories/{id} [put]
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Validation failed",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.UpdateCategory(id, &req)
	if err != nil {
		if err.Error() == "category not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Category not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update category",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Category updated successfully",
	})
}

// @Summary Delete category
// @Description Delete a category
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 409 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /categories/{id} [delete]
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.DeleteCategory(id)
	if err != nil {
		if err.Error() == "category not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Category not found",
			})
			return
		}
		if err.Error() == "cannot delete category with children" || err.Error() == "cannot delete category with products" {
			c.JSON(http.StatusConflict, models.APIResponse{
				Success: false,
				Message: err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to delete category",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Category deleted successfully",
	})
}

func (h *CategoryHandler) RegisterRoutes(r *gin.RouterGroup) {
	categories := r.Group("/categories")
	{
		categories.POST("", h.CreateCategory)
		categories.GET("", h.GetCategories)
		categories.GET("/tree", h.GetCategoryTree)
		categories.GET("/:id", h.GetCategory)
		categories.PUT("/:id", h.UpdateCategory)
		categories.DELETE("/:id", h.DeleteCategory)
	}
}