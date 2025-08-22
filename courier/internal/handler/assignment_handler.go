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

type AssignmentHandler struct {
	service   service.CourierService
	validator *validator.Validate
}

func NewAssignmentHandler(service service.CourierService) *AssignmentHandler {
	return &AssignmentHandler{
		service:   service,
		validator: validator.New(),
	}
}

// @Summary Assign courier to order
// @Description Automatically assign the best available courier to an order
// @Tags assignments
// @Accept json
// @Produce json
// @Param assignment body models.AssignOrderRequest true "Assignment request"
// @Success 200 {object} models.AssignmentResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /assign [post]
func (h *AssignmentHandler) AssignOrder(c *gin.Context) {
	var req models.AssignOrderRequest
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

	response, err := h.service.AssignOrder(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Assignment failed",
			Error:   err.Error(),
		})
		return
	}

	statusCode := http.StatusOK
	if !response.Success {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, response)
}

// @Summary Manual courier assignment
// @Description Manually assign a specific courier to an order (admin only)
// @Tags assignments
// @Accept json
// @Produce json
// @Param assignment body models.ManualAssignRequest true "Manual assignment request"
// @Success 200 {object} models.AssignmentResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /assign/manual [post]
func (h *AssignmentHandler) ManualAssign(c *gin.Context) {
	// TODO: Add admin role validation here
	// userRole := c.GetHeader("X-User-Role")
	// if userRole != "ADMIN" {
	//     c.JSON(http.StatusForbidden, models.APIResponse{
	//         Success: false,
	//         Message: "Admin access required",
	//     })
	//     return
	// }

	var req models.ManualAssignRequest
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

	response, err := h.service.ManualAssign(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Manual assignment failed",
			Error:   err.Error(),
		})
		return
	}

	statusCode := http.StatusOK
	if !response.Success {
		statusCode = http.StatusBadRequest
	}

	c.JSON(statusCode, response)
}

// @Summary Get assignment details
// @Description Get assignment details by ID
// @Tags assignments
// @Produce json
// @Param id path string true "Assignment ID"
// @Success 200 {object} models.APIResponse{data=models.Assignment}
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /assignments/{id} [get]
func (h *AssignmentHandler) GetAssignment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid assignment ID",
			Error:   err.Error(),
		})
		return
	}

	assignment, err := h.service.GetAssignment(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to get assignment",
			Error:   err.Error(),
		})
		return
	}

	if assignment == nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "Assignment not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Assignment retrieved successfully",
		Data:    assignment,
	})
}

// @Summary Update assignment status
// @Description Update the status of an assignment
// @Tags assignments
// @Accept json
// @Produce json
// @Param id path string true "Assignment ID"
// @Param status body object{status=string,notes=string} true "Status update"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /assignments/{id}/status [patch]
func (h *AssignmentHandler) UpdateStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid assignment ID",
			Error:   err.Error(),
		})
		return
	}

	var req struct {
		Status models.AssignmentStatus `json:"status" validate:"required"`
		Notes  *string                 `json:"notes,omitempty"`
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
			Message: "Invalid assignment status",
		})
		return
	}

	err = h.service.UpdateAssignmentStatus(id, req.Status, req.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "Failed to update assignment status",
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Assignment status updated successfully",
	})
}

func (h *AssignmentHandler) RegisterRoutes(r *gin.RouterGroup) {
	// Assignment routes
	r.POST("/assign", h.AssignOrder)
	r.POST("/assign/manual", h.ManualAssign)
	
	assignments := r.Group("/assignments")
	{
		assignments.GET("/:id", h.GetAssignment)
		assignments.PATCH("/:id/status", h.UpdateStatus)
	}
}