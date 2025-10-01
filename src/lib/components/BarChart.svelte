<script lang="ts">
  export let data: Array<{label: string, value: number, color?: string}> = [];
  export let title: string = '';
  export let height: number = 200;
  export let formatValue: (value: number) => string = (v) => v.toLocaleString();
  
  $: maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
  $: chartHeight = height - 60; // Espacio ajustado para labels flotantes
  
  // Calcular el número máximo de elementos que se pueden mostrar cómodamente
  $: maxItems = data.length <= 8 ? data.length : 8;
  $: displayData = data.slice(0, maxItems);
  $: hasMoreItems = data.length > maxItems;
</script>

<div class="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark p-4 sm:p-6 w-full">
  <h3 class="text-base sm:text-lg font-semibold text-text-light dark:text-text-dark mb-4 sm:mb-6">
    {title}
    {#if hasMoreItems}
      <span class="text-sm font-normal text-gray-500 ml-2">(Mostrando {maxItems} de {data.length})</span>
    {/if}
  </h3>
  
  <div class="relative w-full overflow-hidden" style="height: {height}px; min-height: 240px;">
    <!-- Chart area -->
    <div class="flex items-end justify-between h-full gap-1 sm:gap-3 pb-16 sm:pb-20 pt-8">
      {#each displayData as item, index}
        {@const barHeight = (Math.abs(item.value) / maxValue) * (chartHeight - 40)}
        {@const minBarHeight = 12} <!-- Altura mínima más visible -->
        {@const finalBarHeight = Math.max(barHeight, minBarHeight)}
        
        <div class="flex flex-col items-center flex-1 min-w-0 relative">
          <!-- Value label encima de la barra -->
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div class="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
              $ {Math.abs(item.value).toLocaleString()}
            </div>
          </div>
          
          <!-- Bar -->
          <div 
            class="w-full rounded-t transition-all duration-300 hover:opacity-80 hover:scale-105 relative"
            style="height: {finalBarHeight}px; background-color: {item.color || '#d8792c'}; min-height: {minBarHeight}px; max-width: 60px;"
            title="{item.label}: {formatValue(Math.abs(item.value))}"
          ></div>
          
          <!-- Label debajo de la barra -->
          <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center leading-tight max-w-[80px]">
            <span class="block truncate">{item.label}</span>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Baseline -->
    <div class="absolute bottom-16 sm:bottom-20 left-0 right-0 h-px bg-border-light dark:bg-border-dark"></div>
  </div>
  
  {#if hasMoreItems}
    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
      * Mostrando los primeros {maxItems} elementos
    </div>
  {/if}
</div>