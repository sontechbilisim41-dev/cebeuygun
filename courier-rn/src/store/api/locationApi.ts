import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { Location, LocationUpdate, ApiResponse } from '@/types';

export const locationApi = createApi({
  reducerPath: 'locationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/location',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Location', 'Route'],
  endpoints: (builder) => ({
    updateLocation: builder.mutation<ApiResponse<void>, LocationUpdate>({
      query: (locationUpdate) => ({
        url: '/update',
        method: 'POST',
        body: locationUpdate,
      }),
    }),
    
    getOptimizedRoute: builder.query<ApiResponse<{
      route: Array<{ latitude: number; longitude: number }>;
      distance: number;
      duration: number;
      instructions: Array<{
        instruction: string;
        distance: number;
        duration: number;
        location: { latitude: number; longitude: number };
      }>;
    }>, {
      origin: { latitude: number; longitude: number };
      destination: { latitude: number; longitude: number };
      waypoints?: Array<{ latitude: number; longitude: number }>;
      optimize?: boolean;
    }>({
      query: (params) => ({
        url: '/route',
        params,
      }),
      providesTags: ['Route'],
    }),
    
    getLocationHistory: builder.query<ApiResponse<Array<{
      location: Location;
      timestamp: string;
      orderId?: string;
    }>>, {
      dateFrom?: string;
      dateTo?: string;
      orderId?: string;
    }>({
      query: (params) => ({
        url: '/history',
        params,
      }),
      providesTags: ['Location'],
    }),
    
    getNearbyOrders: builder.query<ApiResponse<Array<{
      order: any;
      distance: number;
      estimatedDuration: number;
    }>>, {
      latitude: number;
      longitude: number;
      radius?: number;
    }>({
      query: (params) => ({
        url: '/nearby-orders',
        params,
      }),
    }),
    
    getTrafficInfo: builder.query<ApiResponse<{
      currentTraffic: 'light' | 'moderate' | 'heavy';
      estimatedDelay: number;
      alternativeRoutes: Array<{
        route: Array<{ latitude: number; longitude: number }>;
        distance: number;
        duration: number;
        trafficLevel: 'light' | 'moderate' | 'heavy';
      }>;
    }>, {
      origin: { latitude: number; longitude: number };
      destination: { latitude: number; longitude: number };
    }>({
      query: (params) => ({
        url: '/traffic',
        params,
      }),
    }),
    
    reportLocationIssue: builder.mutation<ApiResponse<void>, {
      issue: 'gps_accuracy' | 'no_signal' | 'battery_drain' | 'other';
      description?: string;
      location?: Location;
    }>({
      query: (report) => ({
        url: '/report-issue',
        method: 'POST',
        body: report,
      }),
    }),
  }),
});

export const {
  useUpdateLocationMutation,
  useGetOptimizedRouteQuery,
  useGetLocationHistoryQuery,
  useGetNearbyOrdersQuery,
  useGetTrafficInfoQuery,
  useReportLocationIssueMutation,
} = locationApi;