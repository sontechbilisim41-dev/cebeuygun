import { apiClient } from './apiClient';
import { mockOrderService } from './mockData/mockOrderService';
import { Order, Assignment, DeliveryProof } from '@/types';
import { store } from '@/store';

class OrderService {
  private get useMockData(): boolean {
    return store.getState().settings.useMockData;
  }

  async getAvailableOrders(): Promise<Order[]> {
    if (this.useMockData) {
      return mockOrderService.getAvailableOrders();
    }

    const response = await apiClient.get('/orders/available');
    return response.data;
  }

  async getActiveOrders(): Promise<Order[]> {
    if (this.useMockData) {
      return mockOrderService.getActiveOrders();
    }

    const response = await apiClient.get('/orders/active');
    return response.data;
  }

  async getOrderHistory(params: { page?: number; limit?: number } = {}): Promise<Order[]> {
    if (this.useMockData) {
      return mockOrderService.getOrderHistory(params);
    }

    const response = await apiClient.get('/orders/history', { params });
    return response.data;
  }

  async getOrderDetails(orderId: string): Promise<Order> {
    if (this.useMockData) {
      return mockOrderService.getOrderDetails(orderId);
    }

    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  }

  async acceptOrder(orderId: string): Promise<Order> {
    if (this.useMockData) {
      return mockOrderService.acceptOrder(orderId);
    }

    const response = await apiClient.post(`/orders/${orderId}/accept`);
    return response.data;
  }

  async rejectOrder(orderId: string, reason?: string): Promise<void> {
    if (this.useMockData) {
      return mockOrderService.rejectOrder(orderId, reason);
    }

    await apiClient.post(`/orders/${orderId}/reject`, { reason });
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    if (this.useMockData) {
      return mockOrderService.updateOrderStatus(orderId, status);
    }

    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }

  async confirmPickup(orderId: string): Promise<Order> {
    if (this.useMockData) {
      return mockOrderService.confirmPickup(orderId);
    }

    const state = store.getState();
    const location = state.location.currentLocation;

    const response = await apiClient.post(`/orders/${orderId}/pickup`, {
      location,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  }

  async confirmDelivery(orderId: string, proof: Partial<DeliveryProof>): Promise<{
    order: Order;
    proof: DeliveryProof;
  }> {
    if (this.useMockData) {
      return mockOrderService.confirmDelivery(orderId, proof);
    }

    const state = store.getState();
    const location = state.location.currentLocation;

    const response = await apiClient.post(`/orders/${orderId}/delivery`, {
      ...proof,
      location,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  }

  async reportIssue(orderId: string, issue: string): Promise<void> {
    if (this.useMockData) {
      return mockOrderService.reportIssue(orderId, issue);
    }

    await apiClient.post(`/orders/${orderId}/issue`, { issue });
  }

  async uploadDeliveryPhoto(orderId: string, photoUri: string): Promise<string> {
    if (this.useMockData) {
      return mockOrderService.uploadDeliveryPhoto(orderId, photoUri);
    }

    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `delivery-${orderId}-${Date.now()}.jpg`,
    } as any);

    const response = await apiClient.post(`/orders/${orderId}/photo`, formData);
    return response.data.url;
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
    if (this.useMockData) {
      return mockOrderService.getRouteOptimization(pickupLocation, deliveryLocation, currentLocation);
    }

    const response = await apiClient.get('/orders/route-optimization', {
      params: {
        pickupLat: pickupLocation.latitude,
        pickupLng: pickupLocation.longitude,
        deliveryLat: deliveryLocation.latitude,
        deliveryLng: deliveryLocation.longitude,
        currentLat: currentLocation?.latitude,
        currentLng: currentLocation?.longitude,
      },
    });
    return response.data;
  }

  async trackOrderLocation(orderId: string, location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
    heading?: number;
    timestamp: string;
  }): Promise<void> {
    if (this.useMockData) {
      return mockOrderService.trackOrderLocation(orderId, location);
    }

    await apiClient.post(`/orders/${orderId}/track`, location);
  }

  async getAssignments(): Promise<Assignment[]> {
    if (this.useMockData) {
      return mockOrderService.getAssignments();
    }

    const response = await apiClient.get('/assignments');
    return response.data;
  }

  async updateAssignmentStatus(
    assignmentId: string, 
    status: Assignment['status']
  ): Promise<Assignment> {
    if (this.useMockData) {
      return mockOrderService.updateAssignmentStatus(assignmentId, status);
    }

    const response = await apiClient.put(`/assignments/${assignmentId}/status`, { status });
    return response.data;
  }
}

export const orderService = new OrderService();