'use client';
import { Button } from '@/components/ui/Button/Button';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { DetailField } from '@/components/ui/DetailField/DetailField';
import { MapsButton } from '@/components/ui/MapsButton/MapsButton';
import {
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconHash,
  IconCalendar,
  IconGripVertical,
  IconEye,
  IconMapPin,
  IconTruck,
} from '@/components/icons';
import { WorkshopKanbanCardProps } from '@/types/entities/job-task/pickup-kanban.types';
import { formatAddressShort } from '@/app/(protected)/clients/clients.facade';
import { formatDateTimeBR } from '@/utils/datetime';

export function WorkshopKanbanCard({
  card,
  columnId,
  nextColumnId,
  onDirectMove,
  isMoving,
  isExpanded,
  onToggleExpand,
  pickupProgress,
  onViewQuoteRequest,
  onViewPickupsRequest,
  onSendToDelivery,
}: WorkshopKanbanCardProps) {
  const isWaiting = card.status === 'WAITING_MAINTENANCE';
  const isExecuting = card.status === 'IN_MAINTENANCE';
  const isDone = card.status === 'MAINTENANCE_DONE';
  const nextColLabel = getNextColumnLabel(nextColumnId);
  const hasAddress = card.address.street || card.address.city;

  return (
    <div
      className={[
        'bg-card border border-border rounded-lg relative overflow-hidden shadow-sm transition-all group hover:border-primary/40',
        isExpanded ? 'ring-1 ring-border' : '',
        isMoving ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="p-(--spacing-sm) md:p-(--spacing-md) flex flex-col h-full">
        <div className="flex justify-between items-start mb-(--spacing-sm)">
          <div className="flex items-start gap-(--spacing-sm) min-w-0">
            <IconGripVertical
              size={14}
              className="text-muted cursor-grab group-hover:scale-120 transition-transform -ml-1 mt-0.5"
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-(--spacing-xs)">
                <span className="text-[15px] font-bold text-muted uppercase tracking-wider">
                  #{card.quoteCode}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted font-medium truncate max-w-32">
                  {card.creatorName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <RowActions
              actions={[
                {
                  label: 'Visualizar orçamento',
                  icon: <IconEye size={15} />,
                  onClick: () => onViewQuoteRequest?.(card),
                },
                ...(card.requiresPickup
                  ? [
                      {
                        label: 'Ver itens retirados',
                        icon: <IconEye size={15} />,
                        onClick: () => onViewPickupsRequest?.(card),
                      },
                    ]
                  : []),
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              className="p-1! gap-0! text-muted"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-(--spacing-sm) mb-(--spacing-md)">
          <DetailField label="Cliente" className="flex-1">
            <h3 className="text-xs md:text-sm font-bold text-heading line-clamp-2 leading-snug">
              {card.clientName}
            </h3>
          </DetailField>

          <div className="flex items-center gap-(--spacing-sm)">
            <DetailField label="Serviço" className="flex-1">
              <p className="text-xs text-foreground font-medium">{card.serviceName}</p>
            </DetailField>
            <DetailField label="Qtd.">
              <p className="text-xs text-foreground font-medium text-center">{card.amount}</p>
            </DetailField>
          </div>
        </div>

        {card.requiresPickup && pickupProgress && (
          <div className="flex flex-col gap-(--spacing-xs) mb-(--spacing-sm)">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted">
                {pickupProgress.picked}/{pickupProgress.total} itens retirados
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-(--radius-sm) overflow-hidden">
              <div
                className="h-full bg-primary rounded-(--radius-sm) transition-all duration-500"
                style={{ width: `${pickupProgress.total > 0 ? (pickupProgress.picked / pickupProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-(--spacing-sm) border-t border-border flex justify-between items-center mt-auto">
          {isDone ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              iconRight={<IconTruck size={14} />}
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onSendToDelivery?.(card);
              }}
              className="text-xs! py-1.5!"
            >
              Enviar para entrega
            </Button>
          ) : nextColumnId ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              iconRight={<IconArrowRight size={14} />}
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onDirectMove(card, columnId, nextColumnId);
              }}
              className="text-xs! py-1.5!"
            >
              {nextColLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {isExpanded && (
        <div className="px-(--spacing-sm) pb-(--spacing-sm) pt-(--spacing-xs) md:px-(--spacing-md) md:pb-(--spacing-md) md:pt-(--spacing-sm) border-t border-border bg-secondary/50">
          <div className="grid grid-cols-2 gap-y-(--spacing-sm) gap-x-(--spacing-sm)">
            <DetailField icon={<IconHash size={12} />} label="Código">
              <p className="text-xs text-foreground font-mono">#{card.quoteCode}</p>
            </DetailField>

            <DetailField
              icon={<IconCalendar size={12} />}
              label="Entrega prevista"
              value={card.deliveryDate ? formatDateTimeBR(card.deliveryDate) : '—'}
            />

            {hasAddress && (
              <div className="col-span-2">
                <DetailField icon={<IconMapPin size={12} />} label="Endereço">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-foreground font-medium whitespace-pre-line flex-1">
                      {formatAddressShort(card.address)}
                    </p>
                    <MapsButton address={card.address} size="sm" stopPropagation />
                  </div>
                </DetailField>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getNextColumnLabel(nextColumnId?: string): string {
  const labels: Record<string, string> = {
    'col-waiting': 'A Executar Manutenção',
    'col-executing': 'Iniciar Manutenção',
    'col-done': 'Concluir Manutenção',
  };
  return nextColumnId ? labels[nextColumnId] ?? 'Próximo' : 'Próximo';
}
