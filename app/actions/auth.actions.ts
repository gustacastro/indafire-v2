'use server';

import { cookies } from 'next/headers';
import { NormalizedPermissions, NormalizedModules } from '@/types/contexts/auth.types';

const MAX_AGE = 60 * 60 * 24 * 30;

export async function setAuthCookies(
  token: string,
  permissions: NormalizedPermissions,
  modules: NormalizedModules
) {
  const cookieStore = await cookies();

  cookieStore.set('auth_token', token, {
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
  });

  cookieStore.set('auth_permissions', JSON.stringify(permissions), {
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
  });

  cookieStore.set('auth_modules', JSON.stringify(modules), {
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('auth_permissions');
  cookieStore.delete('auth_modules');
}

export async function getAuthCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value ?? null;
  const permissionsRaw = cookieStore.get('auth_permissions')?.value;
  const modulesRaw = cookieStore.get('auth_modules')?.value;

  const permissions: NormalizedPermissions = permissionsRaw
    ? JSON.parse(permissionsRaw)
    : {};

  const modules: NormalizedModules = modulesRaw
    ? JSON.parse(modulesRaw)
    : {};

  return { token, permissions, modules };
}
