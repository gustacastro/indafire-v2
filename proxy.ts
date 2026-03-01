import { NextRequest, NextResponse } from 'next/server';
import { NormalizedPermissions } from '@/types/contexts/auth.types';

const AUTH_ROUTES = ['/login'];
const PUBLIC_ROUTES = ['/login'];
const PERMISSION_FREE_ROUTES = ['/dashboard'];

const ROUTE_MODULE_MAP: Record<string, string> = {
  taxes: 'tax_categories',
  clients: 'clients',
  suppliers: 'clients',
  commercial_panel: 'quotes',
};

function getRequiredPermission(pathname: string): { module: string; action: string } | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const rawModule = segments[0].replace(/-/g, '_');
  const module = ROUTE_MODULE_MAP[rawModule] ?? rawModule;

  if (PERMISSION_FREE_ROUTES.includes(`/${module}`)) return null;

  if (segments.length >= 2) {
    const action = segments[1];
    if (action === 'create') return { module, action: 'create' };
    if (action === 'edit') return { module, action: 'edit' };
  }

  return { module, action: 'view' };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  if (pathname === '/') {
    const destination = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requiredPermission = getRequiredPermission(pathname);

  if (requiredPermission) {
    const permissionsRaw = request.cookies.get('auth_permissions')?.value;
    if (permissionsRaw) {
      try {
        const permissions: NormalizedPermissions = JSON.parse(permissionsRaw);
        const modulePerms = permissions[requiredPermission.module];
        const action = requiredPermission.action as keyof typeof modulePerms;

        if (!modulePerms || !modulePerms[action]) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
