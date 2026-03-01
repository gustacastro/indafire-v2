import { AvatarProps, AvatarSize } from '@/types/ui/avatar.types';

const sizeClasses: Record<AvatarSize, string> = {
  x: 'w-5 <h-5></h-5> text-[9px]',
  xs: 'w-7 h-7 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-20 h-20 text-2xl',
};

const AVATAR_COLORS = [
  { bg: '#16a34a', text: '#ffffff' },
  { bg: '#2563eb', text: '#ffffff' },
  { bg: '#7c3aed', text: '#ffffff' },
  { bg: '#d97706', text: '#ffffff' },
  { bg: '#0891b2', text: '#ffffff' },
  { bg: '#be185d', text: '#ffffff' },
  { bg: '#dc2626', text: '#ffffff' },
  { bg: '#0f766e', text: '#ffffff' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getAvatarText(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  return firstName.slice(0, 2).toUpperCase();
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const color = getAvatarColor(name);
  return (
    <div
      className={[
        'flex items-center justify-center rounded-full font-semibold shrink-0 select-none',
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {getAvatarText(name)}
    </div>
  );
}
