/**
 * Authentication API Service
 */

import { api, API_CONFIG } from './config';
import type { ApiResponse } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
}

export class AuthService {
  /**
   * Realizar login con email y password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    // Probar con fetch directo para debug
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
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
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    return await api.get<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
  }

  /**
   * Realizar logout
   */
  static async logout(): Promise<ApiResponse<void>> {
    return await api.post<void>(API_CONFIG.ENDPOINTS.LOGOUT);
  }

  /**
   * Verificar si hay un token válido almacenado
   */
  static hasValidToken(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (!token || !tokenExpiry) return false;
    
    const now = new Date().getTime();
    const expiry = parseInt(tokenExpiry);
    
    return now < expiry;
  }

  /**
   * Almacenar tokens de autenticación
   */
  static storeTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return;
    
    // Calcular expiración (los tokens JWT típicamente duran 1 hora)
    const expiry = new Date().getTime() + (60 * 60 * 1000); // 1 hora
    
    localStorage.setItem('auth_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('token_expiry', expiry.toString());
  }

  /**
   * Limpiar tokens de autenticación
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_data');
  }

  /**
   * Convertir usuario de la API al formato del frontend
   */
  static transformUser(apiUser: LoginResponse['user'] | UserProfile): import('../stores/auth').User {
    // Si es el usuario del login, ya viene en el formato correcto
    if ('name' in apiUser && 'role' in apiUser) {
      return {
        id: apiUser.id.toString(),
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role as 'admin' | 'user'
      };
    }
    
    // Si es UserProfile (para compatibilidad)
    const profileUser = apiUser as UserProfile;
    return {
      id: profileUser.id.toString(),
      email: profileUser.email,
      name: `${profileUser.first_name} ${profileUser.last_name}`.trim() || profileUser.email,
      role: profileUser.is_superuser || profileUser.is_staff ? 'admin' : 'user'
    };
  }
}