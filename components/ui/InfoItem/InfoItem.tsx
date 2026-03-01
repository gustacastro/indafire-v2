import { InfoItemProps } from '@/types/ui/info-item.types';

export function InfoItem({ icon, label, children }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-secondary rounded-lg border border-border text-muted shrink-0">
        {icon}
      </div>
      <div className="w-full">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
