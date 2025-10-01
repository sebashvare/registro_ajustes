import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    
    // Extract form data
    const formData = {
      id_cuenta: data.get('id_cuenta') as string,
      id_acuerdo_servicio: data.get('id_acuerdo_servicio') as string,
      id_cargo_facturable: data.get('id_cargo_facturable') as string,
      fecha_ajuste: data.get('fecha_ajuste') as string,
      asesor_que_ajusto: data.get('asesor_que_ajusto') as string,
      valor_ajustado: parseFloat(data.get('valor_ajustado') as string) || 0,
      obs_adicional: data.get('obs_adicional') as string,
      justificacion: data.get('justificacion') as string
    };
    
    // Validation
    const errors: Record<string, string> = {};
    
    if (!formData.id_cuenta?.trim()) {
      errors.id_cuenta = 'ID de Cuenta es requerido';
    }
    
    if (!formData.id_acuerdo_servicio?.trim()) {
      errors.id_acuerdo_servicio = 'ID de Acuerdo de Servicio es requerido';
    }
    
    if (!formData.id_cargo_facturable?.trim()) {
      errors.id_cargo_facturable = 'ID de Cargo Facturable es requerido';
    }
    
    if (!formData.fecha_ajuste) {
      errors.fecha_ajuste = 'Fecha de Ajuste es requerida';
    }
    
    if (!formData.asesor_que_ajusto?.trim()) {
      errors.asesor_que_ajusto = 'Asesor que Ajustó es requerido';
    }
    
    if (!formData.valor_ajustado || isNaN(formData.valor_ajustado)) {
      errors.valor_ajustado = 'Valor Ajustado debe ser un número válido';
    }
    
    if (!formData.justificacion?.trim()) {
      errors.justificacion = 'Justificación es requerida';
    }
    
    // If there are errors, return them
    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        formData
      });
    }
    
    // Here you would typically save to a database
    // For now, we'll just log the data and simulate success
    console.log('Datos del ajuste recibidos:', formData);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to success page or back to form with success message
    throw redirect(303, '/?success=true');
  }
};