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

type PricingHandler struct {
	service   service.PricingService
	validator *validator.Validate
}

func NewPricingHandler(service service.PricingService) *PricingHandler {
	return &PricingHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Calculate pricing quote
// @Description Calculate comprehensive pricing quote with commission breakdown
// @Tags pricing
// @Accept json
// @Produce json
// @Param quote body models.QuoteRequest true "Quote request"
// @Success 200 {object} models.QuoteResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /quote [post]
func (h *PricingHandler) CalculateQuote(c *gin.Context) {
	var req models.QuoteRequest
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

	// Set request time if not provided
	if req.Context.RequestTime.IsZero() {
		req.Context.RequestTime = time.Now()
	}

	response, err := h.service.CalculateQuote(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to calculate quote",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Create pricing rule
// @Description Create a new versioned pricing rule
// @Tags pricing-rules
// @Accept json
// @Produce json
// @Param rule body models.CreatePricingRuleRequest true "Pricing rule data"
// @Success 201 {object} models.APIResponse{data=models.PricingRule}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pricing-rules [post]
func (h *PricingHandler) CreatePricingRule(c *gin.Context) {
	var req models.CreatePricingRuleRequest
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

	rule, err := h.service.CreatePricingRule(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create pricing rule",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Pricing rule created successfully",
		Data:    rule,
	})
}

// @Summary Get pricing rule
// @Description Get pricing rule by ID
// @Tags pricing-rules
// @Produce json
// @Param id path string true "Pricing Rule ID"
// @Success 200 {object} models.APIResponse{data=models.PricingRule}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pricing-rules/{id} [get]
func (h *PricingHandler) GetPricingRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid pricing rule ID",
			Error:   err.Error(),
		})
		return
	}

	rule, err := h.service.GetPricingRule(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get pricing rule",
			Error:   err.Error(),
		})
		return
	}

	if rule == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Pricing rule not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pricing rule retrieved successfully",
		Data:    rule,
	})
}

// @Summary Update pricing rule
// @Description Update an existing pricing rule
// @Tags pricing-rules
// @Accept json
// @Produce json
// @Param id path string true "Pricing Rule ID"
// @Param rule body models.UpdatePricingRuleRequest true "Pricing rule updates"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pricing-rules/{id} [put]
func (h *PricingHandler) UpdatePricingRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid pricing rule ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdatePricingRuleRequest
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

	err = h.service.UpdatePricingRule(id, &req)
	if err != nil {
		if err.Error() == "pricing rule not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Pricing rule not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update pricing rule",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pricing rule updated successfully",
	})
}

// @Summary Delete pricing rule
// @Description Delete a pricing rule (soft delete)
// @Tags pricing-rules
// @Produce json
// @Param id path string true "Pricing Rule ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pricing-rules/{id} [delete]
func (h *PricingHandler) DeletePricingRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid pricing rule ID",
			Error:   err.Error(),
		})
		return
	}

	err = h.service.DeletePricingRule(id)
	if err != nil {
		if err.Error() == "pricing rule not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Pricing rule not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to delete pricing rule",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pricing rule deleted successfully",
	})
}

// @Summary Get pricing rule versions
// @Description Get all versions of a pricing rule
// @Tags pricing-rules
// @Produce json
// @Param name query string true "Rule name"
// @Success 200 {object} models.APIResponse{data=[]models.PricingRule}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /pricing-rules/versions [get]
func (h *PricingHandler) GetPricingRuleVersions(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Rule name is required",
		})
		return
	}

	versions, err := h.service.GetPricingRuleVersions(name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get pricing rule versions",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pricing rule versions retrieved successfully",
		Data:    versions,
	})
}

// @Summary Get pricing analytics
// @Description Get pricing analytics for a date range
// @Tags analytics
// @Produce json
// @Param start_date query string true "Start date (YYYY-MM-DD)"
// @Param end_date query string true "End date (YYYY-MM-DD)"
// @Param region query string false "Region filter"
// @Success 200 {object} models.APIResponse{data=models.PricingAnalytics}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /analytics/pricing [get]
func (h *PricingHandler) GetPricingAnalytics(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
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

	var regionPtr *string
	if region != "" {
		regionPtr = &region
	}

	analytics, err := h.service.GetPricingAnalytics(startDate, endDate, regionPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get pricing analytics",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pricing analytics retrieved successfully",
		Data:    analytics,
	})
}

func (h *PricingHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Quote endpoint (main endpoint)
	r.POST("/quote", h.CalculateQuote)
	
	// Pricing rules
	pricingRules := r.Group("/pricing-rules")
	{
		pricingRules.POST("", h.CreatePricingRule)
		pricingRules.GET("/:id", h.GetPricingRule)
		pricingRules.PUT("/:id", h.UpdatePricingRule)
		pricingRules.DELETE("/:id", h.DeletePricingRule)
		pricingRules.GET("/versions", h.GetPricingRuleVersions)
	}
	
	// Analytics
	analytics := r.Group("/analytics")
	{
		analytics.GET("/pricing", h.GetPricingAnalytics)
	}
}