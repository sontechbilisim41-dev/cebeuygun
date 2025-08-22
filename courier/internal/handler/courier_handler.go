package handler

import (
	"net/http"
	"strconv"

	"github.com/cebeuygun/platform/services/courier/internal/models"
	"github.com/cebeuygun/platform/services/courier/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CourierHandler struct {
	service   service.CourierService
	validator *validator.Validate
}

func NewCourierHandler(service service.CourierService) *CourierHandler {
	return &CourierHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create a new courier
// @Description Register a new courier in the system
// @Tags couriers
// @Accept json
// @Produce json
// @Param courier body models.CreateCourierRequest true "Courier data"
// @Success 201 {object} models.APIResponse{data=models.Courier}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers [post]
func (h *CourierHandler) CreateCourier(c *gin.Context) {
	var req models.CreateCourierRequest
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

	courier, err := h.service.CreateCourier(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create courier",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Courier created successfully",
		Data:    courier,
	})
}

// @Summary Get courier by ID
// @Description Get courier details by ID
// @Tags couriers
// @Produce json
// @Param id path string true "Courier ID"
// @Success 200 {object} models.APIResponse{data=models.Courier}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id} [get]
func (h *CourierHandler) GetCourier(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier ID",
			Error:   err.Error(),
		})
		return
	}

	courier, err := h.service.GetCourier(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get courier",
			Error:   err.Error(),
		})
		return
	}

	if courier == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Courier not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Courier retrieved successfully",
		Data:    courier,
	})
}

// @Summary Update courier location
// @Description Update courier's current location
// @Tags couriers
// @Accept json
// @Produce json
// @Param id path string true "Courier ID"
// @Param location body models.UpdateLocationRequest true "Location data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/location [put]
func (h *CourierHandler) UpdateLocation(c *gin.Context) {
	idStr := c.Param("id")
	courierID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateLocationRequest
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

	err = h.service.UpdateCourierLocation(courierID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update location",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Location updated successfully",
	})
}

// @Summary Set courier status
// @Description Update courier availability status
// @Tags couriers
// @Accept json
// @Produce json
// @Param id path string true "Courier ID"
// @Param status body object{status=string} true "Status update"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/status [patch]
func (h *CourierHandler) SetStatus(c *gin.Context) {
	idStr := c.Param("id")
	courierID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier ID",
			Error:   err.Error(),
		})
		return
	}

	var req struct {
		Status models.CourierStatus `json:"status" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	if !req.Status.IsValid() {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier status",
		})
		return
	}

	err = h.service.SetCourierStatus(courierID, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update status",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Status updated successfully",
	})
}

// @Summary Set courier online status
// @Description Set courier online/offline status
// @Tags couriers
// @Accept json
// @Produce json
// @Param id path string true "Courier ID"
// @Param online body object{is_online=boolean} true "Online status"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/online [patch]
func (h *CourierHandler) SetOnlineStatus(c *gin.Context) {
	idStr := c.Param("id")
	courierID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier ID",
			Error:   err.Error(),
		})
		return
	}

	var req struct {
		IsOnline bool `json:"is_online"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.SetCourierOnlineStatus(courierID, req.IsOnline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update online status",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Online status updated successfully",
	})
}

// @Summary Find available couriers
// @Description Find couriers available for delivery in a specific area
// @Tags couriers
// @Accept json
// @Produce json
// @Param availability body models.CourierAvailabilityRequest true "Availability criteria"
// @Success 200 {object} models.APIResponse{data=[]models.Courier}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/available [post]
func (h *CourierHandler) FindAvailable(c *gin.Context) {
	var req models.CourierAvailabilityRequest
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

	couriers, err := h.service.FindAvailableCouriers(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to find available couriers",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Available couriers retrieved successfully",
		Data:    couriers,
	})
}

// @Summary Get courier performance
// @Description Get performance statistics for a courier
// @Tags couriers
// @Produce json
// @Param id path string true "Courier ID"
// @Success 200 {object} models.APIResponse{data=models.CourierPerformanceStats}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/performance [get]
func (h *CourierHandler) GetPerformance(c *gin.Context) {
	idStr := c.Param("id")
	courierID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid courier ID",
			Error:   err.Error(),
		})
		return
	}

	stats, err := h.service.GetCourierPerformance(courierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get performance stats",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Performance stats retrieved successfully",
		Data:    stats,
	})
}

// @Summary List couriers
// @Description Get list of couriers with optional filters
// @Tags couriers
// @Produce json
// @Param status query string false "Courier status filter"
// @Param vehicle_type query string false "Vehicle type filter"
// @Param page query integer false "Page number" default(1)
// @Param limit query integer false "Items per page" default(20)
// @Success 200 {object} models.PaginatedResponse{data=[]models.Courier}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers [get]
func (h *CourierHandler) GetCouriers(c *gin.Context) {
	var status *models.CourierStatus
	if statusStr := c.Query("status"); statusStr != "" {
		s := models.CourierStatus(statusStr)
		if s.IsValid() {
			status = &s
		} else {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid status value",
			})
			return
		}
	}

	var vehicleType *models.VehicleType
	if vehicleStr := c.Query("vehicle_type"); vehicleStr != "" {
		vt := models.VehicleType(vehicleStr)
		if vt.IsValid() {
			vehicleType = &vt
		} else {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid vehicle type value",
			})
			return
		}
	}

	page := 1
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	couriers, total, err := h.service.GetCouriers(status, vehicleType, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get couriers",
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
		Message: "Couriers retrieved successfully",
		Data:    couriers,
		Pagination: models.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

func (h *CourierHandler) RegisterRoutes(r *gin.RouterGroup) {
	couriers := r.Group("/couriers")
	{
		couriers.POST("", h.CreateCourier)
		couriers.GET("", h.GetCouriers)
		couriers.GET("/:id", h.GetCourier)
		couriers.PUT("/:id/location", h.UpdateLocation)
		couriers.PATCH("/:id/status", h.SetStatus)
		couriers.PATCH("/:id/online", h.SetOnlineStatus)
		couriers.POST("/available", h.FindAvailable)
		couriers.GET("/:id/performance", h.GetPerformance)
	}
}