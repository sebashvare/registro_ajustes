<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { API_CONFIG } from '$lib/api/config';
  import KPICard from '$lib/components/KPICard.svelte';
  import BarChart from '$lib/components/BarChart.svelte';
  
  let authState: any = null;
  let stats: any = null;
  let loading = true;
  
  onMount(() => {
    const unsubscribe = auth.subscribe(state => {
      authState = state;
    });
    
    // Cargar estadísticas
    loadStats();
    
    return unsubscribe;
  });
  
  /**
   * Carga las estadísticas del dashboard desde la API
   * Obtiene todos los registros y calcula métricas en tiempo real
   */
  async function loadStats() {
    try {
      // Realizar petición a la API de registros con autenticación JWT
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTROS}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Extraer registros de la respuesta paginada
        const registros = data.registros || data.results || data;
        
        if (Array.isArray(registros) && registros.length > 0) {
          // Calcular estadísticas en tiempo real a partir de los registros
          stats = calculateStats(registros);
        } else {
          // No hay datos disponibles, mostrar estadísticas vacías
          stats = getEmptyStats();
        }
      } else {
        console.error('Error al cargar registros:', response.status);
        // Usar datos vacíos como fallback
        stats = getEmptyStats();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Usar datos vacíos como fallback
      stats = getEmptyStats();
    } finally {
      loading = false;
    }
  }
  
  /**
   * Calcula estadísticas agregadas a partir de un array de registros
   * @param registros Array de registros de ajustes
   * @returns Objeto con estadísticas calculadas y datos para gráficas
   */
  function calculateStats(registros: any[]) {
    // Métricas básicas de resumen - todos los ajustes son negativos (descuentos)
    const totalRegistros = registros.length;
    const totalDescuentos = registros
      .reduce((sum, registro) => sum + Math.abs(Number(registro.valor_ajustado || 0)), 0);
    const promedioDescuento = totalRegistros > 0 ? totalDescuentos / totalRegistros : 0;
    
    // Agrupar ajustes por asesor para análisis de rendimiento
    const ajustesPorAsesor = registros.reduce((acc: any[], registro: any) => {
      const asesorNombre = registro.asesor_que_ajusto || registro.asesor || 'Sin Asesor';
      const existing = acc.find(item => item.nombre === asesorNombre);
      
      if (existing) {
        existing.valorTotal += Number(registro.valor_ajustado || 0);
        existing.totalAjustes += 1;
      } else {
        acc.push({
          nombre: asesorNombre,
          valorTotal: Number(registro.valor_ajustado || 0),
          totalAjustes: 1
        });
      }
      return acc;
    }, []);

    // Agrupar ajustes por mes para análisis temporal
    const ajustesPorMes = registros.reduce((acc: any[], registro: any) => {
      // Buscar fecha en diferentes campos posibles
      if (!registro.fecha_ajuste && !registro.fecha_actualizacion && !registro.updated_at) return acc;
      
      const fechaStr = registro.fecha_ajuste || registro.fecha_actualizacion || registro.updated_at;
      const fecha = new Date(fechaStr);
      const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      const mesNombre = fecha.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
      
      const existing = acc.find(item => item.key === mesKey);
      
      if (existing) {
        existing.valorTotal += Number(registro.valor_ajustado || 0);
        existing.totalAjustes += 1;
      } else {
        acc.push({
          key: mesKey,
          mes: mesNombre,
          valorTotal: Number(registro.valor_ajustado || 0),
          totalAjustes: 1
        });
      }
      return acc;
    }, []).sort((a, b) => a.key.localeCompare(b.key));

    return {
      resumen: {
        totalRegistros,
        totalDescuentos,
        promedioDescuento,
        ajustesEsteMes: totalRegistros,
        asesoresActivos: ajustesPorAsesor.length
      },
      ajustesPorAsesor,
      ajustesPorMes,
      // Agregar los últimos 5 registros para mostrar como recientes
      ajustesRecientes: registros
        .sort((a, b) => {
          const fechaA = new Date(a.fecha_ajuste || a.updated_at || a.created_at);
          const fechaB = new Date(b.fecha_ajuste || b.updated_at || b.created_at);
          return fechaB.getTime() - fechaA.getTime();
        })
        .slice(0, 5)
    };
  }
  
  /**
   * Retorna estructura de estadísticas vacía para casos de error o sin datos
   * @returns Objeto con estadísticas inicializadas en cero
   */
  function getEmptyStats() {
    return {
      resumen: {
        totalRegistros: 0,
        totalDescuentos: 0,
        promedioDescuento: 0,
        ajustesEsteMes: 0,
        asesoresActivos: 0
      },
      ajustesPorAsesor: [],
      ajustesPorMes: [],
      ajustesRecientes: []
    };
  }
  
  // Funciones de formato para visualización
  /**
   * Formatea un número como moneda colombiana
   * @param value Valor numérico a formatear
   * @returns String formateado como moneda COP
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  /**
   * Formatea un número con separadores de miles
   * @param value Valor numérico a formatear
   * @returns String formateado con separadores
   */
  function formatNumber(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value);
  }
  
  /**
   * Formatea una fecha en formato legible
   * @param dateString String de fecha a formatear
   * @returns String formateado como fecha local
   */
  function formatDate(dateString: string): string {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
  
  // Preparación de datos para gráficas reactivas
  $: chartDataAsesor = stats?.ajustesPorAsesor
    ?.sort((a, b) => Math.abs(b.valorTotal) - Math.abs(a.valorTotal)) // Ordenar por mayor valor
    ?.map((asesor: any) => ({
      label: asesor.nombre.split(' ')[0], // Solo primer nombre para mejor visualización
      value: Math.abs(asesor.valorTotal), // Mostrar como valor absoluto para mejor visualización
      color: '#d8792c' // Color primario del aplicativo
    })) || [];
  
  $: chartDataMes = stats?.ajustesPorMes?.slice(-6).map((mes: any) => ({
    label: mes.mes.split(' ')[0], // Solo el mes para labels más cortos
    value: Math.abs(mes.valorTotal), // Mostrar como valor absoluto para mejor visualización
    color: '#d8792c' // Color primario del aplicativo
  })) || [];
</script>

<svelte:head>
  <title>Dashboard - Servicio</title>
</svelte:head>

<div class="p-4 sm:p-6 bg-background-light dark:bg-background-dark min-h-full">
  <div class="max-w-7xl mx-auto">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark mb-2">
        Dashboard
      </h1>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
        Panel de control y métricas del sistema de registro de ajustes
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="ml-3 text-text-light dark:text-text-dark">Cargando estadísticas...</span>
      </div>
    {:else if stats}
      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <KPICard
          title="Total Registros"
          value={formatNumber(stats.resumen.totalRegistros)}
          subtitle="Ajustes procesados"
          icon="receipt_long"
          color="blue"
        />
        
        <KPICard
          title="Total Descuentos"
          value={formatCurrency(stats.resumen.totalDescuentos)}
          subtitle="Valor total de descuentos aplicados"
          icon="trending_down"
          color="red"
        />
        
        <KPICard
          title="Promedio por Ajuste"
          value={formatCurrency(stats.resumen.promedioDescuento)}
          subtitle="Promedio de descuento por registro"
          icon="calculate"
          color="orange"
        />
        
        <KPICard
          title="Asesores Activos"
          value={formatNumber(stats.resumen.asesoresActivos)}
          subtitle="Asesores que realizaron ajustes"
          icon="group"
          color="green"
        />
      </div>
      
      <!-- Gráficas -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="w-full">
          <BarChart
            title="Descuentos por Asesor"
            data={chartDataAsesor}
            height={300}
            formatValue={formatCurrency}
          />
        </div>
        
        <div class="w-full">
          <BarChart
            title="Descuentos por Mes (Últimos 6)"
            data={chartDataMes}
            height={300}
            formatValue={formatCurrency}
          />
        </div>
      </div>
      
      <!-- Resumen adicional -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="xl:col-span-2">
          <div class="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark p-4 sm:p-6">
            <h3 class="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-4">
              Descuentos Recientes
            </h3>
            <div class="space-y-3">
              {#each stats.ajustesRecientes || [] as ajuste}
                <div class="flex items-center justify-between py-2 border-b border-border-light dark:border-border-dark last:border-b-0">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <span class="text-sm font-medium text-text-light dark:text-text-dark">
                        {ajuste.id_cuenta || 'Sin cuenta'}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {ajuste.asesor_que_ajusto || ajuste.asesor || 'Sin asesor'}
                      </span>
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {formatDate(ajuste.fecha_ajuste || ajuste.updated_at || ajuste.created_at)}
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(Math.abs(ajuste.valor_ajustado || 0))}
                    </span>
                  </div>
                </div>
              {:else}
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
                  <p>No hay descuentos recientes para mostrar</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
        
        <div>
          <div class="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark p-4 sm:p-6">
            <h3 class="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-4">
              Top Asesores
            </h3>
            <div class="space-y-3">
              {#each (stats.ajustesPorAsesor || []).slice(0, 5) as asesor}
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="text-sm font-medium text-text-light dark:text-text-dark">
                      {asesor.nombre}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-300">
                      {asesor.totalAjustes} descuentos
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(Math.abs(asesor.valorTotal))}
                    </span>
                  </div>
                </div>
              {:else}
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">person_off</span>
                  <p>No hay datos de asesores</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>