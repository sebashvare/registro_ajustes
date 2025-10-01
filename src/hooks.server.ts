import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const handle: Handle = async ({ event, resolve }) => {
  // Agregar el token de autenticación a las requests internas si está disponible
  if (event.url.pathname.startsWith('/api/') || event.url.pathname.includes('/stats')) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        event.request.headers.set('authorization', `Bearer ${token}`);
      }
    }
  }

  const response = await resolve(event);
  return response;
};