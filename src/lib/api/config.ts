/**
 * API Configuration
 */

import { browser } from '$app/environment';

// Configuración del backend Django
export const API_CONFIG = {
  BASE_URL: browser ? 
    (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') : 
    'http://localhost:8000',
  API_PREFIX: '/api',
  AUTH_PREFIX: '/auth',
  TIMEOUT: browser ? 
    parseInt(import.meta.env.VITE_API_TIMEOUT || '10000') : 
    10000,
  
    // Endpoints específicos
  ENDPOINTS: {
    // Autenticación (sin barras finales según el backend)
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    
    // Registros
    REGISTROS: '/api/registros',
    REGISTROS_CREATE: '/api/registros',
    REGISTROS_UPDATE: (id: string) => `/api/registros/${id}`,
    REGISTROS_DELETE: (id: string) => `/api/registros/${id}`,
    REGISTROS_DETAIL: (id: string) => `/api/registros/${id}`,
    REGISTROS_STATS: '/api/registros/stats',
    REGISTROS_ASESORES: '/api/registros/asesores',
    REGISTROS_CUENTAS: '/api/registros/cuentas',
  }
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función para obtener headers con autenticación
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  return {
    ...DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Función para construir URL completa
export function buildUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  registros: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Función helper para manejar respuestas de la API
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data
      };
    } else {
      return {
        success: false,
        error: data.error || data.message || data.detail || 'Error desconocido',
        data
      };
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor'
    };
  }
}

// Función para hacer peticiones HTTP con manejo de errores
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = buildUrl(endpoint);
    const config: RequestInit = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor'
    };
  }
}

// Funciones específicas para cada tipo de petición
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
};