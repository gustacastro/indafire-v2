'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { setSidebarCookie } from '@/app/actions/sidebar.actions';
import { SidebarContextValue, SidebarProviderProps } from '@/types/contexts/sidebar.types';

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children, initialOpen }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isExpanded = isOpen || isHovered;

  const toggleSidebar = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    setIsHovered(false);
    setSidebarCookie(next);
  }, [isOpen]);

  const setHovered = useCallback(
    (value: boolean) => {
      if (!isOpen) {
        setIsHovered(value);
      }
    },
    [isOpen]
  );

  const setMobileOpen = useCallback((value: boolean) => {
    setIsMobileOpen(value);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isHovered,
        isMobileOpen,
        isExpanded,
        toggleSidebar,
        setHovered,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebarContext must be used within SidebarProvider');
  return ctx;
}
