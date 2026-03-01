import { StatusBadgeProps, StatusBadgeVariant } from '@/types/ui/status-badge.types';

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: 'bg-success/5 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  error: 'bg-error/10 text-error border border-error/20',
  brand: 'bg-brand/10 text-brand border border-brand/20',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  muted: 'bg-secondary text-muted border border-border',
};

export function StatusBadge({
  label,
  variant,
  value,
  trueLabel = 'Sim',
  falseLabel = 'Não',
  trueVariant = 'success',
  falseVariant = 'muted',
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? (value ? trueVariant : falseVariant);
  const resolvedLabel = label ?? (value ? trueLabel : falseLabel);

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantClasses[resolvedVariant],
      ].join(' ')}
    >
      {resolvedLabel}
    </span>
  );
}
