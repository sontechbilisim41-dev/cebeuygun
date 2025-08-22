package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/cebeuygun/platform/services/order/internal/config"
	"github.com/cebeuygun/platform/services/order/internal/models"
	"github.com/cebeuygun/platform/services/order/internal/repository"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
	"github.com/shopspring/decimal"
)

type OrderService interface {
	// Cart operations
	GetCart(customerID uuid.UUID) (*models.Cart, error)
	AddToCart(customerID uuid.UUID, req *models.AddToCartRequest) (*models.CartItem, error)
	UpdateCartItem(customerID uuid.UUID, itemID uuid.UUID, req *models.UpdateCartItemRequest) error
	RemoveFromCart(customerID uuid.UUID, itemID uuid.UUID) error
	ClearCart(customerID uuid.UUID) error
	GetCartSummary(customerID uuid.UUID) (*models.CartSummary, error)
	
	// Order operations
	CreateOrder(customerID uuid.UUID, req *models.CreateOrderRequest) (*models.Order, error)
	GetOrder(id uuid.UUID) (*models.Order, error)
	GetOrdersByCustomer(customerID uuid.UUID, page, limit int) ([]*models.Order, int64, error)
	GetOrdersBySeller(sellerID uuid.UUID, page, limit int) ([]*models.Order, int64, error)
	GetOrdersByCourier(courierID uuid.UUID, page, limit int) ([]*models.Order, int64, error)
	UpdateOrderStatus(id uuid.UUID, status models.OrderStatus, notes *string) error
	AssignCourier(orderID uuid.UUID, courierID uuid.UUID) error
	ProcessPayment(orderID uuid.UUID, paymentMethodID string) error
	
	// Background processes
	StartOutboxProcessor()
}

type orderService struct {
	cartRepo    repository.CartRepository
	orderRepo   repository.OrderRepository
	outboxRepo  repository.OutboxRepository
	redisClient *redis.Client
	kafkaWriter *kafka.Writer
	config      *config.Config
}

func NewOrderService(
	cartRepo repository.CartRepository,
	orderRepo repository.OrderRepository,
	outboxRepo repository.OutboxRepository,
	redisClient *redis.Client,
	cfg *config.Config,
) (OrderService, error) {
	// Initialize Kafka writer
	kafkaWriter := &kafka.Writer{
		Addr:     kafka.TCP(cfg.KafkaBrokers...),
		Balancer: &kafka.LeastBytes{},
	}
	
	return &orderService{
		cartRepo:    cartRepo,
		orderRepo:   orderRepo,
		outboxRepo:  outboxRepo,
		redisClient: redisClient,
		kafkaWriter: kafkaWriter,
		config:      cfg,
	}, nil
}

// Cart operations
func (s *orderService) GetCart(customerID uuid.UUID) (*models.Cart, error) {
	cart, err := s.cartRepo.GetCartByCustomerID(customerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}
	
	if cart == nil {
		// Create new cart
		cart, err = s.cartRepo.GetOrCreateCart(customerID)
		if err != nil {
			return nil, fmt.Errorf("failed to create cart: %w", err)
		}
	}
	
	// Enrich cart items with product information
	for _, item := range cart.Items {
		product, err := s.getProductInfo(item.ProductID)
		if err != nil {
			log.Printf("Failed to get product info for %s: %v", item.ProductID, err)
			continue
		}
		item.Product = product
	}
	
	return cart, nil
}

func (s *orderService) AddToCart(customerID uuid.UUID, req *models.AddToCartRequest) (*models.CartItem, error) {
	// Get or create cart
	cart, err := s.cartRepo.GetOrCreateCart(customerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}
	
	// Get product information
	product, err := s.getProductInfo(req.ProductID)
	if err != nil {
		return nil, fmt.Errorf("failed to get product info: %w", err)
	}
	
	// Get seller ID from product
	sellerID, err := s.getProductSellerID(req.ProductID)
	if err != nil {
		return nil, fmt.Errorf("failed to get seller info: %w", err)
	}
	
	// Validate single seller constraint
	if cart.SellerID != nil && *cart.SellerID != sellerID {
		return nil, fmt.Errorf("cart can only contain items from a single seller")
	}
	
	// Create cart item
	item := &models.CartItem{
		ID:        uuid.New(),
		CartID:    cart.ID,
		ProductID: req.ProductID,
		VariantID: req.VariantID,
		SellerID:  sellerID,
		Quantity:  req.Quantity,
		UnitPrice: product.BasePrice,
		Notes:     req.Notes,
	}
	
	err = s.cartRepo.AddItem(item)
	if err != nil {
		return nil, fmt.Errorf("failed to add item to cart: %w", err)
	}
	
	item.Product = product
	return item, nil
}

