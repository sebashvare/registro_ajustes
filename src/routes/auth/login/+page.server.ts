import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  // Check if user is already authenticated
  const authToken = cookies.get('auth_token');
  
  if (authToken) {
    throw redirect(302, '/dashboard');
  }
  
  return {};
};