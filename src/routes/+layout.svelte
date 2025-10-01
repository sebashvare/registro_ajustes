<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { theme } from '$lib/stores/theme';
  import { auth } from '$lib/stores/auth';
  import Header from '$lib/components/Header.svelte';
  import '../styles/global.css';
  
  let authState: any = null;
  
  // Lista de rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/registro'];
  
  // Verificar si la ruta actual es protegida
  $: currentPath = $page.url.pathname;
  $: isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
  $: isAuthRoute = currentPath.startsWith('/auth');
  
  onMount(() => {
    theme.init();
    auth.init();
    
    const unsubscribe = auth.subscribe(state => {
      console.log('Main layout auth state:', state);
      authState = state;
      
      console.log('Current path:', currentPath, 'Is protected:', isProtectedRoute);
      
      if (!state.isLoading) {
        if (isProtectedRoute && !state.isAuthenticated) {
          console.log('Redirecting to login from protected route');
          goto('/auth/login');
        } else if (currentPath === '/auth/login' && state.isAuthenticated) {
          console.log('Redirecting to dashboard from login');
          goto('/dashboard');
        }
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="min-h-screen">
  {#if isProtectedRoute && authState?.isAuthenticated}
    <!-- Layout con Header para rutas protegidas -->
    <div class="flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow">
        <slot />
      </main>
    </div>
  {:else if isAuthRoute || (!isProtectedRoute && !authState?.isLoading)}
    <!-- Layout sin Header para auth y rutas públicas -->
    <slot />
  {:else if authState?.isLoading}
    <!-- Loading state -->
    <div class="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-text-light dark:text-text-dark">Cargando...</p>
      </div>
    </div>
  {:else}
    <!-- Fallback -->
    <slot />
  {/if}
</div>