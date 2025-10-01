import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { AuthService } from '../api/auth';
import type { LoginCredentials } from '../api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Configuración de modo de desarrollo
const DEV_MODE = false; // Modo producción - usar API real

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  return {
    subscribe,
    
    // Initialize auth state from localStorage
    init: async () => {
      if (browser) {
        if (DEV_MODE) {
          // Modo de desarrollo - usar datos mock sin validar con backend
          const token = localStorage.getItem('auth_token');
          const userData = localStorage.getItem('user_data');
          
          if (token && userData) {
            try {
              const user = JSON.parse(userData);
              set({
                user,
                isAuthenticated: true,
                isLoading: false
              });
              return;
            } catch (error) {
              console.error('Error parsing user data:', error);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        } else {
          // Modo producción - validar con backend
          if (AuthService.hasValidToken()) {
            try {
              // Intentar obtener el perfil del usuario desde la API
              const response = await AuthService.getProfile();
              
              if (response.success && response.data) {
                const user = AuthService.transformUser(response.data);
                
                // Almacenar datos del usuario
                localStorage.setItem('user_data', JSON.stringify(user));
                
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false
                });
              } else {
                // Token inválido, limpiar datos
                AuthService.clearTokens();
                set({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false
                });
              }
            } catch (error) {
              console.error('Error initializing auth:', error);
              AuthService.clearTokens();
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false
              });
            }
          } else {
            // No hay token válido
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        }
      }
    },
    
    // Login user
    login: async (email: string, password: string) => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        if (DEV_MODE) {
          // Modo de desarrollo - autenticación mock
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
          
          if (email === 'admin@servicio.com' && password === 'admin123') {
            const user: User = {
              id: '1',
              email: 'admin@servicio.com',
              name: 'Administrador',
              role: 'admin',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC50fnsICQ_Uxsm6KJuu4MRT3Aca_Yir8Uk7C4LkqOTC0RynEWX0mOheQbLo19SizzyPOSwXrGMqH9sHV7-W_IusCp7-NaNKP0F4BVbsrLPhA0eYebzWLlmhAY49DBAACWLJoxWJAtolbYjxKcJE0nUU47FDP4WSWH2yv_AXOOEBREePdfxTK6rvmx8LuMcsehlb-iZpP3tyCO-c1n0zMUC38hPLzHtBWJkRZedZRnOrA7jVYwC8Uk4vTf8bEj68-rOcP3TyOptyXE'
            };
            
            const token = 'mock_jwt_token_admin_dev';
            
            if (browser) {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('user_data', JSON.stringify(user));
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false
            });
            
            return { success: true };
          } else if (email === 'user@servicio.com' && password === 'user123') {
            const user: User = {
              id: '2',
              email: 'user@servicio.com',
              name: 'Usuario',
              role: 'user'
            };
            
            const token = 'mock_jwt_token_user_dev';
            
            if (browser) {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('user_data', JSON.stringify(user));
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false
            });
            
            return { success: true };
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
            
            return { 
              success: false, 
              error: 'Credenciales inválidas' 
            };
          }
        } else {
          // Modo producción - usar API real
          const credentials: LoginCredentials = { email, password };
          const response = await AuthService.login(credentials);
          
          if (response.success && response.data) {
            const { access_token, refresh_token, user: apiUser } = response.data;
            
            // Almacenar tokens
            AuthService.storeTokens(access_token, refresh_token);
            
            // Transformar usuario al formato del frontend
            const user = AuthService.transformUser(apiUser);
            
            // Almacenar datos del usuario
            if (browser) {
              localStorage.setItem('user_data', JSON.stringify(user));
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false
            });
            
            console.log('Login successful, auth state set:', { user, isAuthenticated: true });
            
            return { success: true };
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
            
            return { 
              success: false, 
              error: response.error || 'Credenciales inválidas' 
            };
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        return { 
          success: false, 
          error: 'Error de conexión con el servidor' 
        };
      }
    },
    
    // Logout user
    logout: async () => {
      try {
        // Intentar hacer logout en el servidor
        await AuthService.logout();
      } catch (error) {
        console.error('Error during logout:', error);
        // Continuar con el logout local aunque falle el servidor
      }
      
      // Limpiar tokens y datos locales
      AuthService.clearTokens();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      goto('/auth/login');
    },
    
    // Check if user has required role
    hasRole: (requiredRole: User['role']) => {
      let currentState: AuthState;
      
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      
      if (currentState!.user) {
        return currentState!.user.role === requiredRole || currentState!.user.role === 'admin';
      }
      
      return false;
    }
  };
}

export const auth = createAuthStore();