func (s *orderService) UpdateCartItem(customerID uuid.UUID, itemID uuid.UUID, req *models.UpdateCartItemRequest) error {
	// Verify item belongs to customer's cart
	cart, err := s.cartRepo.GetCartByCustomerID(customerID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}
	
	if cart == nil {
		return fmt.Errorf("cart not found")
	}
	
	// Check if item exists in cart
	itemExists := false
	for _, item := range cart.Items {
		if item.ID == itemID {
			itemExists = true
			break
		}
	}
	
	if !itemExists {
		return fmt.Errorf("cart item not found")
	}
	
	return s.cartRepo.UpdateItem(itemID, req.Quantity, req.Notes)
}

func (s *orderService) RemoveFromCart(customerID uuid.UUID, itemID uuid.UUID) error {
	// Verify item belongs to customer's cart
	cart, err := s.cartRepo.GetCartByCustomerID(customerID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}
	
	if cart == nil {
		return fmt.Errorf("cart not found")
	}
	
	// Check if item exists in cart
	itemExists := false
	for _, item := range cart.Items {
		if item.ID == itemID {
			itemExists = true
			break
		}
	}
	
	if !itemExists {
		return fmt.Errorf("cart item not found")
	}
	
	return s.cartRepo.RemoveItem(itemID)
}

func (s *orderService) ClearCart(customerID uuid.UUID) error {
	cart, err := s.cartRepo.GetCartByCustomerID(customerID)
	if err != nil {
		return fmt.Errorf("failed to get cart: %w", err)
	}
	
	if cart == nil {
		return fmt.Errorf("cart not found")
	}
	
	return s.cartRepo.ClearCart(cart.ID)
}

func (s *orderService) GetCartSummary(customerID uuid.UUID) (*models.CartSummary, error) {
	cart, err := s.GetCart(customerID)
	if err != nil {
		return nil, err
	}
	
	return s.calculateCartSummary(cart)
}

// Order operations
func (s *orderService) CreateOrder(customerID uuid.UUID, req *models.CreateOrderRequest) (*models.Order, error) {
	// Get cart
	cart, err := s.GetCart(customerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}
	
	if len(cart.Items) == 0 {
		return nil, fmt.Errorf("cart is empty")
	}
	
	if cart.SellerID == nil {
		return nil, fmt.Errorf("cart has no seller assigned")
	}
	
	// Calculate pricing
	summary, err := s.calculateCartSummary(cart)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate pricing: %w", err)
	}
	
	// Apply coupon if provided
	if req.CouponCode != nil {
		discount, err := s.applyCoupon(*req.CouponCode, summary.Subtotal)
		if err != nil {
			log.Printf("Failed to apply coupon %s: %v", *req.CouponCode, err)
		} else {
			summary.DiscountAmount = discount
			summary.TotalAmount = summary.Subtotal.Add(summary.TaxAmount).Add(summary.DeliveryFee).Add(summary.SmallCartFee).Sub(summary.DiscountAmount)
		}
	}
	
	// Create order
	order := &models.Order{
		ID:                    uuid.New(),
		CustomerID:            customerID,
		SellerID:              *cart.SellerID,
		Status:                models.OrderStatusCreated,
		Subtotal:              summary.Subtotal,
		TaxAmount:             summary.TaxAmount,
		DeliveryFee:           summary.DeliveryFee,
		SmallCartFee:          summary.SmallCartFee,
		DiscountAmount:        summary.DiscountAmount,
		TotalAmount:           summary.TotalAmount,
		Currency:              s.config.Currency,
		DeliveryAddress:       &req.DeliveryAddress,
		EstimatedDeliveryTime: s.calculateEstimatedDeliveryTime(cart.Items),
		CouponCode:            req.CouponCode,
		Notes:                 req.Notes,
	}
	
	// Convert cart items to order items
	for _, cartItem := range cart.Items {
		orderItem := &models.OrderItem{
			ID:         uuid.New(),
			ProductID:  cartItem.ProductID,
			VariantID:  cartItem.VariantID,
			Quantity:   cartItem.Quantity,
			UnitPrice:  cartItem.UnitPrice,
			TotalPrice: cartItem.UnitPrice.Mul(decimal.NewFromInt(int64(cartItem.Quantity))),
			Notes:      cartItem.Notes,
		}
		order.Items = append(order.Items, orderItem)
	}
	
	// Create order in database
	err = s.orderRepo.Create(order)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}
	
	// Clear cart
	err = s.cartRepo.ClearCart(cart.ID)
	if err != nil {
		log.Printf("Failed to clear cart after order creation: %v", err)
	}
	
	// Publish order created event
	err = s.publishOrderEvent(order, s.config.KafkaTopics.OrderCreated)
	if err != nil {
		log.Printf("Failed to publish order created event: %v", err)
	}
	
	return order, nil
}

