/**
 * Registros API Service
 */

import { api, API_CONFIG } from './config';
import type { ApiResponse, PaginatedResponse } from './config';
import type { AjusteFormData, AjusteRegistro } from '../types';

export interface RegistroResponse {
  id: number;
  id_cuenta: string;
  id_acuerdo_servicio: string;
  id_cargo_facturable: string;
  fecha_ajuste: string;
  asesor_que_ajusto: string;
  valor_ajustado: number;
  obs_adicional?: string;
  justificacion: string;
  created_at: string;
  updated_at: string;
  usuario: number;
}

export interface RegistroStats {
  total_registros: number;
  total_valor_positivo: number;
  total_valor_negativo: number;
  valor_neto: number;
  registros_mes_actual: number;
  promedio_valor: number;
  asesores_activos: number;
  cuentas_afectadas: number;
}

export interface AsesorInfo {
  nombre: string;
  total_ajustes: number;
  valor_total: number;
}

export interface CuentaInfo {
  id_cuenta: string;
  total_ajustes: number;
  valor_total: number;
  ultimo_ajuste: string;
}

export interface RegistrosListParams {
  page?: number;
  page_size?: number;
  search?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  asesor?: string;
  cuenta?: string;
  ordering?: string;
}

export class RegistrosService {
  /**
   * Obtener lista paginada de registros
   */
  static async getRegistros(params: RegistrosListParams = {}): Promise<ApiResponse<PaginatedResponse<RegistroResponse>>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
    
    const endpoint = `${API_CONFIG.ENDPOINTS.REGISTROS}/?${searchParams.toString()}`;
    return await api.get<PaginatedResponse<RegistroResponse>>(endpoint);
  }

  /**
   * Obtener un registro específico por ID
   */
  static async getRegistro(id: string): Promise<ApiResponse<RegistroResponse>> {
    return await api.get<RegistroResponse>(`${API_CONFIG.ENDPOINTS.REGISTROS}/${id}/`);
  }

  /**
   * Crear un nuevo registro
   */
  static async createRegistro(data: AjusteFormData): Promise<ApiResponse<RegistroResponse>> {
    console.log('🚀 RegistrosService.createRegistro - Datos recibidos:', data);
    console.log('🌐 Endpoint:', `${API_CONFIG.ENDPOINTS.REGISTROS}/`);
    
    const result = await api.post<RegistroResponse>(`${API_CONFIG.ENDPOINTS.REGISTROS}/`, data);
    
    console.log('📨 Resultado de la petición:', result);
    
    return result;
  }

  /**
   * Actualizar un registro existente
   */
  static async updateRegistro(id: string, data: Partial<AjusteFormData>): Promise<ApiResponse<RegistroResponse>> {
    return await api.put<RegistroResponse>(`${API_CONFIG.ENDPOINTS.REGISTROS}/${id}/`, data);
  }

  /**
   * Eliminar un registro
   */
  static async deleteRegistro(id: string): Promise<ApiResponse<void>> {
    return await api.delete<void>(`${API_CONFIG.ENDPOINTS.REGISTROS}/${id}/`);
  }

  /**
   * Obtener estadísticas del dashboard
   */
  static async getStats(): Promise<ApiResponse<RegistroStats>> {
    return await api.get<RegistroStats>(API_CONFIG.ENDPOINTS.REGISTROS_STATS);
  }

  /**
   * Obtener lista de asesores
   */
  static async getAsesores(): Promise<ApiResponse<AsesorInfo[]>> {
    return await api.get<AsesorInfo[]>(API_CONFIG.ENDPOINTS.REGISTROS_ASESORES);
  }

  /**
   * Obtener lista de cuentas
   */
  static async getCuentas(): Promise<ApiResponse<CuentaInfo[]>> {
    return await api.get<CuentaInfo[]>(API_CONFIG.ENDPOINTS.REGISTROS_CUENTAS);
  }

  /**
   * Eliminar múltiples registros
   */
  static async bulkDelete(ids: string[]): Promise<ApiResponse<{ deleted: number }>> {
    return await api.post<{ deleted: number }>(`${API_CONFIG.ENDPOINTS.REGISTROS}/bulk-delete/`, { ids });
  }

  /**
   * Exportar registros en formato CSV/Excel
   */
  static async exportRegistros(format: 'csv' | 'excel' = 'csv', params: RegistrosListParams = {}): Promise<ApiResponse<Blob>> {
    const searchParams = new URLSearchParams();
    searchParams.set('format', format);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
    
    const endpoint = `${API_CONFIG.ENDPOINTS.REGISTROS}/export/?${searchParams.toString()}`;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          data: blob
        };
      } else {
        return {
          success: false,
          error: 'Error al exportar los datos'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión al exportar'
      };
    }
  }

  /**
   * Transformar registro de la API al formato del frontend
   */
  static transformRegistro(apiRegistro: RegistroResponse): AjusteRegistro {
    return {
      id: apiRegistro.id.toString(),
      id_cuenta: apiRegistro.id_cuenta,
      id_acuerdo_servicio: apiRegistro.id_acuerdo_servicio,
      id_cargo_facturable: apiRegistro.id_cargo_facturable,
      fecha_ajuste: apiRegistro.fecha_ajuste,
      asesor_que_ajusto: apiRegistro.asesor_que_ajusto,
      valor_ajustado: apiRegistro.valor_ajustado,
      obs_adicional: apiRegistro.obs_adicional,
      justificacion: apiRegistro.justificacion,
      created_at: apiRegistro.created_at,
      updated_at: apiRegistro.updated_at
    };
  }

  /**
   * Transformar datos del formulario al formato de la API
   */
  static transformFormData(formData: AjusteFormData): Omit<AjusteFormData, 'id'> {
    return {
      id_cuenta: formData.id_cuenta,
      id_acuerdo_servicio: formData.id_acuerdo_servicio,
      id_cargo_facturable: formData.id_cargo_facturable,
      fecha_ajuste: formData.fecha_ajuste,
      asesor_que_ajusto: formData.asesor_que_ajusto,
      valor_ajustado: formData.valor_ajustado,
      obs_adicional: formData.obs_adicional,
      justificacion: formData.justificacion
    };
  }
}