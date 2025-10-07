<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { AjusteFormData } from '$lib/types';
  import { RegistrosService } from '$lib/api/registros';
  import { auth } from '$lib/stores/auth';
  
  let registros: any[] = [];
  let loading = false;
  let searchTerm = '';
  let sortField = 'fecha_ajuste';
  let sortDirection: 'asc' | 'desc' = 'desc';
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalItems = 0;
  let error = '';
  let currentUser: any = null;
  
  // Suscribirse al store de auth para obtener el usuario actual
  onMount(() => {
    const unsubscribeAuth = auth.subscribe(state => {
      currentUser = state.user;
    });
    
    loadRegistros();
    
    return () => {
      unsubscribeAuth();
    };
  });
  
  // Cargar registros desde la API
  async function loadRegistros() {
    if (!browser) return;
    
    try {
      loading = true;
      error = '';
      
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm || undefined,
        ordering: sortDirection === 'desc' ? `-${sortField}` : sortField
      };
      
      const response = await RegistrosService.getRegistros(params);
      
      if (response.success && response.data) {
        const apiRegistros = response.data.registros || [];
        
        // Usar datos directamente sin transformación por ahora
        registros = apiRegistros;
        
        totalItems = response.data.total || 0;
      } else {
        error = response.error || 'Error al cargar los registros';
        registros = [];
        totalItems = 0;
      }
    } catch (err) {
      console.error('Error loading registros:', err);
      error = 'Error de conexión con el servidor';
      registros = [];
      totalItems = 0;
    } finally {
      loading = false;
    }
  }
  
  // Computed values para paginación del servidor
  $: totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Verificar si el usuario actual es admin
  $: isAdmin = currentUser && currentUser.role === 'admin';
  
  // Recargar cuando cambien los parámetros
  $: if (browser && (currentPage || itemsPerPage || sortField || sortDirection)) {
    loadRegistros();
  }
  
  // Buscar con debounce
  let searchTimeout: number;
  $: if (browser && searchTerm !== undefined) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1; // Reset a primera página al buscar
      loadRegistros();
    }, 500);
  }
  
  function handleSort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
    currentPage = 1; // Reset a primera página al ordenar
  }
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  async function deleteRegistro(id: string) {
    // Validar que el usuario sea admin
    if (!currentUser || currentUser.role !== 'admin') {
      alert('No tienes permisos para eliminar registros. Solo los administradores pueden realizar esta acción.');
      return;
    }
    
    if (!id) {
      alert('Error: ID de registro no válido');
      return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      loading = true;
      console.log('🗑️ Eliminando registro con ID:', id);
      
      const response = await RegistrosService.deleteRegistro(id);
      
      console.log('📡 Respuesta de eliminación:', response);
      
      if (response.success) {
        // Recargar los datos después de eliminar
        await loadRegistros();
        alert('Registro eliminado exitosamente');
      } else {
        console.error('Error al eliminar:', response.error);
        alert(response.error || 'Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error eliminando registro:', error);
      alert('Error de conexión al eliminar el registro');
    } finally {
      loading = false;
    }
  }
  
  async function exportToCSV() {
    try {
      loading = true;
      
      // Obtener todos los registros (sin paginación para exportar todo)
      const params = {
        page_size: 1000, // Obtener muchos registros
        search: searchTerm || undefined,
        ordering: sortDirection === 'desc' ? `-${sortField}` : sortField
      };
      
      const response = await RegistrosService.getRegistros(params);
      
      if (response.success && response.data) {
        const allRegistros = response.data.registros || [];
        
        // Generar CSV
        const csvContent = generateCSV(allRegistros);
        
        // Crear blob con UTF-8 BOM para tildes
        const BOM = '\uFEFF'; // UTF-8 BOM
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registros_ajustes_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert(response.error || 'Error al exportar los datos');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar los datos');
    } finally {
      loading = false;
    }
  }
  
  function generateCSV(registros: any[]): string {
    // Headers del CSV con tildes correctas
    const headers = [
      'ID',
      'ID Cuenta',
      'ID Acuerdo de Servicio', 
      'ID Cargo Facturable',
      'Fecha de Ajuste',
      'Asesor que Ajustó',
      'Valor Ajustado',
      'Justificación',
      'Fecha de Creación'
    ];
    
    // Convertir registros a filas CSV
    const rows = registros.map(registro => [
      registro.id,
      registro.id_cuenta,
      registro.id_acuerdo_servicio,
      registro.id_cargo_facturable,
      registro.fecha_ajuste,
      registro.asesor_que_ajusto,
      // Formatear valor ajustado como número con separador de miles
      new Intl.NumberFormat('es-CO', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(Number(registro.valor_ajustado)),
      registro.justificacion,
      new Date(registro.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    ]);
    
    // Combinar headers y filas
    const csvArray = [headers, ...rows];
    
    // Convertir a string CSV
    return csvArray.map(row => 
      row.map(field => {
        // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');
  }

</script>

<svelte:head>
  <title>Lista de Registros - Servicio</title>
  <meta name="description" content="Lista de registros de ajustes de cuenta de servicio" />
</svelte:head>

<div class="container mx-auto px-6 py-12">
  <div class="bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark rounded-xl shadow-minimal-light dark:shadow-minimal-dark">
    
    <!-- Header -->
    <div class="p-6 border-b border-border-light dark:border-border-dark">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Lista de Registros de Ajustes</h1>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Total: {totalItems} registro{totalItems !== 1 ? 's' : ''}
            {#if searchTerm}
              • Mostrando {registros.length} resultado{registros.length !== 1 ? 's' : ''}
            {/if}
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <a
            href="/registro"
            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-300 text-center"
          >
            <span class="material-symbols-outlined text-sm mr-2">add</span>
            Nuevo Registro
          </a>
          
          <button
            on:click={exportToCSV}
            disabled={loading || registros.length === 0}
            class="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-sm mr-2">download</span>
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
    
    <!-- Search and Filters -->
    <div class="p-6 border-b border-border-light dark:border-border-dark">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium mb-2">Buscar</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              id="search"
              type="text"
              bind:value={searchTerm}
              placeholder="Buscar en todos los campos..."
              class="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 bg-transparent"
            />
          </div>
        </div>
        
        <div class="md:w-48">
          <label for="itemsPerPage" class="block text-sm font-medium mb-2">Elementos por página</label>
          <select
            id="itemsPerPage"
            bind:value={itemsPerPage}
            on:change={() => currentPage = 1}
            class="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 bg-surface-light dark:bg-surface-dark"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Data Table -->
    <div class="overflow-x-auto">
      {#if loading}
        <div class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span class="ml-3">Cargando...</span>
        </div>
      {:else if error}
        <div class="text-center p-12">
          <span class="material-symbols-outlined text-6xl text-red-400 mb-4 block">
            error
          </span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error al cargar los datos
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <button
            on:click={loadRegistros}
            class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <span class="material-symbols-outlined text-sm mr-2">refresh</span>
            Reintentar
          </button>
        </div>
      {:else if registros.length === 0}
        <div class="text-center p-12">
          <span class="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
            inbox
          </span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay registros
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm ? 'No se encontraron registros que coincidan con tu búsqueda.' : 'Aún no se han creado registros de ajustes.'}
          </p>
          <a
            href="/registro"
            class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            <span class="material-symbols-outlined text-sm mr-2">add</span>
            Crear primer registro
          </a>
        </div>
      {:else}
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  on:click={() => handleSort('id_cuenta')}
                  class="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>ID Cuenta</span>
                  {#if sortField === 'id_cuenta'}
                    <span class="material-symbols-outlined text-sm">
                      {sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  on:click={() => handleSort('fecha_ajuste')}
                  class="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Fecha</span>
                  {#if sortField === 'fecha_ajuste'}
                    <span class="material-symbols-outlined text-sm">
                      {sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  on:click={() => handleSort('asesor_que_ajusto')}
                  class="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Asesor</span>
                  {#if sortField === 'asesor_que_ajusto'}
                    <span class="material-symbols-outlined text-sm">
                      {sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  on:click={() => handleSort('valor_ajustado')}
                  class="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>Valor</span>
                  {#if sortField === 'valor_ajustado'}
                    <span class="material-symbols-outlined text-sm">
                      {sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  {/if}
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Justificación
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {#each registros as registro, index}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {registro.id_cuenta}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {formatDate(registro.fecha_ajuste)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {registro.asesor_que_ajusto}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span class={registro.valor_ajustado >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formatCurrency(registro.valor_ajustado)}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="max-w-xs truncate" title={registro.justificacion}>
                    {registro.justificacion}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    {#if isAdmin}
                      <button
                        on:click={() => deleteRegistro(registro.id)}
                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 rounded"
                        title="Eliminar registro"
                      >
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    {:else}
                      <span class="text-gray-400 text-xs" title="Solo administradores pueden eliminar registros">
                        Sin permisos
                      </span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="px-6 py-4 border-t border-border-light dark:border-border-dark">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
          </div>
          
          <div class="flex items-center space-x-1">
            <button
              on:click={() => currentPage = Math.max(1, currentPage - 1)}
              disabled={currentPage === 1}
              class="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const start = Math.max(1, currentPage - 2);
              const page = start + i;
              return page <= totalPages ? page : null;
            }).filter(Boolean) as page}
              {#if page}
                <button
                  on:click={() => currentPage = page}
                  class="px-3 py-1 text-sm border rounded transition-colors {page === currentPage 
                    ? 'bg-primary text-white border-primary' 
                    : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800'}"
                >
                  {page}
                </button>
              {/if}
            {/each}
            
            <button
              on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
              disabled={currentPage === totalPages}
              class="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>