func (s *orderService) GetOrder(id uuid.UUID) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	
	if order == nil {
		return nil, fmt.Errorf("order not found")
	}
	
	// Enrich order items with product information
	for _, item := range order.Items {
		product, err := s.getProductInfo(item.ProductID)
		if err != nil {
			log.Printf("Failed to get product info for %s: %v", item.ProductID, err)
			continue
		}
		item.Product = product
	}
	
	return order, nil
}

func (s *orderService) GetOrdersByCustomer(customerID uuid.UUID, page, limit int) ([]*models.Order, int64, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetByCustomerID(customerID, limit, offset)
}

func (s *orderService) GetOrdersBySeller(sellerID uuid.UUID, page, limit int) ([]*models.Order, int64, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetBySellerID(sellerID, limit, offset)
}

func (s *orderService) GetOrdersByCourier(courierID uuid.UUID, page, limit int) ([]*models.Order, int64, error) {
	offset := (page - 1) * limit
	return s.orderRepo.GetByCourierID(courierID, limit, offset)
}

func (s *orderService) UpdateOrderStatus(id uuid.UUID, status models.OrderStatus, notes *string) error {
	// Get current order
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return fmt.Errorf("failed to get order: %w", err)
	}
	
	if order == nil {
		return fmt.Errorf("order not found")
	}
	
	// Validate state transition
	if !order.Status.CanTransitionTo(status) {
		return fmt.Errorf("invalid status transition from %s to %s", order.Status, status)
	}
	
	// Update status
	err = s.orderRepo.UpdateStatus(id, status, notes)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}
	
	// Set actual delivery time if delivered
	if status == models.OrderStatusDelivered {
		err = s.orderRepo.SetActualDeliveryTime(id)
		if err != nil {
			log.Printf("Failed to set actual delivery time: %v", err)
		}
	}
	
	// Publish status change event
	var topic string
	switch status {
	case models.OrderStatusPaid:
		topic = s.config.KafkaTopics.OrderPaid
	case models.OrderStatusAssigned:
		topic = s.config.KafkaTopics.OrderAssigned
	case models.OrderStatusPickedUp:
		topic = s.config.KafkaTopics.OrderPickedUp
	case models.OrderStatusOnTheWay:
		topic = s.config.KafkaTopics.OrderOnTheWay
	case models.OrderStatusDelivered:
		topic = s.config.KafkaTopics.OrderDelivered
	case models.OrderStatusCanceled:
		topic = s.config.KafkaTopics.OrderCanceled
	}
	
	if topic != "" {
		order.Status = status
		err = s.publishOrderEvent(order, topic)
		if err != nil {
			log.Printf("Failed to publish order status event: %v", err)
		}
	}
	
	return nil
}

