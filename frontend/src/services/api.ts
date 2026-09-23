/// <reference types="vite/client" />

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...customConfig } = options;

  // Build query string if params provided
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      // Clear token only if on protected route
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.errors);
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other fetch error
    throw new ApiError(error.message || 'Network error. Please check your connection.', 0);
  }
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>) =>
    apiRequest<T>(url, { method: 'GET', params }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(url: string) =>
    apiRequest<T>(url, { method: 'DELETE' }),
};

