<script lang="ts">
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import Avatar from './Avatar.svelte';
  import { auth } from '$lib/stores/auth';
  
  let mobileMenuOpen = false;
  let user: any = null;
  
  onMount(() => {
    const unsubscribe = auth.subscribe(state => {
      user = state.user;
    });
    
    return unsubscribe;
  });
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
  
  onMount(() => {
    // Close mobile menu when resizing to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        mobileMenuOpen = false;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<header class="bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark shadow-minimal-light dark:shadow-minimal-dark">
  <nav class="container mx-auto px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold">
        <a href="/dashboard" class="hover-underline">Servicio</a>
      </div>
      
      <div class="hidden md:flex items-center space-x-6">
        <a href="/dashboard" class="hover-underline">Dashboard</a>
        <a href="/registro" class="hover-underline">Registrar</a>
        <a href="/registro/list" class="hover-underline">Lista de Registros</a>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button
          on:click={toggleMobileMenu}
          class="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300"
          aria-label="Menú móvil"
        >
          <span class="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
        
        <ThemeToggle />
        
        <div class="relative">
          <div class="flex items-center space-x-2">
            <Avatar 
              src={user?.avatar}
              alt={user?.name || "Usuario"}
              fallback={user?.name || "Usuario"}
              size="md"
            />
            
            <button 
              on:click={() => auth.logout()}
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300"
              title="Cerrar sesión"
            >
              <span class="material-symbols-outlined">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
      <div class="px-6 py-4 space-y-4">
        <a href="/dashboard" class="block hover-underline" on:click={closeMobileMenu}>Dashboard</a>
        <a href="/registro" class="block hover-underline" on:click={closeMobileMenu}>Registrar</a>
        <a href="/registro/list" class="block hover-underline" on:click={closeMobileMenu}>Lista de Registros</a>
        <button 
          on:click={() => { auth.logout(); closeMobileMenu(); }}
          class="block w-full text-left hover-underline text-red-600 dark:text-red-400"
        >
          <span class="material-symbols-outlined text-sm mr-2 inline">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </div>
  {/if}
</header>