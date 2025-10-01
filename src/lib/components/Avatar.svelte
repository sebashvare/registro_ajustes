<script lang="ts">
  export let src: string = '';
  export let alt: string = 'Avatar';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let fallback: string = '';
  
  let imageError = false;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  function handleImageError() {
    imageError = true;
  }
  
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<div class="relative inline-block">
  {#if src && !imageError}
    <img 
      {src}
      {alt}
      on:error={handleImageError}
      class="{sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary transition-colors duration-300"
      loading="lazy"
    />
  {:else}
    <div class="{sizeClasses[size]} rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm border-2 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary transition-colors duration-300">
      {#if fallback}
        {getInitials(fallback)}
      {:else}
        <span class="material-symbols-outlined text-base">
          person
        </span>
      {/if}
    </div>
  {/if}
</div>