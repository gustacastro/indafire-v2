'use client';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { KanbanBoardProps, KanbanBaseCard } from '@/types/ui/kanban.types';
import { KanbanColumn } from '@/components/ui/KanbanBoard/KanbanColumn';
import { IconLoader } from '@/components/icons';

export function KanbanBoard<TCard extends KanbanBaseCard>({
  columns,
  renderCard,
  isLoading = false,
  getAllowedTargetColumns,
  onCardDrop,
  movingCardId,
  emptyIcon,
  emptyMessage,
  emptyDescription,
}: KanbanBoardProps<TCard>) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeSourceColId, setActiveSourceColId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingScroll = useRef(false);
  const isCardDragging = useRef(false);
  const scrollStartX = useRef(0);
  const scrollLeftStart = useRef(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } })
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (isCardDragging.current) return;
    isDraggingScroll.current = true;
    scrollStartX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingScroll.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - scrollStartX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingScroll.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
      scrollRef.current.style.userSelect = '';
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === activeCardId);
      if (card) return card;
    }
    return null;
  }, [activeCardId, columns]);

  const allowedTargetColIds = useMemo(() => {
    if (!activeCard) return new Set<string>();
    return new Set(getAllowedTargetColumns(activeCard.status));
  }, [activeCard, getAllowedTargetColumns]);

  const dragSourceTitle = useMemo(() => {
    if (!activeSourceColId) return undefined;
    return columns.find((c) => c.id === activeSourceColId)?.title;
  }, [activeSourceColId, columns]);

  function getDropState(colId: string): 'idle' | 'allowed' | 'blocked' {
    if (!activeCardId) return 'idle';
    if (colId === activeSourceColId) return 'idle';
    if (allowedTargetColIds.has(colId)) return 'allowed';
    return 'blocked';
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = String(event.active.id);
    isCardDragging.current = true;
    isDraggingScroll.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
      scrollRef.current.style.userSelect = '';
    }
    setActiveCardId(cardId);
    for (const col of columns) {
      if (col.cards.some((c) => c.id === cardId)) {
        setActiveSourceColId(col.id);
        break;
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    isCardDragging.current = false;
    setActiveCardId(null);
    setActiveSourceColId(null);

    if (!over || !active) return;

    const cardId = String(active.id);
    const targetColId = String(over.id);

    let sourceColId: string | null = null;
    let card: TCard | null = null;
    for (const col of columns) {
      const found = col.cards.find((c) => c.id === cardId);
      if (found) {
        sourceColId = col.id;
        card = found;
        break;
      }
    }

    if (!sourceColId || !card || sourceColId === targetColId) return;
    if (!allowedTargetColIds.has(targetColId)) return;

    onCardDrop(card, sourceColId, targetColId);
  }

  function handleDirectMove(card: TCard, sourceColId: string, targetColId: string) {
    onCardDrop(card, sourceColId, targetColId);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <IconLoader size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-stretch gap-(--spacing-md) md:gap-(--spacing-lg) pb-4 cursor-grab snap-x snap-mandatory md:snap-none scroll-smooth"
      >
        {columns.map((column, colIndex) => {
          const nextCol = columns[colIndex + 1];
          return (
            <KanbanColumn<TCard>
              key={column.id}
              column={column}
              renderCard={renderCard}
              dropState={getDropState(column.id)}
              nextColumnId={nextCol?.id}
              getAllowedTargetColumns={getAllowedTargetColumns}
              onDirectMove={handleDirectMove}
              movingCardId={movingCardId}
              expandedCards={{}}
              onToggleExpand={() => {}}
              dragSourceTitle={dragSourceTitle}
              emptyIcon={emptyIcon}
              emptyMessage={emptyMessage}
              emptyDescription={emptyDescription}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard && activeSourceColId && (() => {
          const sourceColIndex = columns.findIndex((c) => c.id === activeSourceColId);
          const dragOverlayNextColId = columns[sourceColIndex + 1]?.id;
          const allowedForOverlay = getAllowedTargetColumns(activeCard.status);
          const overlayNextColId =
            dragOverlayNextColId && allowedForOverlay.includes(dragOverlayNextColId)
              ? dragOverlayNextColId
              : undefined;
          return (
            <div className="opacity-90 rotate-1 scale-105 pointer-events-none">
              {renderCard({
                card: activeCard,
                columnId: activeSourceColId,
                nextColumnId: overlayNextColId,
                onDirectMove: () => {},
                isMoving: false,
                isExpanded: false,
                onToggleExpand: () => {},
              })}
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}
