'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo/Logo';
import { SidebarItem } from '@/components/layout/SidebarItem/SidebarItem';
import { UserMenu } from '@/components/layout/UserMenu/UserMenu';
import {
  IconPanelLeftClose,
  IconPanelLeftOpen,
} from '@/components/icons';
import {
  menuConfig,
  filterMenuByPermissions,
  getActiveKey,
} from '@/components/layout/Sidebar/Sidebar.facade';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isExpanded, isMobileOpen, toggleSidebar, setHovered, setMobileOpen } =
    useSidebar();
  const { permissions } = useAuth();

  const filteredMenu = filterMenuByPermissions(menuConfig, permissions);
  const activeKey = getActiveKey(pathname, filteredMenu);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of filteredMenu) {
      for (const item of group.items) {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) =>
            pathname.startsWith(sub.href)
          );
          if (hasActiveSub) initial[item.key] = true;
        }
      }
    }
    return initial;
  });

  useEffect(() => {
    for (const group of filteredMenu) {
      for (const item of group.items) {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) =>
            pathname.startsWith(sub.href)
          );
          if (hasActiveSub) {
            setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
          }
        }
      }
    }
  }, [pathname]);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-overlay backdrop-blur-[1px] z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-65' : 'w-22'
        } ${
          !isOpen && isExpanded ? 'shadow-2xl dark:shadow-black/50' : ''
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 shrink-0 overflow-hidden">
          <Logo
            variant="full"
            size="md"
            animated
            showText={isExpanded}
          />

          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-hover p-1.5 rounded-lg transition-all focus:outline-none shrink-0 overflow-hidden ${
              isExpanded
                ? 'opacity-100 w-8 h-8 ml-auto'
                : 'opacity-0 w-0 h-0 pointer-events-none'
            }`}
            title={isOpen ? 'Recolher menu' : 'Fixar menu'}
          >
            {isOpen ? (
              <IconPanelLeftClose size={20} strokeWidth={1.5} />
            ) : (
              <IconPanelLeftOpen size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4 flex flex-col gap-6">
          {filteredMenu.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3
                className={`px-6 mb-4 text-sm font-semibold text-sidebar-group uppercase tracking-wider transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 m-0'
                }`}
              >
                {group.group}
              </h3>

              <ul className="flex flex-col gap-1.5 px-4">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.key}
                    item={item}
                    isExpanded={isExpanded}
                    isActive={activeKey === item.key}
                    openMenus={openMenus}
                    onToggleMenu={toggleMenu}
                    pathname={pathname}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <UserMenu isExpanded={isExpanded} />
      </aside>
    </>
  );
}
