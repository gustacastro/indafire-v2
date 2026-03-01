'use client';
import { KanbanCardComponentProps } from '@/types/ui/kanban.types';
import { QuoteKanbanCard as QuoteKanbanCardType } from '@/types/entities/quote/quote-kanban.types';
import { Button } from '@/components/ui/Button/Button';
import { TagChip } from '@/components/ui/TagChip/TagChip';
import { RowActions } from '@/components/data/RowActions/RowActions';
import {
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconHash,
  IconCalendar,
  IconCreditCard,
  IconCheck,
  IconXCircle,
  IconGripVertical,
  IconEye,
  IconEdit,
  IconTrash,
} from '@/components/icons';
import { formatApiCurrency } from '@/utils/currency';
import { getInitials } from '@/utils/initials';

interface QuoteKanbanCardProps extends KanbanCardComponentProps<QuoteKanbanCardType> {
  onDeclineRequest?: (card: QuoteKanbanCardType) => void;
  onViewRequest?: (card: QuoteKanbanCardType) => void;
  onEditRequest?: (card: QuoteKanbanCardType) => void;
  onDeleteRequest?: (card: QuoteKanbanCardType) => void;
}

export function QuoteKanbanCard({
  card,
  columnId,
  nextColumnId,
  onDirectMove,
  isMoving,
  isExpanded,
  onToggleExpand,
  onDeclineRequest,
  onViewRequest,
  onEditRequest,
  onDeleteRequest,
}: QuoteKanbanCardProps) {
  const nextColLabel = getNextColumnLabel(nextColumnId);

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
          <div className="flex items-start gap-(--spacing-sm)">
            <IconGripVertical
              size={14}
              className="text-muted cursor-grab group-hover:scale-120 transition-transform -ml-1 mt-0.5"
            />
              <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-(--spacing-xs)">
                <span className="text-[15px] font-bold text-muted uppercase tracking-wider">
                  #{card.quoteCode}
                </span>
                {card.status === 'DECLINED' && (
                  <TagChip label="Recusado" variant="brand" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted font-medium truncate max-w-32">
                  {card.creatorName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <RowActions
              actions={[
                {
                  label: 'Visualizar orçamento',
                  icon: <IconEye size={15} />,
                  onClick: () => onViewRequest?.(card),
                },
                ...(onEditRequest && card.status !== 'APPROVED'
                  ? [
                      {
                        label: 'Editar orçamento',
                        icon: <IconEdit size={15} />,
                        onClick: () => onEditRequest(card),
                      },
                    ]
                  : []),
                ...(card.status === 'SUBMITTED' && onDeclineRequest
                  ? [
                      {
                        label: 'Recusar proposta',
                        icon: <IconXCircle size={15} />,
                        variant: 'destructive' as const,
                        separator: true,
                        onClick: () => onDeclineRequest(card),
                      },
                    ]
                  : []),
                ...(onDeleteRequest
                  ? [
                      {
                        label: 'Excluir orçamento',
                        icon: <IconTrash size={15} />,
                        variant: 'destructive' as const,
                        separator: true,
                        onClick: () => onDeleteRequest(card),
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

        <div className="flex items-end justify-between mb-(--spacing-md) gap-(--spacing-md)">
          <div className="flex-1">
            <p className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Cliente</p>
            <h3 className="text-xs md:text-sm font-bold text-heading line-clamp-2 leading-snug">
              {card.clientName}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-sm md:text-base font-black text-success block whitespace-nowrap">
              {formatApiCurrency(card.netValue)}
            </span>
          </div>
        </div>

        <div className="pt-(--spacing-sm) border-t border-border flex justify-between items-center mt-auto">
          {nextColumnId ? (
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
              className="!text-xs !py-1.5"
            >
              {nextColLabel}
            </Button>
          ) : (
            <span className="w-full text-xs font-bold text-success bg-success/10 py-2 rounded-md flex items-center justify-center gap-1">
              <IconCheck size={14} /> Finalizado
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-(--spacing-sm) pb-(--spacing-sm) pt-(--spacing-xs) md:px-(--spacing-md) md:pb-(--spacing-md) md:pt-(--spacing-sm) border-t border-border bg-secondary/50">
          <div className="grid grid-cols-2 gap-y-(--spacing-sm) gap-x-(--spacing-sm)">
            <div>
              <p className="text-[10px] text-muted uppercase font-bold flex items-center gap-1 mb-1">
                <IconHash size={12} /> Código
              </p>
              <p className="text-xs text-foreground font-mono">#{card.quoteCode}</p>
            </div>

            <div>
              <p className="text-[10px] text-muted uppercase font-bold flex items-center gap-1 mb-1">
                <IconCalendar size={12} /> Entrega
              </p>
              <p className="text-xs text-foreground font-medium">{card.deliveryDate}</p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] text-muted uppercase font-bold flex items-center gap-1 mb-1">
                <IconCreditCard size={12} /> Pagamento
              </p>
              <p className="text-xs text-foreground font-medium">
                {card.paymentMethodName}
                {card.installments > 0 ? ` — ${card.installments}x` : ' — À vista'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNextColumnLabel(nextColumnId?: string): string {
  const labels: Record<string, string> = {
    'col-attendance': 'Atendimento',
    'col-quote': 'Orçamento',
    'col-submitted': 'Enviar Proposta',
    'col-approved': 'Aprovar Pedido',
    'col-divergent': 'Pedido Divergente',
  };
  return nextColumnId ? labels[nextColumnId] ?? 'Próximo' : 'Próximo';
}
