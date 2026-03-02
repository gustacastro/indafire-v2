import { TagChipProps, TagChipVariant } from '@/types/ui/tag-chip.types';

const variantClasses: Record<TagChipVariant, string> = {
  default: 'bg-secondary border-border text-foreground',
  primary: 'bg-primary/10 border-primary/20 text-primary',
  brand: 'bg-brand/10 border-brand/20 text-brand',
};

export function TagChip({ label, variant = 'default' }: TagChipProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-1  border text-[11px] font-medium rounded-md text-center',
        variantClasses[variant],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
