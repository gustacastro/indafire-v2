import { ButtonProps, ButtonVariant, ButtonSize } from '@/types/ui/button.types';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  secondary:
    'bg-secondary text-secondary-fg hover:bg-secondary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  outline:
    'border border-outline-border bg-transparent text-foreground hover:bg-outline-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ghost:
    'bg-transparent text-foreground hover:bg-ghost-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  destructive:
    'bg-destructive text-destructive-fg hover:bg-destructive-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'brand-outline':
    'bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3.5 gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  nowrap,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'z-1 inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none disabled:opacity-50 disabled:!cursor-not-allowed disabled:pointer-events-auto',

        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        nowrap ? 'whitespace-nowrap' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
