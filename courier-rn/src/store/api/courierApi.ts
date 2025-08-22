import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { Courier, Analytics, WorkingHours, ApiResponse } from '@/types';

export const courierApi = createApi({
  reducerPath: 'courierApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/courier',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Courier', 'Analytics', 'WorkingHours'],
  endpoints: (builder) => ({
    getCourierProfile: builder.query<ApiResponse<Courier>, void>({
      query: () => '/profile',
      providesTags: ['Courier'],
    }),
    
    updateCourierProfile: builder.mutation<ApiResponse<Courier>, Partial<Courier>>({
      query: (updates) => ({
        url: '/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Courier'],
    }),
    
    updateCourierStatus: builder.mutation<ApiResponse<{ status: string }>, {
      status: Courier['status'];
    }>({
      query: ({ status }) => ({
        url: '/status',
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Courier'],
    }),
    
    updateOnlineStatus: builder.mutation<ApiResponse<{ isOnline: boolean }>, {
      isOnline: boolean;
    }>({
      query: ({ isOnline }) => ({
        url: '/online-status',
        method: 'PUT',
        body: { isOnline },
      }),
      invalidatesTags: ['Courier'],
    }),
    
    getAnalytics: builder.query<ApiResponse<Analytics>, {
      period: 'today' | 'week' | 'month';
    }>({
      query: ({ period }) => `/analytics?period=${period}`,
      providesTags: ['Analytics'],
    }),
    
    getWorkingHours: builder.query<ApiResponse<WorkingHours[]>, void>({
      query: () => '/working-hours',
      providesTags: ['WorkingHours'],
    }),
    
    updateWorkingHours: builder.mutation<ApiResponse<WorkingHours[]>, WorkingHours[]>({
      query: (workingHours) => ({
        url: '/working-hours',
        method: 'PUT',
        body: { workingHours },
      }),
      invalidatesTags: ['WorkingHours'],
    }),
    
    uploadDocument: builder.mutation<ApiResponse<{ url: string }>, {
      type: 'license' | 'insurance' | 'vehicle_registration';
      file: FormData;
    }>({
      query: ({ type, file }) => ({
        url: `/documents/${type}`,
        method: 'POST',
        body: file,
      }),
    }),
    
    getCourierRating: builder.query<ApiResponse<{
      averageRating: number;
      totalRatings: number;
      ratingBreakdown: Record<number, number>;
    }>, void>({
      query: () => '/rating',
    }),
    
    reportLocation: builder.mutation<ApiResponse<void>, {
      latitude: number;
      longitude: number;
      accuracy: number;
      speed?: number;
      heading?: number;
      timestamp: string;
    }>({
      query: (location) => ({
        url: '/location',
        method: 'POST',
        body: location,
      }),
    }),
  }),
});

export const {
  useGetCourierProfileQuery,
  useUpdateCourierProfileMutation,
  useUpdateCourierStatusMutation,
  useUpdateOnlineStatusMutation,
  useGetAnalyticsQuery,
  useGetWorkingHoursQuery,
  useUpdateWorkingHoursMutation,
  useUploadDocumentMutation,
  useGetCourierRatingQuery,
  useReportLocationMutation,
} = courierApi;