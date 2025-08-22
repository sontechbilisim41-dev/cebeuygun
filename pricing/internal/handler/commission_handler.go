package handler

import (
	"net/http"
	"time"

	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/cebeuygun/platform/services/pricing/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CommissionHandler struct {
	service   service.PricingService
	validator *validator.Validate
}

func NewCommissionHandler(service service.PricingService) *CommissionHandler {
	return &CommissionHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create commission rate
// @Description Create a new commission rate configuration
// @Tags commission
// @Accept json
// @Produce json
// @Param commission body models.CreateCommissionRateRequest true "Commission rate data"
// @Success 201 {object} models.APIResponse{data=models.CommissionRate}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /commission-rates [post]
func (h *CommissionHandler) CreateCommissionRate(c *gin.Context) {
	var req models.CreateCommissionRateRequest
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

	rate, err := h.service.CreateCommissionRate(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create commission rate",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Commission rate created successfully",
		Data:    rate,
	})
}

// @Summary Get commission rate
// @Description Get commission rate by ID
// @Tags commission
// @Produce json
// @Param id path string true "Commission Rate ID"
// @Success 200 {object} models.APIResponse{data=models.CommissionRate}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /commission-rates/{id} [get]
func (h *CommissionHandler) GetCommissionRate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid commission rate ID",
			Error:   err.Error(),
		})
		return
	}

	rate, err := h.service.GetCommissionRate(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get commission rate",
			Error:   err.Error(),
		})
		return
	}

	if rate == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Commission rate not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Commission rate retrieved successfully",
		Data:    rate,
	})
}

// @Summary Update commission rate
// @Description Update an existing commission rate
// @Tags commission
// @Accept json
// @Produce json
// @Param id path string true "Commission Rate ID"
// @Param commission body models.UpdateCommissionRateRequest true "Commission rate updates"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /commission-rates/{id} [put]
func (h *CommissionHandler) UpdateCommissionRate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid commission rate ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateCommissionRateRequest
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

	err = h.service.UpdateCommissionRate(id, &req)
	if err != nil {
		if err.Error() == "commission rate not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Commission rate not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update commission rate",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Commission rate updated successfully",
	})
}

// @Summary Bulk update commission rates
// @Description Update multiple commission rates at once
// @Tags commission
// @Accept json
// @Produce json
// @Param bulk body models.BulkCommissionUpdateRequest true "Bulk update data"
// @Success 200 {object} models.BulkCommissionUpdateResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /commission-rates/bulk [put]
func (h *CommissionHandler) BulkUpdateCommissionRates(c *gin.Context) {
	var req models.BulkCommissionUpdateRequest
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

	response, err := h.service.BulkUpdateCommissionRates(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to bulk update commission rates",
			Error:   err.Error(),
		})
		return
	}

	statusCode := http.StatusOK
	if !response.Success {
		statusCode = http.StatusPartialContent
	}

	c.JSON(statusCode, response)
}

// @Summary Get commission analytics
// @Description Get commission analytics for a date range
// @Tags analytics
// @Produce json
// @Param start_date query string true "Start date (YYYY-MM-DD)"
// @Param end_date query string true "End date (YYYY-MM-DD)"
// @Param category_id query string false "Category ID filter"
// @Param seller_id query string false "Seller ID filter"
// @Param region query string false "Region filter"
// @Success 200 {object} models.APIResponse{data=models.CommissionAnalytics}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /analytics/commission [get]
func (h *CommissionHandler) GetCommissionAnalytics(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	categoryIDStr := c.Query("category_id")
	sellerIDStr := c.Query("seller_id")
	region := c.Query("region")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "start_date and end_date are required",
		})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid start_date format (use YYYY-MM-DD)",
			Error:   err.Error(),
		})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid end_date format (use YYYY-MM-DD)",
			Error:   err.Error(),
		})
		return
	}

	var categoryID *uuid.UUID
	if categoryIDStr != "" {
		id, err := uuid.Parse(categoryIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid category_id format",
				Error:   err.Error(),
			})
			return
		}
		categoryID = &id
	}

	var sellerID *uuid.UUID
	if sellerIDStr != "" {
		id, err := uuid.Parse(sellerIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Message: "Invalid seller_id format",
				Error:   err.Error(),
			})
			return
		}
		sellerID = &id
	}

	var regionPtr *string
	if region != "" {
		regionPtr = &region
	}

	analytics, err := h.service.GetCommissionAnalytics(startDate, endDate, categoryID, sellerID, regionPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get commission analytics",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Commission analytics retrieved successfully",
		Data:    analytics,
	})
}

func (h *CommissionHandler) RegisterRoutes(r *gin.RouterGroup) {
	commission := r.Group("/commission-rates")
	{
		commission.POST("", h.CreateCommissionRate)
		commission.GET("/:id", h.GetCommissionRate)
		commission.PUT("/:id", h.UpdateCommissionRate)
		commission.PUT("/bulk", h.BulkUpdateCommissionRates)
	}
	
	analytics := r.Group("/analytics")
	{
		analytics.GET("/commission", h.GetCommissionAnalytics)
	}
}