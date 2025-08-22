import { store } from '@/store';
import { refreshToken, logoutUser } from '@/store/slices/authSlice';

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = store.getState().settings.apiEndpoint;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { url, method = 'GET', headers = {}, body, params } = config;
    
    // Build URL with params
    const fullUrl = new URL(url, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    // Prepare headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth token if available
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove Content-Type for FormData (browser will set it with boundary)
        delete requestHeaders['Content-Type'];
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(fullUrl.toString(), requestOptions);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && accessToken) {
        try {
          await store.dispatch(refreshToken()).unwrap();
          
          // Retry the original request with new token
          const newState = store.getState();
          const newAccessToken = newState.auth.accessToken;
          
          if (newAccessToken) {
            requestHeaders.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(fullUrl.toString(), {
              ...requestOptions,
              headers: requestHeaders,
            });
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
            }
            
            const retryData = await retryResponse.json();
            return {
              data: retryData,
              status: retryResponse.status,
              statusText: retryResponse.statusText,
              headers: this.parseHeaders(retryResponse.headers),
            };
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(logoutUser());
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  async get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(url: string, body?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  async put<T>(url: string, body?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  async patch<T>(url: string, body?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // Update base URL (for environment switching)
  updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    // Implementation would depend on specific needs
  }

  // Add response interceptor
  addResponseInterceptor(
    onSuccess: (response: ApiResponse) => ApiResponse,
    onError: (error: Error) => Promise<never>
  ): void {
    // Implementation would depend on specific needs
  }
}

export const apiClient = new ApiClient();