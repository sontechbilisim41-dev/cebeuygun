import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { Order, Assignment, DeliveryProof, ApiResponse, PaginatedResponse } from '@/types';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/orders',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order', 'Assignment', 'DeliveryProof'],
  endpoints: (builder) => ({
    getAvailableOrders: builder.query<ApiResponse<Order[]>, {
      radius?: number;
      maxDistance?: number;
    }>({
      query: (params) => ({
        url: '/available',
        params,
      }),
      providesTags: ['Order'],
    }),
    
    getActiveOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => '/active',
      providesTags: ['Order'],
    }),
    
    getOrderHistory: builder.query<ApiResponse<PaginatedResponse<Order>>, {
      page?: number;
      limit?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params) => ({
        url: '/history',
        params,
      }),
      providesTags: ['Order'],
    }),
    
    getOrderDetails: builder.query<ApiResponse<Order>, string>({
      query: (orderId) => `/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    
    acceptOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (orderId) => ({
        url: `/${orderId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Order', 'Assignment'],
    }),
    
    rejectOrder: builder.mutation<ApiResponse<void>, {
      orderId: string;
      reason?: string;
    }>({
      query: ({ orderId, reason }) => ({
        url: `/${orderId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Order'],
    }),
    
    updateOrderStatus: builder.mutation<ApiResponse<Order>, {
      orderId: string;
      status: Order['status'];
      location?: { latitude: number; longitude: number };
      notes?: string;
    }>({
      query: ({ orderId, status, location, notes }) => ({
        url: `/${orderId}/status`,
        method: 'PUT',
        body: { status, location, notes },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),
    
    confirmPickup: builder.mutation<ApiResponse<Order>, {
      orderId: string;
      verificationCode?: string;
      notes?: string;
      location: { latitude: number; longitude: number };
    }>({
      query: ({ orderId, verificationCode, notes, location }) => ({
        url: `/${orderId}/pickup`,
        method: 'POST',
        body: { verificationCode, notes, location },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),
    
    confirmDelivery: builder.mutation<ApiResponse<{
      order: Order;
      proof: DeliveryProof;
    }>, {
      orderId: string;
      proof: {
        type: 'photo' | 'signature' | 'verification_code';
        data: string;
        location: { latitude: number; longitude: number };
        notes?: string;
        customerPresent: boolean;
      };
    }>({
      query: ({ orderId, proof }) => ({
        url: `/${orderId}/delivery`,
        method: 'POST',
        body: proof,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
        'DeliveryProof',
      ],
    }),
    
    reportIssue: builder.mutation<ApiResponse<void>, {
      orderId: string;
      issue: string;
      description?: string;
      photos?: string[];
    }>({
      query: ({ orderId, issue, description, photos }) => ({
        url: `/${orderId}/issue`,
        method: 'POST',
        body: { issue, description, photos },
      }),
    }),
    
    getDeliveryProofs: builder.query<ApiResponse<DeliveryProof[]>, {
      orderId?: string;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params) => ({
        url: '/delivery-proofs',
        params,
      }),
      providesTags: ['DeliveryProof'],
    }),
    
    uploadDeliveryPhoto: builder.mutation<ApiResponse<{ url: string }>, {
      orderId: string;
      photo: FormData;
    }>({
      query: ({ orderId, photo }) => ({
        url: `/${orderId}/photo`,
        method: 'POST',
        body: photo,
      }),
    }),
    
    getRouteOptimization: builder.query<ApiResponse<{
      optimizedRoute: Array<{ latitude: number; longitude: number; address: string }>;
      totalDistance: number;
      estimatedDuration: number;
    }>, {
      pickupLocation: { latitude: number; longitude: number };
      deliveryLocation: { latitude: number; longitude: number };
      currentLocation?: { latitude: number; longitude: number };
    }>({
      query: (params) => ({
        url: '/route-optimization',
        params,
      }),
    }),
    
    trackOrderLocation: builder.mutation<ApiResponse<void>, {
      orderId: string;
      location: {
        latitude: number;
        longitude: number;
        accuracy: number;
        speed?: number;
        heading?: number;
        timestamp: string;
      };
    }>({
      query: ({ orderId, location }) => ({
        url: `/${orderId}/track`,
        method: 'POST',
        body: location,
      }),
    }),
  }),
});

export const {
  useGetAvailableOrdersQuery,
  useGetActiveOrdersQuery,
  useGetOrderHistoryQuery,
  useGetOrderDetailsQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useUpdateOrderStatusMutation,
  useConfirmPickupMutation,
  useConfirmDeliveryMutation,
  useReportIssueMutation,
  useGetDeliveryProofsQuery,
  useUploadDeliveryPhotoMutation,
  useGetRouteOptimizationQuery,
  useTrackOrderLocationMutation,
} = orderApi;