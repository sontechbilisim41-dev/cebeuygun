import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import { Earnings, Money, ApiResponse, PaginatedResponse } from '@/types';

export const earningsApi = createApi({
  reducerPath: 'earningsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/earnings',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Earnings', 'EarningsStats'],
  endpoints: (builder) => ({
    getDailyEarnings: builder.query<ApiResponse<{
      earnings: Earnings[];
      totalAmount: Money;
      orderCount: number;
      averagePerOrder: Money;
    }>, {
      date?: string;
    }>({
      query: (params) => ({
        url: '/daily',
        params,
      }),
      providesTags: ['Earnings'],
    }),
    
    getWeeklyEarnings: builder.query<ApiResponse<{
      earnings: Array<{
        date: string;
        totalAmount: Money;
        orderCount: number;
        averagePerOrder: Money;
      }>;
      weekTotal: Money;
      weekOrderCount: number;
    }>, {
      weekStart?: string;
    }>({
      query: (params) => ({
        url: '/weekly',
        params,
      }),
      providesTags: ['Earnings'],
    }),
    
    getMonthlyEarnings: builder.query<ApiResponse<{
      earnings: Array<{
        date: string;
        totalAmount: Money;
        orderCount: number;
      }>;
      monthTotal: Money;
      monthOrderCount: number;
      averageDailyEarnings: Money;
    }>, {
      month?: string;
      year?: number;
    }>({
      query: (params) => ({
        url: '/monthly',
        params,
      }),
      providesTags: ['Earnings'],
    }),
    
    getEarningsHistory: builder.query<ApiResponse<PaginatedResponse<Earnings>>, {
      page?: number;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
      status?: 'pending' | 'paid' | 'failed';
    }>({
      query: (params) => ({
        url: '/history',
        params,
      }),
      providesTags: ['Earnings'],
    }),
    
    getEarningsStats: builder.query<ApiResponse<{
      totalEarnings: Money;
      totalOrders: number;
      averagePerOrder: Money;
      bestDay: {
        date: string;
        amount: Money;
        orderCount: number;
      };
      thisWeek: Money;
      thisMonth: Money;
      pendingPayments: Money;
    }>, {
      period?: 'week' | 'month' | 'year';
    }>({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['EarningsStats'],
    }),
    
    getPaymentMethods: builder.query<ApiResponse<Array<{
      id: string;
      type: 'bank_account' | 'mobile_wallet' | 'crypto';
      details: any;
      isDefault: boolean;
      isActive: boolean;
    }>>, void>({
      query: () => '/payment-methods',
    }),
    
    addPaymentMethod: builder.mutation<ApiResponse<void>, {
      type: 'bank_account' | 'mobile_wallet' | 'crypto';
      details: any;
    }>({
      query: (paymentMethod) => ({
        url: '/payment-methods',
        method: 'POST',
        body: paymentMethod,
      }),
    }),
    
    requestPayout: builder.mutation<ApiResponse<{
      payoutId: string;
      amount: Money;
      estimatedArrival: string;
    }>, {
      amount: number;
      paymentMethodId: string;
    }>({
      query: (payout) => ({
        url: '/payout',
        method: 'POST',
        body: payout,
      }),
      invalidatesTags: ['Earnings', 'EarningsStats'],
    }),
    
    getPayoutHistory: builder.query<ApiResponse<PaginatedResponse<{
      id: string;
      amount: Money;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      requestedAt: string;
      completedAt?: string;
      paymentMethod: any;
    }>>, {
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/payouts',
        params,
      }),
    }),
    
    getTaxDocuments: builder.query<ApiResponse<Array<{
      id: string;
      year: number;
      month: number;
      totalEarnings: Money;
      taxAmount: Money;
      documentUrl: string;
      generatedAt: string;
    }>>, {
      year?: number;
    }>({
      query: (params) => ({
        url: '/tax-documents',
        params,
      }),
    }),
  }),
});

export const {
  useGetDailyEarningsQuery,
  useGetWeeklyEarningsQuery,
  useGetMonthlyEarningsQuery,
  useGetEarningsHistoryQuery,
  useGetEarningsStatsQuery,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useRequestPayoutMutation,
  useGetPayoutHistoryQuery,
  useGetTaxDocumentsQuery,
} = earningsApi;