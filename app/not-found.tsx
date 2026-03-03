import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { NotFoundPage } from '@/components/ui/NotFound/NotFoundPage';

export const metadata: Metadata = {
  title: 'IndaFire - Página não encontrada',
};

export default async function NotFound() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value ?? null;
  const isAuthenticated = !!token;

  return <NotFoundPage isAuthenticated={isAuthenticated} />;
}
