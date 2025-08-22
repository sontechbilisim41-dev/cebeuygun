export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface Money {
  currency: string;
  amount: number; // Amount in cents
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: Pagination;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SearchOptions {
  query?: string;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: Partial<Pagination>;
}