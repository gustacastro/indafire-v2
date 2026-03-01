'use client';
import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanBaseCard, KanbanColumnProps } from '@/types/ui/kanban.types';
import { KanbanCardWrapper } from '@/components/ui/KanbanBoard/KanbanCardWrapper';
import { IconFileText, IconArrowRight } from '@/components/icons';

interface KanbanColumnExtendedProps<TCard extends KanbanBaseCard> extends KanbanColumnProps<TCard> {
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function KanbanColumn<TCard extends KanbanBaseCard>({
  column,
  renderCard,
  dropState,
  nextColumnId,
  getAllowedTargetColumns,
  onDirectMove,
  movingCardId,
  expandedCards,
  onToggleExpand,
  dragSourceTitle,
  emptyIcon,
  emptyMessage,
  emptyDescription,
}: KanbanColumnExtendedProps<TCard>) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const isAllowedAndOver = dropState === 'allowed' && isOver;

  const containerClasses = [
    'relative flex-1 flex flex-col overflow-y-auto rounded-xl p-(--spacing-sm) transition-all duration-300 border-2',
    isAllowedAndOver
      ? 'border-kanban-drop-active-border border-solid bg-kanban-drop-active-bg shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
      : dropState === 'allowed'
        ? 'border-kanban-drop-border border-dashed bg-kanban-drop-bg'
        : dropState === 'blocked'
          ? 'border-transparent opacity-40'
          : 'border-transparent',
  ].join(' ');

  return (
    <div className="shrink-0 w-64 sm:w-72 md:w-85 flex flex-col snap-center">
      <div className="flex items-center justify-between mb-(--spacing-md) px-1">
        <div className="flex items-center gap-(--spacing-sm)">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: `var(--c-kanban-col-${column.color})` }}
          />
          <h2 className="text-xs md:text-sm font-bold text-heading tracking-wide">
            {column.title}
          </h2>
          <span
            className={[
              'border text-xs font-bold px-2 py-0.5 rounded-md',
              column.cards.length > 0
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-secondary text-muted border-border',
            ].join(' ')}
          >
            {column.cards.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className={containerClasses}>
        {isAllowedAndOver && dragSourceTitle && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-overlay/30 backdrop-blur-[2px] rounded-xl pointer-events-none">
            <div className="bg-card text-heading px-(--spacing-md) py-(--spacing-sm) rounded-xl font-bold text-sm flex items-center gap-(--spacing-sm) shadow-lg border border-border">
              <span>{dragSourceTitle}</span>
              <IconArrowRight size={16} className="text-muted" />
              <span>{column.title}</span>
            </div>
          </div>
        )}

        {column.cards.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 min-h-50 pointer-events-none">
            {emptyIcon ?? <IconFileText size={32} className="text-muted mb-(--spacing-md)" strokeWidth={1.5} />}
            <p className="text-sm font-bold text-muted">
              {emptyMessage ?? 'Nenhum item'}
            </p>
            <p className="text-xs text-muted mt-1">
              {emptyDescription ?? 'Não há itens com este status'}
            </p>
          </div>
        )}

        <div className="space-y-(--spacing-md) flex-1">
          {column.cards.map((card) => {
            const isCardMoving = movingCardId === card.id;
            return (
              <KanbanCardWrapper
                key={card.id}
                id={card.id}
                isMoving={isCardMoving}
                disabled={isCardMoving}
              >
                {renderCard({
                  card,
                  columnId: column.id,
                  nextColumnId:
                    nextColumnId && getAllowedTargetColumns(card.status).includes(nextColumnId)
                      ? nextColumnId
                      : undefined,
                  onDirectMove,
                  isMoving: isCardMoving,
                  isExpanded: expandedCards[card.id] ?? false,
                  onToggleExpand: () => onToggleExpand(card.id),
                })}
              </KanbanCardWrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
