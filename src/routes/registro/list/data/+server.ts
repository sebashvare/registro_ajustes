import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RegistrosService } from '$lib/api/registros';
import type { RegistrosListParams } from '$lib/api/registros';

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    // Extraer parámetros de la URL
    const searchParams = url.searchParams;
    const params: RegistrosListParams = {};

    // Paginación
    const page = searchParams.get('page');
    if (page) params.page = parseInt(page);

    const pageSize = searchParams.get('pageSize');
    if (pageSize) params.page_size = parseInt(pageSize);

    // Filtros
    const search = searchParams.get('search');
    if (search) params.search = search;

    const fechaInicio = searchParams.get('fechaInicio');
    if (fechaInicio) params.fecha_inicio = fechaInicio;

    const fechaFin = searchParams.get('fechaFin');
    if (fechaFin) params.fecha_fin = fechaFin;

    const asesor = searchParams.get('asesor');
    if (asesor) params.asesor = asesor;

    const cuenta = searchParams.get('cuenta');
    if (cuenta) params.cuenta = cuenta;

    const ordering = searchParams.get('ordering');
    if (ordering) params.ordering = ordering;

    // Llamar a la API del backend
    const response = await RegistrosService.getRegistros(params);

    if (response.success && response.data) {
      return json(response.data);
    } else {
      return json(
        { error: response.error || 'Error al obtener los registros' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in registros API:', error);
    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const formData = await request.json();
    
    // Validar datos requeridos
    const requiredFields = [
      'id_cuenta',
      'id_acuerdo_servicio', 
      'id_cargo_facturable',
      'fecha_ajuste',
      'asesor_que_ajusto',
      'valor_ajustado',
      'justificacion'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Crear el registro usando la API del backend
    const response = await RegistrosService.createRegistro(formData);

    if (response.success && response.data) {
      const transformedRegistro = RegistrosService.transformRegistro(response.data);
      return json(transformedRegistro, { status: 201 });
    } else {
      return json(
        { error: response.error || 'Error al crear el registro' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating registro:', error);
    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ request, url }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const id = url.searchParams.get('id');
    if (!id) {
      return json(
        { error: 'ID del registro requerido' },
        { status: 400 }
      );
    }

    const formData = await request.json();

    // Actualizar el registro usando la API del backend
    const response = await RegistrosService.updateRegistro(id, formData);

    if (response.success && response.data) {
      const transformedRegistro = RegistrosService.transformRegistro(response.data);
      return json(transformedRegistro);
    } else {
      return json(
        { error: response.error || 'Error al actualizar el registro' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating registro:', error);
    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ url, request }) => {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const id = url.searchParams.get('id');
    if (!id) {
      return json(
        { error: 'ID del registro requerido' },
        { status: 400 }
      );
    }

    // Eliminar el registro usando la API del backend
    const response = await RegistrosService.deleteRegistro(id);

    if (response.success) {
      return json({ success: true });
    } else {
      return json(
        { error: response.error || 'Error al eliminar el registro' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting registro:', error);
    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};