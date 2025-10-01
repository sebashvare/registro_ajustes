<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  
  onMount(() => {
    // Initialize stores
    theme.init();
    auth.init();
  });
</script>

<div class="min-h-screen">
  <slot />
</div>