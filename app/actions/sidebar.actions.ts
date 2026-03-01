'use server';

import { cookies } from 'next/headers';

export async function setSidebarCookie(isOpen: boolean) {
  const cookieStore = await cookies();
  cookieStore.set('sidebar_open', String(isOpen), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
