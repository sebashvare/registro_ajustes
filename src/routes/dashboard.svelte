<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Dashboard - Servicio</title>
  <meta name="description" content="Panel principal del sistema de registro de ajustes" />
</svelte:head>

<div class="container mx-auto px-6 py-12">
  <div class="bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark p-10 rounded-xl shadow-minimal-light dark:shadow-minimal-dark max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-center">Dashboard - Sistema de Registro de Ajustes</h1>
    
    <div class="text-center space-y-6">
      <p class="text-lg text-gray-600 dark:text-gray-300">
        Bienvenido al sistema de registro de ajustes de cuenta de servicio.
      </p>
      
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on:click={() => goto('/app/registro')}
            class="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors duration-300 shadow-minimal-light dark:shadow-minimal-dark"
          >
            <span class="material-symbols-outlined text-sm mr-2 inline">add</span>
            Registrar Nuevo Ajuste
          </button>
          
          <button
            on:click={() => goto('/app/registro/list')}
            class="bg-secondary text-white font-semibold py-3 px-8 rounded-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-colors duration-300 shadow-minimal-light dark:shadow-minimal-dark"
          >
            <span class="material-symbols-outlined text-sm mr-2 inline">list</span>
            Ver Lista de Registros
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div class="p-6 border border-border-light dark:border-border-dark rounded-lg">
            <span class="material-symbols-outlined text-2xl text-primary mb-3 block">speed</span>
            <h3 class="font-semibold text-lg mb-2">Registro Rápido</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Formulario intuitivo con validación en tiempo real
            </p>
          </div>
          
          <div class="p-6 border border-border-light dark:border-border-dark rounded-lg">
            <span class="material-symbols-outlined text-2xl text-primary mb-3 block">table_view</span>
            <h3 class="font-semibold text-lg mb-2">DataTable Avanzado</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Lista con búsqueda, filtros, ordenamiento y exportación
            </p>
          </div>
          
          <div class="p-6 border border-border-light dark:border-border-dark rounded-lg">
            <span class="material-symbols-outlined text-2xl text-primary mb-3 block">security</span>
            <h3 class="font-semibold text-lg mb-2">Seguridad</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Sistema de autenticación y roles de usuario
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>