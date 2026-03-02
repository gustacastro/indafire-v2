'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { Logo } from '@/components/ui/Logo/Logo';
import { IconMenu } from '@/components/icons';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  const FULL_WIDTH_ROUTES = ['/commercial-panel', '/logistics/pickup-panel', '/logistics/delivery-panel', '/workshop/panel'];
  const isFullWidth = FULL_WIDTH_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="relative z-10 flex h-screen overflow-hidden font-sans transition-colors duration-300">
      <Sidebar />

      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72.5' : 'w-22'
        }`}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-sidebar border-b border-sidebar-border shrink-0">
          <Logo variant="full" size="sm" />
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-hover transition-colors focus:outline-none"
            aria-label="Abrir menu"
          >
            <IconMenu size={20} strokeWidth={1.5} />
          </button>
        </header>

        <main className={`flex-1 p-6 lg:p-10 overflow-y-auto text-foreground ${isFullWidth ? 'flex flex-col' : ''}`}>
          <div className={isFullWidth ? 'w-full flex flex-col flex-1' : 'max-w-400 mx-auto w-full'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
