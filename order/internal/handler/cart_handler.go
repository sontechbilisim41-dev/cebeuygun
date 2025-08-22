package handler

import (
	"net/http"
	"strconv"

	"github.com/cebeuygun/platform/services/order/internal/models"
	"github.com/cebeuygun/platform/services/order/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CartHandler struct {
	service   service.OrderService
	validator *validator.Validate
}

func NewCartHandler(service service.OrderService) *CartHandler {
	return &CartHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Get customer cart
// @Description Get the current cart for a customer
// @Tags cart
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Success 200 {object} models.APIResponse{data=models.Cart}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id} [get]
func (h *CartHandler) GetCart(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	cart, err := h.service.GetCart(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get cart",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cart retrieved successfully",
		Data:    cart,
	})
}

// @Summary Add item to cart
// @Description Add a product to the customer's cart
// @Tags cart
// @Accept json
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Param item body models.AddToCartRequest true "Item to add"
// @Success 201 {object} models.APIResponse{data=models.CartItem}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id}/items [post]
func (h *CartHandler) AddToCart(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.AddToCartRequest
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

	item, err := h.service.AddToCart(customerID, &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "cart can only contain items from a single seller" {
			statusCode = http.StatusBadRequest
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to add item to cart",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Item added to cart successfully",
		Data:    item,
	})
}

// @Summary Update cart item
// @Description Update quantity or notes for a cart item
// @Tags cart
// @Accept json
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Param item_id path string true "Cart Item ID"
// @Param item body models.UpdateCartItemRequest true "Item updates"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id}/items/{item_id} [put]
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	itemIDStr := c.Param("item_id")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid item ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateCartItemRequest
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

	err = h.service.UpdateCartItem(customerID, itemID, &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "cart item not found" || err.Error() == "cart not found" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to update cart item",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cart item updated successfully",
	})
}

// @Summary Remove item from cart
// @Description Remove a product from the customer's cart
// @Tags cart
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Param item_id path string true "Cart Item ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id}/items/{item_id} [delete]
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	itemIDStr := c.Param("item_id")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid item ID",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.RemoveFromCart(customerID, itemID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "cart item not found" || err.Error() == "cart not found" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to remove item from cart",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Item removed from cart successfully",
	})
}

// @Summary Clear cart
// @Description Remove all items from the customer's cart
// @Tags cart
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id}/clear [delete]
func (h *CartHandler) ClearCart(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.ClearCart(customerID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "cart not found" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to clear cart",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cart cleared successfully",
	})
}

// @Summary Get cart summary
// @Description Get cart summary with pricing calculations
// @Tags cart
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Success 200 {object} models.APIResponse{data=models.CartSummary}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /cart/{customer_id}/summary [get]
func (h *CartHandler) GetCartSummary(c *gin.Context) {
	customerIDStr := c.Param("customer_id")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid customer ID",
			Error:   err.Error(),
		})
		return
	}

	summary, err := h.service.GetCartSummary(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get cart summary",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cart summary retrieved successfully",
		Data:    summary,
	})
}

func (h *CartHandler) RegisterRoutes(r *gin.RouterGroup) {
	cart := r.Group("/cart")
	{
		cart.GET("/:customer_id", h.GetCart)
		cart.POST("/:customer_id/items", h.AddToCart)
		cart.PUT("/:customer_id/items/:item_id", h.UpdateCartItem)
		cart.DELETE("/:customer_id/items/:item_id", h.RemoveFromCart)
		cart.DELETE("/:customer_id/clear", h.ClearCart)
		cart.GET("/:customer_id/summary", h.GetCartSummary)
	}
}