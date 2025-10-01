<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  
  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';
  let showPassword = false;
  
  // Check if already authenticated
  onMount(() => {
    const unsubscribe = auth.subscribe((authState) => {
      console.log('Auth state in login page:', authState);
      if (authState.isAuthenticated && !authState.isLoading) {
        console.log('Redirecting to /dashboard');
        goto('/dashboard');
      }
    });
    
    return unsubscribe;
  });
  
  async function handleLogin(event: Event) {
    event.preventDefault();
    
    if (!email || !password) {
      error = 'Todos los campos son requeridos';
      return;
    }
    
    isLoading = true;
    error = '';
    
    console.log('Attempting login with:', { email, password });
    
    const result = await auth.login(email, password);
    
    console.log('Login result:', result);
    
    if (result.success) {
      console.log('Login successful, waiting for auth state update...');
      // Wait a bit for the store to update and then navigate
      setTimeout(() => {
        console.log('Attempting manual navigation to /dashboard');
        goto('/dashboard');
      }, 100);
    } else {
      error = result.error || 'Error al iniciar sesión';
    }
    
    isLoading = false;
  }
  
  function togglePassword() {
    showPassword = !showPassword;
  }
  
  function clearStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      console.log('LocalStorage cleared');
    }
  }
</script>

<svelte:head>
  <title>Iniciar Sesión - Servicio</title>
  <meta name="description" content="Inicia sesión en el sistema de registro de ajustes" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-2xl">
          account_circle
        </span>
      </div>
      <h2 class="mt-6 text-3xl font-bold text-text-light dark:text-text-dark">
        Iniciar Sesión
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Accede al sistema de registro de ajustes
      </p>
    </div>
    
    <!-- Demo Credentials -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
        Credenciales de demostración:
      </h3>
      <div class="text-xs text-blue-700 dark:text-blue-300 space-y-2">
        <div class="flex justify-between items-center">
          <span><strong>Admin (Dev):</strong> admin@servicio.com / admin123</span>
          <button 
            type="button"
            on:click={() => { email = 'admin@servicio.com'; password = 'admin123'; }}
            class="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
          >
            Usar
          </button>
        </div>
        <div class="flex justify-between items-center">
          <span><strong>Usuario Real:</strong> sfherrera@celsia.com / Sebas_123</span>
          <button 
            type="button"
            on:click={() => { email = 'sfherrera@celsia.com'; password = 'Sebas_123'; }}
            class="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
          >
            Usar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Login Form -->
    <form class="mt-8 space-y-6" on:submit={handleLogin}>
      <div class="space-y-4">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            Correo Electrónico
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              email
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              bind:value={email}
              class="w-full pl-10 pr-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
        </div>
        
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            Contraseña
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              lock
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              bind:value={password}
              class="w-full pl-10 pr-12 py-3 border border-border-light dark:border-border-dark rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              on:click={togglePassword}
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span class="material-symbols-outlined text-sm">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Error Message -->
      {#if error}
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center">
            <span class="material-symbols-outlined text-red-500 mr-2">
              error
            </span>
            <span class="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      {/if}
      
      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {#if isLoading}
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </div>
          {:else}
            <span class="flex items-center">
              <span class="material-symbols-outlined mr-2">
                login
              </span>
              Iniciar Sesión
            </span>
          {/if}
        </button>
      </div>
      
      <!-- Theme Toggle -->
      <div class="flex justify-center space-x-4">
        <button
          type="button"
          on:click={() => theme.toggle()}
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center"
        >
          <span class="material-symbols-outlined mr-2 text-base">
            dark_mode
          </span>
          Cambiar tema
        </button>
        
        <button
          type="button"
          on:click={clearStorage}
          class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 flex items-center"
        >
          <span class="material-symbols-outlined mr-2 text-base">
            refresh
          </span>
          Limpiar caché
        </button>
      </div>
    </form>
    
    <!-- Footer -->
    <div class="text-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Sistema de Registro de Ajustes v1.0
      </p>
    </div>
  </div>
</div>