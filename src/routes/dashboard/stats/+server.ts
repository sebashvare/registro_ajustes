import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RegistrosService } from '$lib/api/registros';

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    // Obtener estadísticas del backend
    const response = await RegistrosService.getStats();

    if (response.success && response.data) {
      const stats = response.data;
      
      // Transformar los datos al formato esperado por el frontend
      const dashboardStats = {
        totalRegistros: stats.total_registros,
        valorNeto: stats.valor_neto,
        registrosMesActual: stats.registros_mes_actual,
        promedioValor: stats.promedio_valor,
        
        // KPIs adicionales
        valorPositivo: stats.total_valor_positivo,
        valorNegativo: Math.abs(stats.total_valor_negativo), // Convertir a positivo para mostrar
        asesoresActivos: stats.asesores_activos,
        cuentasAfectadas: stats.cuentas_afectadas,
        
        // Cálculos derivados
        eficienciaPromedio: Math.round((stats.total_valor_positivo / (stats.total_valor_positivo + Math.abs(stats.total_valor_negativo))) * 100) || 0,
        crecimientoMensual: Math.round(Math.random() * 20 - 10), // Placeholder - necesita cálculo real
        satisfaccionCliente: Math.round(85 + Math.random() * 10), // Placeholder - necesita datos reales
      };

      return json(dashboardStats);
    } else {
      // En caso de error, devolver datos por defecto
      console.error('Error obteniendo stats:', response.error);
      
      const defaultStats = {
        totalRegistros: 0,
        valorNeto: 0,
        registrosMesActual: 0,
        promedioValor: 0,
        valorPositivo: 0,
        valorNegativo: 0,
        asesoresActivos: 0,
        cuentasAfectadas: 0,
        eficienciaPromedio: 0,
        crecimientoMensual: 0,
        satisfaccionCliente: 0,
      };

      return json(defaultStats);
    }
  } catch (error) {
    console.error('Error in stats API:', error);
    
    // Devolver datos por defecto en caso de error
    const defaultStats = {
      totalRegistros: 0,
      valorNeto: 0,
      registrosMesActual: 0,
      promedioValor: 0,
      valorPositivo: 0,
      valorNegativo: 0,
      asesoresActivos: 0,
      cuentasAfectadas: 0,
      eficienciaPromedio: 0,
      crecimientoMensual: 0,
      satisfaccionCliente: 0,
    };

    return json(defaultStats);
  }
};