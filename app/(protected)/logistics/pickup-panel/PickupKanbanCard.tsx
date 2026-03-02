'use client';
import { Button } from '@/components/ui/Button/Button';
import { TagChip } from '@/components/ui/TagChip/TagChip';
import { RowActions } from '@/components/data/RowActions/RowActions';
import { DetailField } from '@/components/ui/DetailField/DetailField';
import { MapsButton } from '@/components/ui/MapsButton/MapsButton';
import {
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconHash,
  IconCalendar,
  IconCalendarClock,
  IconGripVertical,
  IconEye,
  IconMapPin,
  IconWrench,
} from '@/components/icons';
import { PickupKanbanCardProps } from '@/types/entities/job-task/pickup-kanban.types';
import { formatAddressShort } from '@/app/(protected)/clients/clients.facade';
import { formatDateTimeBR } from '@/utils/datetime';

const STATUSES_WITHOUT_PICKUP_VIEW = ['WAITING_SCHEDULING', 'APPROVED', 'IN_PICKUP_ROUTE'];

export function PickupKanbanCard({
  card,
  columnId,
  nextColumnId,
  onDirectMove,
  isMoving,
  isExpanded,
  onToggleExpand,
  pickupProgress,
  onScheduleRequest,
  onViewQuoteRequest,
  onPickupRequest,
  onViewPickupsRequest,
  onSendToWorkshop,
}: PickupKanbanCardProps) {
  const isWaitingScheduling = card.status === 'WAITING_SCHEDULING';
  const isDone = card.status === 'PICKUP_DONE';
  const isExecuting = card.status === 'EXECUTING_PICKUP';
  const nextColLabel = getNextColumnLabel(nextColumnId);
  const hasAddress = card.address.street || card.address.city;
  const showPickupView = !STATUSES_WITHOUT_PICKUP_VIEW.includes(card.status);
  const allItemsPicked = pickupProgress
    ? pickupProgress.picked >= pickupProgress.total
    : false;

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
                {isWaitingScheduling && (
                  <TagChip label="Aguardando Agendamento" variant="default" />
                )}
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
                ...(showPickupView && card.requiresPickup
                  ? [
                      {
                        label: 'Ver itens retirados',
                        onClick: () => onViewPickupsRequest?.(card),
                        icon: <IconEye size={15} />,
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

        {isExecuting && pickupProgress && (
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
          {isWaitingScheduling ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              iconRight={<IconCalendarClock size={14} />}
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onScheduleRequest?.(card);
              }}
              className="text-xs! py-1.5!"
            >
              Agendar
            </Button>
          ) : isExecuting && !allItemsPicked ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onPickupRequest?.(card);
              }}
              className="text-xs! py-1.5!"
            >
              Retirar Item do orçamento
            </Button>
          ) : isExecuting && allItemsPicked && nextColumnId ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onDirectMove(card, columnId, nextColumnId);
              }}
              className="text-xs! py-1.5!"
            >
              Concluir Retirada
            </Button>
          ) : nextColumnId && !isDone ? (
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
          ) : isDone ? (
            <Button
              variant="brand-outline"
              size="sm"
              fullWidth
              iconRight={<IconWrench size={14} />}
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                onSendToWorkshop?.(card);
              }}
              className="text-xs! py-1.5!"
            >
              Enviar para oficina
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

            {card.pickupScheduleDate && (
              <DetailField
                icon={<IconCalendarClock size={12} />}
                label="Retirada agendada"
                value={formatDateTimeBR(card.pickupScheduleDate)}
                className="col-span-2"
              />
            )}

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
    'col-new-orders': 'Novos Pedidos',
    'col-in-route': 'Enviar para Rota',
    'col-executing': 'Iniciar Retirada',
    'col-done': 'Concluir Retirada',
  };
  return nextColumnId ? labels[nextColumnId] ?? 'Próximo' : 'Próximo';
}
