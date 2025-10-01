import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // La autenticación se maneja desde el cliente
  // Los datos se cargarán desde el cliente usando la API
  return {
    authenticated: true
  };
};