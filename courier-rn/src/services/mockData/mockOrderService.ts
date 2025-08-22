import { Order, Assignment, DeliveryProof } from '@/types';

// Mock orders data
const mockAvailableOrders: Order[] = [
  {
    id: 'order-001',
    customerId: 'customer-001',
    restaurantId: 'restaurant-001',
    restaurantName: 'Pizza Palace',
    restaurantPhone: '+90 212 555 0101',
    customerName: 'Mehmet Özkan',
    customerPhone: '+90 555 987 6543',
    pickupAddress: {
      latitude: 41.0082,
      longitude: 28.9784,
      address: 'Galata Kulesi Mah. Büyük Hendek Cad. No:15',
      city: 'İstanbul',
      district: 'Beyoğlu',
      instructions: 'Mavi kapıdan girin',
    },
    deliveryAddress: {
      latitude: 41.0369,
      longitude: 28.9857,
      address: 'Maslak Mah. Büyükdere Cad. No:255 Daire:12',
      city: 'İstanbul',
      district: 'Şişli',
      buildingNo: '255',
      floor: '3',
      apartmentNo: '12',
      instructions: 'Kapıcıya bırakabilirsiniz',
    },
    items: [
      {
        id: 'item-001',
        name: 'Margherita Pizza (Büyük)',
        quantity: 1,
        price: { amount: 4500, currency: 'TRY' },
        image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=150',
        specialInstructions: 'Az baharatlı',
      },
      {
        id: 'item-002',
        name: 'Coca Cola (500ml)',
        quantity: 2,
        price: { amount: 800, currency: 'TRY' },
        image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ],
    totalAmount: { amount: 6100, currency: 'TRY' },
    deliveryFee: { amount: 500, currency: 'TRY' },
    status: 'pending',
    estimatedPickupTime: '2024-01-20T18:30:00Z',
    estimatedDeliveryTime: '2024-01-20T19:00:00Z',
    verificationCode: '1234',
    priority: 'normal',
    distance: 5.2,
    estimatedDuration: 25,
    createdAt: '2024-01-20T18:00:00Z',
    updatedAt: '2024-01-20T18:15:00Z',
  },
  {
    id: 'order-002',
    customerId: 'customer-002',
    restaurantId: 'restaurant-002',
    restaurantName: 'Burger House',
    restaurantPhone: '+90 212 555 0202',
    customerName: 'Ayşe Demir',
    customerPhone: '+90 555 123 7890',
    pickupAddress: {
      latitude: 41.0255,
      longitude: 28.9744,
      address: 'Taksim Meydan No:1',
      city: 'İstanbul',
      district: 'Beyoğlu',
    },
    deliveryAddress: {
      latitude: 41.0138,
      longitude: 28.9497,
      address: 'Eminönü Mah. Hobyar Cad. No:45',
      city: 'İstanbul',
      district: 'Fatih',
      instructions: 'Ofis binası, 2. kat',
    },
    items: [
      {
        id: 'item-003',
        name: 'Cheeseburger Menü',
        quantity: 1,
        price: { amount: 3200, currency: 'TRY' },
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ],
    totalAmount: { amount: 3700, currency: 'TRY' },
    deliveryFee: { amount: 500, currency: 'TRY' },
    status: 'pending',
    estimatedPickupTime: '2024-01-20T19:00:00Z',
    estimatedDeliveryTime: '2024-01-20T19:30:00Z',
    verificationCode: '5678',
    priority: 'high',
    distance: 3.8,
    estimatedDuration: 18,
    createdAt: '2024-01-20T18:30:00Z',
    updatedAt: '2024-01-20T18:30:00Z',
  },
  {
    id: 'order-003',
    customerId: 'customer-003',
    restaurantId: 'restaurant-003',
    restaurantName: 'Sushi Tokyo',
    restaurantPhone: '+90 212 555 0303',
    customerName: 'Can Kaya',
    customerPhone: '+90 555 456 1234',
    pickupAddress: {
      latitude: 41.0431,
      longitude: 29.0061,
      address: 'Levent Mah. Büyükdere Cad. No:120',
      city: 'İstanbul',
      district: 'Beşiktaş',
    },
    deliveryAddress: {
      latitude: 41.0766,
      longitude: 29.0573,
      address: 'Maslak Mah. Ahi Evran Cad. No:6',
      city: 'İstanbul',
      district: 'Sarıyer',
      buildingNo: '6',
      floor: '15',
      apartmentNo: '1502',
    },
    items: [
      {
        id: 'item-004',
        name: 'Salmon Sushi Set',
        quantity: 1,
        price: { amount: 8500, currency: 'TRY' },
        image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=150',
      },
    ],
    totalAmount: { amount: 9000, currency: 'TRY' },
    deliveryFee: { amount: 500, currency: 'TRY' },
    status: 'pending',
    estimatedPickupTime: '2024-01-20T20:00:00Z',
    estimatedDeliveryTime: '2024-01-20T20:45:00Z',
    verificationCode: '9012',
    priority: 'urgent',
    distance: 8.1,
    estimatedDuration: 35,
    createdAt: '2024-01-20T19:15:00Z',
    updatedAt: '2024-01-20T19:15:00Z',
  },
];

let mockActiveOrder: Order | null = null;
let mockOrderHistory: Order[] = [];

class MockOrderService {
  async getAvailableOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockAvailableOrders.filter(order => order.status === 'pending');
  }

  async getActiveOrders(): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockActiveOrder ? [mockActiveOrder] : [];
  }

  async getOrderHistory(params: { page?: number; limit?: number } = {}): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const { page = 1, limit = 20 } = params;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return mockOrderHistory.slice(startIndex, endIndex);
  }

  async getOrderDetails(orderId: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = mockAvailableOrders.find(o => o.id === orderId) || 
                  mockActiveOrder ||
                  mockOrderHistory.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    return order;
  }

  async acceptOrder(orderId: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orderIndex = mockAvailableOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Sipariş bulunamadı veya zaten kabul edilmiş');
    }
    
    const order = mockAvailableOrders[orderIndex];
    const acceptedOrder: Order = {
      ...order,
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    };
    
    // Remove from available orders
    mockAvailableOrders.splice(orderIndex, 1);
    
    // Set as active order
    mockActiveOrder = acceptedOrder;
    
    return acceptedOrder;
  }

  async rejectOrder(orderId: string, reason?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const orderIndex = mockAvailableOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      mockAvailableOrders.splice(orderIndex, 1);
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (mockActiveOrder?.id === orderId) {
      mockActiveOrder = {
        ...mockActiveOrder,
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'picked_up' && { actualPickupTime: new Date().toISOString() }),
        ...(status === 'delivered' && { actualDeliveryTime: new Date().toISOString() }),
      };
      
      // If order is completed, move to history
      if (status === 'delivered' || status === 'cancelled') {
        mockOrderHistory.unshift(mockActiveOrder);
        mockActiveOrder = null;
      }
      
      return mockActiveOrder || mockOrderHistory[0];
    }
    
    throw new Error('Aktif sipariş bulunamadı');
  }

  async confirmPickup(orderId: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    if (mockActiveOrder?.id === orderId) {
      mockActiveOrder = {
        ...mockActiveOrder,
        status: 'picked_up',
        actualPickupTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return mockActiveOrder;
    }
    
    throw new Error('Aktif sipariş bulunamadı');
  }

  async confirmDelivery(orderId: string, proof: Partial<DeliveryProof>): Promise<{
    order: Order;
    proof: DeliveryProof;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (mockActiveOrder?.id === orderId) {
      const completedOrder: Order = {
        ...mockActiveOrder,
        status: 'delivered',
        actualDeliveryTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const deliveryProof: DeliveryProof = {
        id: `proof-${Date.now()}`,
        orderId,
        type: proof.type || 'verification_code',
        data: proof.data || '',
        timestamp: new Date().toISOString(),
        location: proof.location || { latitude: 41.0369, longitude: 28.9857, timestamp: Date.now() },
      };
      
      // Move to history
      mockOrderHistory.unshift(completedOrder);
      mockActiveOrder = null;
      
      return {
        order: completedOrder,
        proof: deliveryProof,
      };
    }
    
    throw new Error('Aktif sipariş bulunamadı');
  }

  async reportIssue(orderId: string, issue: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log(`Issue reported for order ${orderId}: ${issue}`);
  }

  async uploadDeliveryPhoto(orderId: string, photoUri: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock photo upload - return a mock URL
    return `https://mock-storage.com/delivery-photos/${orderId}-${Date.now()}.jpg`;
  }

  async getRouteOptimization(
    pickupLocation: { latitude: number; longitude: number },
    deliveryLocation: { latitude: number; longitude: number },
    currentLocation?: { latitude: number; longitude: number }
  ): Promise<{
    optimizedRoute: Array<{ latitude: number; longitude: number; address: string }>;
    totalDistance: number;
    estimatedDuration: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const route = [];
    
    if (currentLocation) {
      route.push({
        ...currentLocation,
        address: 'Mevcut Konumunuz',
      });
    }
    
    route.push({
      ...pickupLocation,
      address: 'Restoran - Alım Noktası',
    });
    
    route.push({
      ...deliveryLocation,
      address: 'Müşteri - Teslimat Noktası',
    });
    
    // Calculate mock distance and duration
    const distance = this.calculateDistance(pickupLocation, deliveryLocation);
    const duration = Math.round(distance * 3); // Rough estimate: 3 minutes per km
    
    return {
      optimizedRoute: route,
      totalDistance: distance,
      estimatedDuration: duration,
    };
  }

  async trackOrderLocation(orderId: string, location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  }): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Location tracked for order ${orderId}:`, location);
  }

  async getAssignments(): Promise<Assignment[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'assignment-001',
        orderId: 'order-001',
        courierId: 'courier-123',
        status: 'ACCEPTED',
        assignedAt: '2024-01-20T18:15:00Z',
        acceptedAt: '2024-01-20T18:16:00Z',
        pickupLocation: {
          latitude: 41.0082,
          longitude: 28.9784,
          address: 'Galata Kulesi Mah. Büyük Hendek Cad. No:15',
        },
        deliveryLocation: {
          latitude: 41.0369,
          longitude: 28.9857,
          address: 'Maslak Mah. Büyükdere Cad. No:255 Daire:12',
        },
        estimatedDistance: 5.2,
        estimatedDuration: 25,
      },
    ];
  }

  async updateAssignmentStatus(
    assignmentId: string, 
    status: Assignment['status']
  ): Promise<Assignment> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      id: assignmentId,
      orderId: 'order-001',
      courierId: 'courier-123',
      status,
      assignedAt: '2024-01-20T18:15:00Z',
      acceptedAt: status === 'ACCEPTED' ? new Date().toISOString() : undefined,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
      pickupLocation: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: 'Galata Kulesi Mah. Büyük Hendek Cad. No:15',
      },
      deliveryLocation: {
        latitude: 41.0369,
        longitude: 28.9857,
        address: 'Maslak Mah. Büyükdere Cad. No:255 Daire:12',
      },
      estimatedDistance: 5.2,
      estimatedDuration: 25,
    };
  }

  private calculateDistance(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * 
      Math.cos(this.toRadians(to.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Generate more mock orders for testing
  generateMockOrder(id: string): Order {
    const restaurants = [
      { name: 'Pizza Palace', phone: '+90 212 555 0101' },
      { name: 'Burger House', phone: '+90 212 555 0202' },
      { name: 'Sushi Tokyo', phone: '+90 212 555 0303' },
      { name: 'Döner King', phone: '+90 212 555 0404' },
      { name: 'Pasta Corner', phone: '+90 212 555 0505' },
    ];
    
    const customers = [
      { name: 'Mehmet Özkan', phone: '+90 555 987 6543' },
      { name: 'Ayşe Demir', phone: '+90 555 123 7890' },
      { name: 'Can Kaya', phone: '+90 555 456 1234' },
      { name: 'Zeynep Şahin', phone: '+90 555 789 0123' },
      { name: 'Emre Yıldız', phone: '+90 555 321 6547' },
    ];
    
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    const pickupLat = 41.0082 + (Math.random() - 0.5) * 0.1;
    const pickupLng = 28.9784 + (Math.random() - 0.5) * 0.1;
    const deliveryLat = 41.0369 + (Math.random() - 0.5) * 0.1;
    const deliveryLng = 28.9857 + (Math.random() - 0.5) * 0.1;
    
    const distance = this.calculateDistance(
      { latitude: pickupLat, longitude: pickupLng },
      { latitude: deliveryLat, longitude: deliveryLng }
    );
    
    return {
      id,
      customerId: `customer-${Math.random().toString(36).substr(2, 9)}`,
      restaurantId: `restaurant-${Math.random().toString(36).substr(2, 9)}`,
      restaurantName: restaurant.name,
      restaurantPhone: restaurant.phone,
      customerName: customer.name,
      customerPhone: customer.phone,
      pickupAddress: {
        latitude: pickupLat,
        longitude: pickupLng,
        address: `Pickup Address ${Math.floor(Math.random() * 100)}`,
        city: 'İstanbul',
        district: 'Beyoğlu',
      },
      deliveryAddress: {
        latitude: deliveryLat,
        longitude: deliveryLng,
        address: `Delivery Address ${Math.floor(Math.random() * 100)}`,
        city: 'İstanbul',
        district: 'Şişli',
        buildingNo: Math.floor(Math.random() * 200).toString(),
        floor: Math.floor(Math.random() * 20).toString(),
        apartmentNo: Math.floor(Math.random() * 50).toString(),
      },
      items: [
        {
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          name: 'Sample Food Item',
          quantity: Math.floor(Math.random() * 3) + 1,
          price: { amount: Math.floor(Math.random() * 5000) + 1000, currency: 'TRY' },
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=150',
        },
      ],
      totalAmount: { amount: Math.floor(Math.random() * 8000) + 2000, currency: 'TRY' },
      deliveryFee: { amount: 500, currency: 'TRY' },
      status: 'pending',
      estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      verificationCode: Math.floor(Math.random() * 9000 + 1000).toString(),
      priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
      distance,
      estimatedDuration: Math.round(distance * 3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const mockOrderService = new MockOrderService();