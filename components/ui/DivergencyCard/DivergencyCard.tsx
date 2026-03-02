'use client';
import { DivergencyCardProps } from '@/types/ui/divergency-card.types';
import { formatDateTimeBR } from '@/utils/datetime';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { Button } from '@/components/ui/Button/Button';

export function DivergencyCard({ divergency, onResolveRequest }: DivergencyCardProps) {
  const isPending = !divergency.resolved;

  return (
    <div className="bg-card border border-border rounded-(--radius-lg) px-(--spacing-md) py-(--spacing-md) flex flex-col gap-(--spacing-sm)">
        <div className="flex items-center justify-between gap-(--spacing-sm)">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Divergência</span>
          <StatusBadge
            label={isPending ? 'Pendente' : 'Resolvida'}
            variant={isPending ? 'warning' : 'success'}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Tipo</span>
          <p className="text-foreground font-medium">{divergency.type}</p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Descrição do problema</span>
          <p className="text-foreground leading-relaxed">{divergency.problem_description}</p>
        </div>

        <div className="flex items-end justify-between gap-(--spacing-sm) pt-(--spacing-xs) border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Reportado por</span>
            <div className="flex items-center gap-2">
              <Avatar name={divergency.created_by_name} size="sm" />
              <span className="text-foreground font-medium">{divergency.created_by_name}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Data</span>
            <span className="text-foreground">{formatDateTimeBR(divergency.created_at)}</span>
          </div>
        </div>

        {divergency.resolved && divergency.resolution_description && (
          <div className="flex flex-col gap-(--spacing-sm) pt-(--spacing-xs) border-t border-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Resolução</span>
              <p className="text-foreground leading-relaxed">{divergency.resolution_description}</p>
            </div>
            <div className="flex items-end justify-between gap-(--spacing-sm)">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Resolvido por</span>
                <div className="flex items-center gap-2">
                  <Avatar name={divergency.resolved_by_name ?? ''} size="sm" />
                  <span className="text-foreground font-medium">{divergency.resolved_by_name}</span>
                </div>
              </div>
              {divergency.resolved_at && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Resolvido em</span>
                  <span className="text-foreground">{formatDateTimeBR(divergency.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isPending && (
          <div className="pt-(--spacing-xs)">
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              onClick={() => onResolveRequest?.(divergency.divergency_id)}
            >
              Resolver divergência
            </Button>
          </div>
        )}
      </div>
  );
}
