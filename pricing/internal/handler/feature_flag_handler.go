package handler

import (
	"net/http"

	"github.com/cebeuygun/platform/services/pricing/internal/models"
	"github.com/cebeuygun/platform/services/pricing/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type FeatureFlagHandler struct {
	service   service.PricingService
	validator *validator.Validate
}

func NewFeatureFlagHandler(service service.PricingService) *FeatureFlagHandler {
	return &FeatureFlagHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Create feature flag
// @Description Create a new feature flag for gradual rollout
// @Tags feature-flags
// @Accept json
// @Produce json
// @Param flag body models.CreateFeatureFlagRequest true "Feature flag data"
// @Success 201 {object} models.APIResponse{data=models.FeatureFlag}
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /feature-flags [post]
func (h *FeatureFlagHandler) CreateFeatureFlag(c *gin.Context) {
	var req models.CreateFeatureFlagRequest
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

	flag, err := h.service.CreateFeatureFlag(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to create feature flag",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Feature flag created successfully",
		Data:    flag,
	})
}

// @Summary Get feature flag
// @Description Get feature flag by ID
// @Tags feature-flags
// @Produce json
// @Param id path string true "Feature Flag ID"
// @Success 200 {object} models.APIResponse{data=models.FeatureFlag}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /feature-flags/{id} [get]
func (h *FeatureFlagHandler) GetFeatureFlag(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid feature flag ID",
			Error:   err.Error(),
		})
		return
	}

	flag, err := h.service.GetFeatureFlag(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get feature flag",
			Error:   err.Error(),
		})
		return
	}

	if flag == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Feature flag not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Feature flag retrieved successfully",
		Data:    flag,
	})
}

// @Summary Get feature flag by key
// @Description Get feature flag by key name
// @Tags feature-flags
// @Produce json
// @Param key path string true "Feature Flag Key"
// @Success 200 {object} models.APIResponse{data=models.FeatureFlag}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /feature-flags/key/{key} [get]
func (h *FeatureFlagHandler) GetFeatureFlagByKey(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Feature flag key is required",
		})
		return
	}

	flag, err := h.service.GetFeatureFlagByKey(key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get feature flag",
			Error:   err.Error(),
		})
		return
	}

	if flag == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Feature flag not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Feature flag retrieved successfully",
		Data:    flag,
	})
}

// @Summary Evaluate feature flag
// @Description Evaluate feature flag value for given context
// @Tags feature-flags
// @Accept json
// @Produce json
// @Param key path string true "Feature Flag Key"
// @Param context body map[string]interface{} false "Evaluation context"
// @Success 200 {object} models.APIResponse{data=interface{}}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /feature-flags/{key}/evaluate [post]
func (h *FeatureFlagHandler) EvaluateFeatureFlag(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Feature flag key is required",
		})
		return
	}

	var context map[string]interface{}
	if err := c.ShouldBindJSON(&context); err != nil {
		// If no context provided, use empty map
		context = make(map[string]interface{})
	}

	value, err := h.service.EvaluateFeatureFlag(key, context)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Feature flag evaluation failed",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Feature flag evaluated successfully",
		Data:    value,
	})
}

// @Summary Update feature flag
// @Description Update an existing feature flag
// @Tags feature-flags
// @Accept json
// @Produce json
// @Param id path string true "Feature Flag ID"
// @Param flag body models.UpdateFeatureFlagRequest true "Feature flag updates"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /feature-flags/{id} [put]
func (h *FeatureFlagHandler) UpdateFeatureFlag(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid feature flag ID",
			Error:   err.Error(),
		})
		return
	}

	var req models.UpdateFeatureFlagRequest
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

	err = h.service.UpdateFeatureFlag(id, &req)
	if err != nil {
		if err.Error() == "feature flag not found" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Message: "Feature flag not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update feature flag",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Feature flag updated successfully",
	})
}

func (h *FeatureFlagHandler) RegisterRoutes(r *gin.RouterGroup) {
	featureFlags := r.Group("/feature-flags")
	{
		featureFlags.POST("", h.CreateFeatureFlag)
		featureFlags.GET("/:id", h.GetFeatureFlag)
		featureFlags.GET("/key/:key", h.GetFeatureFlagByKey)
		featureFlags.POST("/:key/evaluate", h.EvaluateFeatureFlag)
		featureFlags.PUT("/:id", h.UpdateFeatureFlag)
	}
}