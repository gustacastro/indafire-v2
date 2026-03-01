'use client';

import { IconSun, IconMoon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className={[
        'p-2.5 rounded-full text-muted hover:text-foreground hover:bg-ghost-hover transition-all duration-300 focus:outline-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <IconSun
          size={22}
          className={`absolute transition-all duration-500 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
        <IconMoon
          size={22}
          className={`absolute transition-all duration-500 ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
    </button>
  );
}
