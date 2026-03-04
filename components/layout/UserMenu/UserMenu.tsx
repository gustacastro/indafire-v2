'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { MenuButton } from '@/components/ui/MenuButton/MenuButton';
import {
  IconUser,
  IconSun,
  IconMoon,
  IconLogOut,
  IconChevronDown,
  IconScrollText,
} from '@/components/icons';
import { getInitials } from '@/utils/initials';

interface UserMenuProps {
  isExpanded: boolean;
}

export function UserMenu({ isExpanded }: UserMenuProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = getInitials(user?.name ?? 'U');

  return (
    <div className="p-4 border-t border-sidebar-border relative shrink-0" ref={menuRef}>
      <div
        className={`absolute z-50 bottom-full left-4 mb-2 w-56 bg-card rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:shadow-black/50 border border-border transition-all duration-300 origin-bottom-left ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-heading truncate">
            {user?.name ?? 'Usuário'}
          </p>
          <p className="text-xs text-muted truncate">
            {user?.email ?? ''}
          </p>
        </div>

        <div className="p-2 space-y-1">
          <MenuButton
            icon={<IconUser size={16} />}
            label="Meu Perfil"
            variant="default"
            onClick={() => { router.push('/profile'); setIsOpen(false); }}
          />
          <MenuButton
            icon={theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            label="Mudar Tema"
            variant="default"
            onClick={toggleTheme}
          />

          {(process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' ||
            process.env.NEXT_PUBLIC_ENVIRONMENT === 'internal' ||
            process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') && (
            <MenuButton
              icon={<IconScrollText size={16} />}
              label="Changelog"
              variant="default"
              onClick={() => { router.push('/changelog'); setIsOpen(false); }}
            />
          )}

          <div className="h-px bg-border my-1" />

          <MenuButton
            icon={<IconLogOut size={16} />}
            label="Sair do Sistema"
            variant="destructive"
            onClick={() =>
              toast.promise(logout(), {
                loading: 'Saindo...',
                success: 'Até logo!',
                error: 'Erro ao sair do sistema.',
              })
            }
          />
        </div>

        <div className="px-4 py-2 border-t border-border bg-secondary rounded-b-xl">
          <p className="text-[10px] text-center text-muted font-medium uppercase tracking-wider">
            IndaFire v0.0.1
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full p-2 rounded-xl transition-colors hover:bg-sidebar-hover ${
          isExpanded ? 'justify-start' : 'justify-center'
        } ${isOpen ? 'bg-sidebar-hover' : ''}`}
      >
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
            <span className="text-sm font-bold text-white leading-none">{initials}</span>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-sidebar" />
        </div>

        <div
          className={`flex flex-col items-start ml-3 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'opacity-100 w-35' : 'opacity-0 w-0'
          }`}
        >
          <span className="text-sm font-semibold text-sidebar-fg-active whitespace-nowrap">
            {user?.name ?? 'Usuário'}
          </span>
          <span className="text-xs text-sidebar-muted whitespace-nowrap">
            {user?.email ?? ''}
          </span>
        </div>

        <IconChevronDown
          size={16}
          className={`ml-auto text-sidebar-fg shrink-0 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0 hidden'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}
