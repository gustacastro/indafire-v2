import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface SubMenuItem {
  label: string;
  href: string;
  permission?: {
    module: string;
    action: 'view' | 'edit' | 'create' | 'delete';
  };
}

export interface MenuItem {
  key: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  permission?: {
    module: string;
    action: 'view' | 'edit' | 'create' | 'delete';
  };
  subItems?: SubMenuItem[];
}

export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export interface SidebarContextValue {
  isOpen: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  isExpanded: boolean;
  toggleSidebar: () => void;
  setHovered: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

export interface SidebarProviderProps {
  children: ReactNode;
  initialOpen: boolean;
}

export interface SidebarItemProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  openMenus: Record<string, boolean>;
  onToggleMenu: (key: string) => void;
  pathname: string;
}
