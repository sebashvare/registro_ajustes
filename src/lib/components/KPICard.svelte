<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let subtitle: string = '';
  export let icon: string = '';
  export let color: 'primary' | 'green' | 'red' | 'blue' | 'orange' = 'primary';
  export let trend: 'up' | 'down' | 'neutral' | null = null;
  export let trendValue: string = '';
  
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
  };
  
  const trendClasses = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };
  
  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'trending_flat'
  };
</script>

<div class="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center space-x-3 mb-3">
        {#if icon}
          <div class="p-2 rounded-lg {colorClasses[color]}">
            <span class="material-symbols-outlined text-xl">
              {icon}
            </span>
          </div>
        {/if}
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      
      <div class="mb-2">
        <span class="text-2xl font-bold text-text-light dark:text-text-dark">
          {value}
        </span>
      </div>
      
      {#if subtitle}
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
      {/if}
    </div>
    
    {#if trend && trendValue}
      <div class="flex items-center space-x-1 {trendClasses[trend]}">
        <span class="material-symbols-outlined text-sm">
          {trendIcons[trend]}
        </span>
        <span class="text-sm font-medium">
          {trendValue}
        </span>
      </div>
    {/if}
  </div>
</div>