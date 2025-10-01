import { redirect } from '@sveltejs/kit';

export const load = async ({ url }: { url: URL }) => {
  // Lista de rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/registro'];
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // En el lado del servidor, no podemos acceder a localStorage
    // La verificación de autenticación se hará en el cliente
    return {};
  }
  
  return {};
};