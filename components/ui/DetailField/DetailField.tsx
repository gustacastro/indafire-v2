import { DetailFieldProps } from '@/types/ui/detail-field.types';

export function DetailField({ icon, label, value, children, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted uppercase font-bold flex items-center gap-1 tracking-wider mb-1">
        {icon}
        {label}
      </p>
      {value && <p className="text-xs text-foreground font-medium">{value}</p>}
      {children}
    </div>
  );
}
