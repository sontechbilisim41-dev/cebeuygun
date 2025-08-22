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

type OrderHandler struct {
	service   service.OrderService
	validator *validator.Validate
}

func NewOrderHandler(service service.OrderService) *OrderHandler {
	return &OrderHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create order
// @Description Create a new order from customer's cart
// @Tags orders
// @Accept json
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Param order body models.CreateOrderRequest true "Order data"
// @Success 201 {object} models.APIResponse{data=models.Order}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/{customer_id} [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
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

	var req models.CreateOrderRequest
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

	order, err := h.service.CreateOrder(customerID, &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "cart is empty" || err.Error() == "cart has no seller assigned" {
			statusCode = http.StatusBadRequest
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to create order",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Order created successfully",
		Data:    order,
	})
}

// @Summary Get order by ID
// @Description Get order details by ID
// @Tags orders
// @Produce json
// @Param id path string true "Order ID"
// @Success 200 {object} models.APIResponse{data=models.Order}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/{id} [get]
func (h *OrderHandler) GetOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid order ID",
			Error:   err.Error(),
		})
		return
	}

	order, err := h.service.GetOrder(id)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "order not found" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to get order",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order retrieved successfully",
		Data:    order,
	})
}

// @Summary Get customer orders
// @Description Get orders for a specific customer
// @Tags orders
// @Produce json
// @Param customer_id path string true "Customer ID"
// @Param page query integer false "Page number" default(1)
// @Param limit query integer false "Items per page" default(20)
// @Success 200 {object} models.PaginatedResponse{data=[]models.Order}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/customer/{customer_id} [get]
func (h *OrderHandler) GetCustomerOrders(c *gin.Context) {
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

	page, limit := h.getPaginationParams(c)

	orders, total, err := h.service.GetOrdersByCustomer(customerID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get orders",
			Error:   err.Error(),
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orders,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// @Summary Get seller orders
// @Description Get orders for a specific seller
// @Tags orders
// @Produce json
// @Param seller_id path string true "Seller ID"
// @Param page query integer false "Page number" default(1)
// @Param limit query integer false "Items per page" default(20)
// @Success 200 {object} models.PaginatedResponse{data=[]models.Order}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/seller/{seller_id} [get]
func (h *OrderHandler) GetSellerOrders(c *gin.Context) {
	sellerIDStr := c.Param("seller_id")
	sellerID, err := uuid.Parse(sellerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid seller ID",
			Error:   err.Error(),
		})
		return
	}

	page, limit := h.getPaginationParams(c)

	orders, total, err := h.service.GetOrdersBySeller(sellerID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get orders",
			Error:   err.Error(),
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orders,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// @Summary Update order status
// @Description Update the status of an order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param status body models.UpdateOrderStatusRequest true "Status update"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/{id}/status [patch]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid order ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateOrderStatusRequest
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

	// Validate status
	if !req.Status.IsValid() {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid order status",
		})
		return
	}

	err = h.service.UpdateOrderStatus(id, req.Status, req.Notes)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "order not found" {
			statusCode = http.StatusNotFound
		} else if err.Error() == "invalid status transition" {
			statusCode = http.StatusBadRequest
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to update order status",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order status updated successfully",
	})
}

// @Summary Assign courier to order
// @Description Assign a courier to an order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param courier_id body object{courier_id=string} true "Courier assignment"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/{id}/assign-courier [patch]
func (h *OrderHandler) AssignCourier(c *gin.Context) {
	idStr := c.Param("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid order ID",
			Error:   err.Error(),
		})
		return
	}

	var req struct {
		CourierID uuid.UUID `json:"courier_id" validate:"required"`
	}
	
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

	err = h.service.AssignCourier(orderID, req.CourierID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "order not found" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to assign courier",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Courier assigned successfully",
	})
}

// @Summary Process payment
// @Description Process payment for an order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param payment body object{payment_method_id=string} true "Payment information"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /orders/{id}/payment [post]
func (h *OrderHandler) ProcessPayment(c *gin.Context) {
	idStr := c.Param("id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid order ID",
			Error:   err.Error(),
		})
		return
	}

	var req struct {
		PaymentMethodID string `json:"payment_method_id" validate:"required"`
	}
	
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

	err = h.service.ProcessPayment(orderID, req.PaymentMethodID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "order not found" {
			statusCode = http.StatusNotFound
		} else if err.Error() == "order is not in created status" {
			statusCode = http.StatusBadRequest
		}
		
		c.JSON(statusCode, models.APIResponse{
			Success: false,
			Message: "Failed to process payment",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Payment processed successfully",
	})
}

func (h *OrderHandler) getPaginationParams(c *gin.Context) (page, limit int) {
	page = 1
	limit = 20

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	return page, limit
}

func (h *OrderHandler) RegisterRoutes(r *gin.RouterGroup) {
	orders := r.Group("/orders")
	{
		orders.POST("/:customer_id", h.CreateOrder)
		orders.GET("/:id", h.GetOrder)
		orders.GET("/customer/:customer_id", h.GetCustomerOrders)
		orders.GET("/seller/:seller_id", h.GetSellerOrders)
		orders.PATCH("/:id/status", h.UpdateOrderStatus)
		orders.PATCH("/:id/assign-courier", h.AssignCourier)
		orders.POST("/:id/payment", h.ProcessPayment)
	}
}