import { redirect } from '@sveltejs/kit';

export const load = async () => {
  // Redirect root to dashboard
  throw redirect(302, '/dashboard');
};