<script lang="ts">
  import { theme } from '$lib/stores/theme';
  
  let currentTheme: 'light' | 'dark' = 'light';
  
  theme.subscribe(value => {
    currentTheme = value;
  });
  
  function toggleTheme() {
    theme.toggle();
  }
</script>

<button
  on:click={toggleTheme}
  class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300"
  aria-label="Cambiar tema"
>
  <span class="material-symbols-outlined">
    {currentTheme === 'light' ? 'light_mode' : 'dark_mode'}
  </span>
</button>