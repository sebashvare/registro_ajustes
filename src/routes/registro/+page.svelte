<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { AjusteFormData, FormErrors, ValidationRules } from '$lib/types';
  import { RegistrosService } from '$lib/api/registros';
  import { auth } from '$lib/stores/auth';
  
  let formData: AjusteFormData = {
    id_cuenta: '',
    id_acuerdo_servicio: '',
    id_cargo_facturable: '',
    fecha_ajuste: '',
    asesor_que_ajusto: '',
    valor_ajustado: 0,
    obs_adicional: '',
    justificacion: ''
  };
  
  let errors: FormErrors = {};
  let progress = 0;
  let loading = false;
  let submitError = '';
  let submitSuccess = false;
  let currentUser: any = null;
  
  // Configurar el usuario autenticado automáticamente
  onMount(() => {
    const unsubscribe = auth.subscribe(state => {
      currentUser = state.user;
      if (state.user && state.user.name) {
        formData.asesor_que_ajusto = state.user.name;
        // Recalcular progreso cuando se asigna automáticamente
        updateProgress();
      }
    });
    
    return unsubscribe;
  });
  
  const validationRules: ValidationRules = {
    id_cuenta: { required: true },
    id_acuerdo_servicio: { required: true },
    id_cargo_facturable: { required: true },
    fecha_ajuste: { required: true },
    asesor_que_ajusto: { required: false }, // Automático, no requerido por el usuario
    valor_ajustado: { required: true, type: 'number' },
    justificacion: { required: true }
  };
  
  const fieldLabels: Record<string, string> = {
    id_cuenta: 'ID de Cuenta',
    id_acuerdo_servicio: 'ID de Acuerdo de Servicio',
    id_cargo_facturable: 'ID de Cargo Facturable',
    fecha_ajuste: 'Fecha de Ajuste',
    asesor_que_ajusto: 'Asesor que Ajustó',
    valor_ajustado: 'Valor Ajustado',
    justificacion: 'Justificación'
  };
  
  function validateField(field: string, value: any): string {
    const rules = validationRules[field];
    if (!rules) return '';
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${fieldLabels[field]} es requerido.`;
    }
    
    if (rules.type === 'number' && isNaN(parseFloat(value)) && value !== '') {
      return `${fieldLabels[field]} debe ser un número válido.`;
    }
    
    return '';
  }
  
  function handleInput(field: string, value: any) {
    formData = { ...formData, [field]: value };
    
    // Validate field
    const error = validateField(field, value);
    if (error) {
      errors = { ...errors, [field]: error };
    } else {
      const { [field]: removed, ...rest } = errors;
      errors = rest;
    }
    
    // Update progress
    updateProgress();
    
    // Clear submit error and success
    submitError = '';
    submitSuccess = false;
  }
  
  function updateProgress() {
    const requiredFields = Object.keys(validationRules);
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof AjusteFormData];
      return value !== '' && value !== null && value !== undefined;
    });
    
    progress = Math.round((filledFields.length / requiredFields.length) * 100);
  }
  
  function validateForm(): boolean {
    let isValid = true;
    const newErrors: FormErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field as keyof AjusteFormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    errors = newErrors;
    return isValid;
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    try {
      loading = true;
      submitError = '';
      submitSuccess = false;
      
      // Convertir el valor a negativo ya que representa un descuento
      const adjustedFormData = {
        ...formData,
        valor_ajustado: -Math.abs(formData.valor_ajustado)
      };
      
      const response = await RegistrosService.createRegistro(adjustedFormData);
      
      if (response.success && response.data) {
        submitSuccess = true;
        
        // Reset form
        formData = {
          id_cuenta: '',
          id_acuerdo_servicio: '',
          id_cargo_facturable: '',
          fecha_ajuste: '',
          asesor_que_ajusto: '',
          valor_ajustado: 0,
          obs_adicional: '',
          justificacion: ''
        };
        errors = {};
        progress = 0;
        
        // Redirect to list after a brief success message
        setTimeout(() => {
          goto('/registro/list');
        }, 2000);
      } else {
        submitError = response.error || 'Error al crear el registro';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      submitError = 'Error de conexión con el servidor';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Registro de Ajustes - Servicio</title>
  <meta name="description" content="Formulario de registro de ajustes de cuenta de servicio" />
</svelte:head>

<div class="container mx-auto px-6 py-12">
  <div class="bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark p-10 rounded-xl shadow-minimal-light dark:shadow-minimal-dark max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-8">Ajustes de Cuenta de Servicio</h1>
    
    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          class="bg-primary h-2.5 rounded-full progress-bar" 
          style="width: {progress}%"
        ></div>
      </div>
      <div class="text-xs mt-1 text-right">{progress}% Completo</div>
    </div>
    
    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit}>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ID de Cuenta -->
        <div class:invalid={errors.id_cuenta}>
          <label for="id_cuenta" class="block text-sm font-medium mb-1">
            ID de Cuenta
          </label>
          <input
            id="id_cuenta"
            name="id_cuenta"
            type="text"
            bind:value={formData.id_cuenta}
            on:input={(e) => handleInput('id_cuenta', e.currentTarget.value)}
            placeholder="Ingrese ID de cuenta"
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          />
          {#if errors.id_cuenta}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.id_cuenta}
            </div>
          {/if}
        </div>
        
        <!-- ID de Acuerdo de Servicio -->
        <div class:invalid={errors.id_acuerdo_servicio}>
          <label for="id_acuerdo_servicio" class="block text-sm font-medium mb-1">
            ID de Acuerdo de Servicio
          </label>
          <input
            id="id_acuerdo_servicio"
            name="id_acuerdo_servicio"
            type="text"
            bind:value={formData.id_acuerdo_servicio}
            on:input={(e) => handleInput('id_acuerdo_servicio', e.currentTarget.value)}
            placeholder="Ingrese ID de acuerdo de servicio"
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          />
          {#if errors.id_acuerdo_servicio}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.id_acuerdo_servicio}
            </div>
          {/if}
        </div>
        
        <!-- ID de Cargo Facturable -->
        <div class:invalid={errors.id_cargo_facturable}>
          <label for="id_cargo_facturable" class="block text-sm font-medium mb-1">
            ID de Cargo Facturable
          </label>
          <input
            id="id_cargo_facturable"
            name="id_cargo_facturable"
            type="text"
            bind:value={formData.id_cargo_facturable}
            on:input={(e) => handleInput('id_cargo_facturable', e.currentTarget.value)}
            placeholder="Ingrese ID de cargo facturable"
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          />
          {#if errors.id_cargo_facturable}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.id_cargo_facturable}
            </div>
          {/if}
        </div>
        
        <!-- Fecha de Ajuste -->
        <div class:invalid={errors.fecha_ajuste}>
          <label for="fecha_ajuste" class="block text-sm font-medium mb-1">
            Fecha de Ajuste
          </label>
          <input
            id="fecha_ajuste"
            name="fecha_ajuste"
            type="date"
            bind:value={formData.fecha_ajuste}
            on:input={(e) => handleInput('fecha_ajuste', e.currentTarget.value)}
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          />
          {#if errors.fecha_ajuste}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.fecha_ajuste}
            </div>
          {/if}
        </div>
        
        <!-- Asesor que Ajustó -->
        <div>
          <label for="asesor_que_ajusto" class="block text-sm font-medium mb-1">
            Asesor que Ajustó
            <span class="text-xs text-gray-500 font-normal">(Usuario actual)</span>
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              person
            </span>
            <input
              id="asesor_que_ajusto"
              name="asesor_que_ajusto"
              type="text"
              value={formData.asesor_que_ajusto}
              readonly
              disabled
              class="form-input w-full pl-10 pr-4 py-3 border border-border-light rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed dark:border-border-dark"
              placeholder="Usuario no identificado"
            />
            <span class="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              lock
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Este campo se llena automáticamente con el usuario que inició sesión
          </div>
        </div>
        
        <!-- Valor Ajustado -->
        <div class:invalid={errors.valor_ajustado}>
          <label for="valor_ajustado" class="block text-sm font-medium mb-1">
            Valor Ajustado (Descuento)
            <span class="text-xs text-gray-500 font-normal">Solo valores positivos - se aplicarán como descuento</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              id="valor_ajustado"
              name="valor_ajustado"
              type="number"
              step="0.01"
              min="0"
              bind:value={formData.valor_ajustado}
              on:input={(e) => {
                const value = parseFloat(e.currentTarget.value) || 0;
                handleInput('valor_ajustado', Math.abs(value));
              }}
              placeholder="0.00"
              class="form-input w-full pl-8 pr-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
            />
          </div>
          {#if errors.valor_ajustado}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.valor_ajustado}
            </div>
          {/if}
        </div>
        
        <!-- Observaciones Adicionales -->
        <div class="md:col-span-2">
          <label for="obs_adicional" class="block text-sm font-medium mb-1">
            Observaciones Adicionales
          </label>
          <textarea
            id="obs_adicional"
            name="obs_adicional"
            rows="4"
            bind:value={formData.obs_adicional}
            placeholder="Ingrese observaciones adicionales"
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          ></textarea>
        </div>
        
        <!-- Justificación -->
        <div class="md:col-span-2" class:invalid={errors.justificacion}>
          <label for="justificacion" class="block text-sm font-medium mb-1">
            Justificación
          </label>
          <textarea
            id="justificacion"
            name="justificacion"
            rows="4"
            bind:value={formData.justificacion}
            on:input={(e) => handleInput('justificacion', e.currentTarget.value)}
            placeholder="Ingrese justificación"
            class="form-input w-full px-4 py-3 border border-border-light rounded-lg text-sm focus:border-primary focus:ring-primary input-focus placeholder-gray-400 dark:placeholder-gray-500 dark:border-border-dark"
          ></textarea>
          {#if errors.justificacion}
            <div class="validation-message text-red-500 dark:text-red-400">
              {errors.justificacion}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Submit Button -->
      <div class="mt-10 pt-6 border-t border-border-light dark:border-border-dark">
        <!-- Error Message -->
        {#if submitError}
          <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div class="flex">
              <span class="material-symbols-outlined text-red-400 mr-2">error</span>
              <div>
                <p class="font-medium">Error al guardar el registro</p>
                <p class="text-sm mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Success Message -->
        {#if submitSuccess}
          <div class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div class="flex">
              <span class="material-symbols-outlined text-green-400 mr-2">check_circle</span>
              <div>
                <p class="font-medium">Registro guardado exitosamente</p>
                <p class="text-sm mt-1">Redirigiendo a la lista de registros...</p>
              </div>
            </div>
          </div>
        {/if}
        
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={loading || submitSuccess}
            class="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors duration-300 shadow-minimal-light dark:shadow-minimal-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            {:else if submitSuccess}
              <span class="material-symbols-outlined mr-2">check</span>
              Guardado
            {:else}
              Guardar Ajuste
            {/if}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>