func (s *orderService) AssignCourier(orderID uuid.UUID, courierID uuid.UUID) error {
	err := s.orderRepo.AssignCourier(orderID, courierID)
	if err != nil {
		return fmt.Errorf("failed to assign courier: %w", err)
	}
	
	// Update status to assigned
	return s.UpdateOrderStatus(orderID, models.OrderStatusAssigned, nil)
}

func (s *orderService) ProcessPayment(orderID uuid.UUID, paymentMethodID string) error {
	// Get order
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return fmt.Errorf("failed to get order: %w", err)
	}
	
	if order == nil {
		return fmt.Errorf("order not found")
	}
	
	if order.Status != models.OrderStatusCreated {
		return fmt.Errorf("order is not in created status")
	}
	
	// Process payment (mock implementation)
	paymentID := uuid.New()
	err = s.orderRepo.SetPaymentID(orderID, paymentID)
	if err != nil {
		return fmt.Errorf("failed to set payment ID: %w", err)
	}
	
	// Update status to paid
	return s.UpdateOrderStatus(orderID, models.OrderStatusPaid, nil)
}

// Helper methods
func (s *orderService) calculateCartSummary(cart *models.Cart) (*models.CartSummary, error) {
	if len(cart.Items) == 0 {
		return &models.CartSummary{
			ItemCount:      0,
			Subtotal:       decimal.Zero,
			TaxAmount:      decimal.Zero,
			DeliveryFee:    decimal.Zero,
			SmallCartFee:   decimal.Zero,
			DiscountAmount: decimal.Zero,
			TotalAmount:    decimal.Zero,
			Currency:       s.config.Currency,
		}, nil
	}
	
	// Calculate subtotal
	subtotal := decimal.Zero
	itemCount := 0
	
	for _, item := range cart.Items {
		itemTotal := item.UnitPrice.Mul(decimal.NewFromInt(int64(item.Quantity)))
		subtotal = subtotal.Add(itemTotal)
		itemCount += item.Quantity
	}
	
	// Calculate tax
	taxAmount := subtotal.Mul(s.config.TaxRate).Div(decimal.NewFromInt(100))
	
	// Calculate delivery fee (express delivery costs more)
	deliveryFee := s.config.DeliveryFee
	hasExpressDelivery := false
	for _, item := range cart.Items {
		if item.Product != nil && item.Product.IsExpressDelivery {
			hasExpressDelivery = true
			break
		}
	}
	if hasExpressDelivery {
		deliveryFee = s.config.ExpressDeliveryFee
	}
	
	// Calculate small cart fee
	smallCartFee := decimal.Zero
	if subtotal.LessThan(s.config.MinOrderAmount) {
		smallCartFee = s.config.SmallCartFee
	}
	
	// Calculate total
	totalAmount := subtotal.Add(taxAmount).Add(deliveryFee).Add(smallCartFee)
	
	// Get seller info
	var sellerName *string
	if cart.SellerID != nil {
		name, err := s.getSellerName(*cart.SellerID)
		if err == nil {
			sellerName = &name
		}
	}
	
	return &models.CartSummary{
		ItemCount:      itemCount,
		Subtotal:       subtotal,
		TaxAmount:      taxAmount,
		DeliveryFee:    deliveryFee,
		SmallCartFee:   smallCartFee,
		DiscountAmount: decimal.Zero,
		TotalAmount:    totalAmount,
		Currency:       s.config.Currency,
		SellerID:       cart.SellerID,
		SellerName:     sellerName,
	}, nil
}

func (s *orderService) calculateEstimatedDeliveryTime(items []*models.CartItem) *time.Time {
	maxPreparationTime := 0
	for _, item := range items {
		if item.Product != nil && item.Product.PreparationTime > maxPreparationTime {
			maxPreparationTime = item.Product.PreparationTime
		}
	}
	
	// Add 15 minutes for delivery
	estimatedTime := time.Now().Add(time.Duration(maxPreparationTime+15) * time.Minute)
	return &estimatedTime
}

