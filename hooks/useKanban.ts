'use client';
import { useState, useCallback } from 'react';
import { KanbanBaseCard, KanbanColumnConfig } from '@/types/ui/kanban.types';

export function useKanban<TCard extends KanbanBaseCard>(
  initialColumns: KanbanColumnConfig<TCard>[]
) {
  const [columns, setColumns] = useState<KanbanColumnConfig<TCard>[]>(initialColumns);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [movingCardId, setMovingCardId] = useState<string | null>(null);

  const setColumnsDirectly = useCallback((newColumns: KanbanColumnConfig<TCard>[]) => {
    setColumns(newColumns);
  }, []);

  const moveCard = useCallback((cardId: string, sourceColId: string, targetColId: string, newStatus?: string) => {
    setColumns((prev) => {
      const newCols = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const sourceCol = newCols.find((c) => c.id === sourceColId);
      const targetCol = newCols.find((c) => c.id === targetColId);
      if (!sourceCol || !targetCol) return prev;

      const cardIndex = sourceCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = sourceCol.cards.splice(cardIndex, 1);
      const updatedCard = newStatus ? { ...card, status: newStatus } : card;
      targetCol.cards.push(updatedCard);

      return newCols;
    });
  }, []);

  const revertMove = useCallback((cardId: string, sourceColId: string, targetColId: string) => {
    setColumns((prev) => {
      const newCols = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const currentCol = newCols.find((c) => c.id === targetColId);
      const originalCol = newCols.find((c) => c.id === sourceColId);
      if (!currentCol || !originalCol) return prev;

      const cardIndex = currentCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = currentCol.cards.splice(cardIndex, 1);
      originalCol.cards.push(card);

      return newCols;
    });
  }, []);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const findCardColumn = useCallback((cardId: string): string | null => {
    for (const col of columns) {
      if (col.cards.some((c) => c.id === cardId)) {
        return col.id;
      }
    }
    return null;
  }, [columns]);

  const getCard = useCallback((cardId: string): TCard | null => {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }, [columns]);

  return {
    columns,
    setColumns: setColumnsDirectly,
    expandedCards,
    movingCardId,
    setMovingCardId,
    moveCard,
    revertMove,
    toggleCard,
    findCardColumn,
    getCard,
  };
}
