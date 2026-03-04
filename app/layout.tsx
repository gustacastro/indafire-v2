import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Theme } from '@/types/contexts/theme.types';
import { NormalizedPermissions, NormalizedModules } from '@/types/contexts/auth.types';
import { SystemBackground } from '@/components/layout/SystemBackground/SystemBackground';
import { EnvironmentBadge } from '@/components/ui/EnvironmentBadge/EnvironmentBadge';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IndaFire',
  description: 'Soluções de segurança contra incêndios',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get('theme')?.value ?? 'light') as Theme;
  const token = cookieStore.get('auth_token')?.value ?? null;
  const sidebarOpen = cookieStore.get('sidebar_open')?.value !== 'false';

  const permissionsRaw = cookieStore.get('auth_permissions')?.value;
  const permissions: NormalizedPermissions = (() => {
    if (!permissionsRaw) return {};
    try { return JSON.parse(permissionsRaw); } catch { return {}; }
  })();

  const modulesRaw = cookieStore.get('auth_modules')?.value;
  const modules: NormalizedModules = (() => {
    if (!modulesRaw) return {};
    try { return JSON.parse(modulesRaw); } catch { return {}; }
  })();

  return (
    <html lang="pt-BR" data-theme={theme}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider initialTheme={theme}>
          <AuthProvider
            initialToken={token}
            initialPermissions={permissions}
            initialModules={modules}
          >
            <SidebarProvider initialOpen={sidebarOpen}>
              <Toaster position="top-right" containerStyle={{ zIndex: 9999 }} />
              {children}
              <SystemBackground />
              <EnvironmentBadge environment={process.env.NEXT_PUBLIC_ENVIRONMENT} />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
