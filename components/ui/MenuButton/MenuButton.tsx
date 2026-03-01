import { MenuButtonProps, MenuButtonVariant } from '@/types/ui/menu-button.types';

const variantClasses: Record<MenuButtonVariant, string> = {
  default:
    'text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active',
  destructive:
    'text-destructive hover:bg-destructive/10',
  accent:
    'text-brand hover:bg-brand/10',
};

export function MenuButton({
  variant = 'default',
  icon,
  label,
  className = '',
  ...props
}: MenuButtonProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
