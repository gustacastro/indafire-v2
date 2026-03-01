export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'brand' | 'primary' | 'muted';

export interface StatusBadgeProps {
  label?: string;
  variant?: StatusBadgeVariant;
  value?: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueVariant?: StatusBadgeVariant;
  falseVariant?: StatusBadgeVariant;
}
