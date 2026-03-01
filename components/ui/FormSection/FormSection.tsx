import { FormSectionProps } from '@/types/ui/form-section.types';

export function FormSection({ title, children, className = '', action }: FormSectionProps) {
  return (
    <div className={['bg-card border border-border rounded-(--radius-lg) overflow-hidden', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
        <h2 className="text-base font-semibold text-heading">{title}</h2>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
