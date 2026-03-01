import { ViewSectionProps } from '@/types/ui/view-section.types';

export function ViewSection({ title, children, spacing = 'normal', icon }: ViewSectionProps) {
  const spaceClass = spacing === 'compact' ? 'space-y-3' : 'space-y-4';
  return (
    <div className={spaceClass}>
      <h4 className={`text-xs font-semibold text-muted uppercase tracking-wider${icon ? ' flex items-center gap-1.5' : ''}`}>
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}
