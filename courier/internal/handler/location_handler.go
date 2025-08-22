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

type LocationHandler struct {
	locationService service.LocationService
	validator       *validator.Validate
}

func NewLocationHandler(locationService service.LocationService) *LocationHandler {
	return &LocationHandler{
		locationService: locationService,
		validator:       validator.New(),
	}
}

// @Summary Update courier location
// @Description Update courier's real-time location with throttling
// @Tags location
// @Accept json
// @Produce json
// @Param id path string true "Courier ID"
// @Param location body models.UpdateLocationRequest true "Location data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 429 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/location [put]
func (h *LocationHandler) UpdateLocation(c *gin.Context) {
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

	location := &models.Location{
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
	}

	metadata := &service.LocationMetadata{
		Speed:    req.Speed,
		Heading:  req.Heading,
		Accuracy: req.Accuracy,
	}

	// Get order ID from header if courier is on delivery
	if orderID := c.GetHeader("X-Order-ID"); orderID != "" {
		metadata.OrderID = &orderID
	}

	err = h.locationService.UpdateCourierLocation(courierID, location, metadata)
	if err != nil {
		if err.Error() == "location update rate limit exceeded" {
			c.JSON(http.StatusTooManyRequests, models.APIResponse{
				Success: false,
				Message: "Location update rate limit exceeded",
				Error:   "Please wait before sending another location update",
			})
			return
		}
		
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

// @Summary Get courier location
// @Description Get courier's current location
// @Tags location
// @Produce json
// @Param id path string true "Courier ID"
// @Success 200 {object} models.APIResponse{data=models.Location}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/location [get]
func (h *LocationHandler) GetLocation(c *gin.Context) {
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

	location, err := h.locationService.GetCourierLocation(courierID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get location",
			Error:   err.Error(),
		})
		return
	}

	if location == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Location not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Location retrieved successfully",
		Data:    location,
	})
}

// @Summary Get location history
// @Description Get courier's location history
// @Tags location
// @Produce json
// @Param id path string true "Courier ID"
// @Param limit query integer false "Number of records" default(50)
// @Success 200 {object} models.APIResponse{data=[]models.CourierLocationUpdate}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /couriers/{id}/location/history [get]
func (h *LocationHandler) GetLocationHistory(c *gin.Context) {
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

	limit := 50
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 200 {
			limit = l
		}
	}

	history, err := h.locationService.GetLocationHistory(courierID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get location history",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Location history retrieved successfully",
		Data:    history,
	})
}

func (h *LocationHandler) RegisterRoutes(r *gin.RouterGroup) {
	location := r.Group("/location")
	{
		location.PUT("/couriers/:id", h.UpdateLocation)
		location.GET("/couriers/:id", h.GetLocation)
		location.GET("/couriers/:id/history", h.GetLocationHistory)
	}
}