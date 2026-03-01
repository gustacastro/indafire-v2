import { PageHeaderProps } from '@/types/ui/page-header.types';

export function PageHeader({ title, description, icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand shrink-0">
          <span className="text-white">{icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-heading leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
