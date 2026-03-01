import { RejectionCardProps } from '@/types/ui/rejection-card.types';
import { formatDateTimeBR } from '@/utils/datetime';
import { Avatar } from '@/components/ui/Avatar/Avatar';

export function RejectionCard({ reason, createdAt, createdByName }: RejectionCardProps) {
  return (
    <div className="bg-card border border-border rounded-(--radius-lg) px-(--spacing-md) py-(--spacing-md) flex flex-col gap-(--spacing-sm)">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Mensagem da recusa</span>
        <p className="text-foreground leading-relaxed">{reason}</p>
      </div>

      <div className="flex items-end justify-between gap-(--spacing-sm) pt-(--spacing-xs) border-t border-border">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Recusado por</span>
          <div className="flex items-center gap-2">
            <Avatar name={createdByName} size="sm" />
            <span className="text-foreground font-medium">{createdByName}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Data da recusa</span>
          <span className="text-foreground">{formatDateTimeBR(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