func (s *orderService) getProductInfo(productID uuid.UUID) (*models.Product, error) {
	// This would typically call the catalog service
	// For now, return mock data
	return &models.Product{
		ID:                productID,
		Name:              "Sample Product",
		BasePrice:         decimal.NewFromFloat(29.99),
		Currency:          s.config.Currency,
		IsExpressDelivery: true,
		PreparationTime:   15,
		SellerName:        "Sample Seller",
	}, nil
}

func (s *orderService) getProductSellerID(productID uuid.UUID) (uuid.UUID, error) {
	// This would typically call the catalog service
	// For now, return a mock seller ID
	return uuid.New(), nil
}

func (s *orderService) getSellerName(sellerID uuid.UUID) (string, error) {
	// This would typically call the user/seller service
	return "Sample Seller", nil
}

func (s *orderService) applyCoupon(couponCode string, subtotal decimal.Decimal) (decimal.Decimal, error) {
	// This would typically call the promotion service
	// For now, return a 10% discount
	return subtotal.Mul(decimal.NewFromFloat(0.10)), nil
}

func (s *orderService) publishOrderEvent(order *models.Order, topic string) error {
	// Create event payload
	payload := models.OrderEventPayload{
		OrderID:     order.ID,
		CustomerID:  order.CustomerID,
		SellerID:    order.SellerID,
		Status:      order.Status,
		TotalAmount: order.TotalAmount,
		Currency:    order.Currency,
		Timestamp:   time.Now().UTC(),
	}
	
	// Convert order items
	for _, item := range order.Items {
		payload.Items = append(payload.Items, models.OrderItemEvent{
			ProductID:  item.ProductID,
			VariantID:  item.VariantID,
			Quantity:   item.Quantity,
			UnitPrice:  item.UnitPrice,
			TotalPrice: item.TotalPrice,
		})
	}
	
	// Create outbox event
	outboxEvent := &models.OutboxEvent{
		ID:          uuid.New(),
		AggregateID: order.ID,
		EventType:   topic,
		EventData:   payload,
		Published:   false,
	}
	
	return s.outboxRepo.Create(outboxEvent)
}

// Outbox processor
func (s *orderService) StartOutboxProcessor() {
	ticker := time.NewTicker(s.config.OutboxProcessInterval)
	defer ticker.Stop()
	
	log.Println("Starting outbox processor...")
	
	for {
		select {
		case <-ticker.C:
			s.processOutboxEvents()
		}
	}
}

func (s *orderService) processOutboxEvents() {
	events, err := s.outboxRepo.GetUnpublished(s.config.OutboxBatchSize)
	if err != nil {
		log.Printf("Failed to get unpublished events: %v", err)
		return
	}
	
	if len(events) == 0 {
		return
	}
	
	log.Printf("Processing %d outbox events", len(events))
	
	var publishedIDs []uuid.UUID
	
	for _, event := range events {
		err := s.publishToKafka(event)
		if err != nil {
			log.Printf("Failed to publish event %s: %v", event.ID, err)
			continue
		}
		
		publishedIDs = append(publishedIDs, event.ID)
	}
	
	// Mark events as published
	if len(publishedIDs) > 0 {
		err = s.outboxRepo.MarkAsPublishedBatch(publishedIDs)
		if err != nil {
			log.Printf("Failed to mark events as published: %v", err)
		} else {
			log.Printf("Successfully published %d events", len(publishedIDs))
		}
	}
}

func (s *orderService) publishToKafka(event *models.OutboxEvent) error {
	eventDataJSON, err := json.Marshal(event.EventData)
	if err != nil {
		return fmt.Errorf("failed to serialize event data: %w", err)
	}
	
	message := kafka.Message{
		Topic: event.EventType,
		Key:   []byte(event.AggregateID.String()),
		Value: eventDataJSON,
		Headers: []kafka.Header{
			{Key: "event_id", Value: []byte(event.ID.String())},
			{Key: "event_type", Value: []byte(event.EventType)},
			{Key: "timestamp", Value: []byte(event.CreatedAt.Format(time.RFC3339))},
		},
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	return s.kafkaWriter.WriteMessages(ctx, message)
}