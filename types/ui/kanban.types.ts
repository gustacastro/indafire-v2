import { ReactNode } from 'react';

export interface KanbanBaseCard {
  id: string;
  status: string;
}

export interface KanbanColumnConfig<TCard extends KanbanBaseCard> {
  id: string;
  title: string;
  statuses: string[];
  color: string;
  cards: TCard[];
  headerAction?: ReactNode;
}

export type KanbanMoveActionType = 'confirm' | 'reason' | 'send_proposal' | 'edit_first' | null;

export interface KanbanMoveResult {
  allowed: boolean;
  reason?: string;
}

export interface KanbanCardComponentProps<TCard extends KanbanBaseCard> {
  card: TCard;
  columnId: string;
  nextColumnId?: string;
  onDirectMove: (card: TCard, sourceColId: string, targetColId: string) => void;
  isMoving: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export interface KanbanBoardProps<TCard extends KanbanBaseCard> {
  columns: KanbanColumnConfig<TCard>[];
  renderCard: (props: KanbanCardComponentProps<TCard>) => ReactNode;
  isLoading?: boolean;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  getAllowedTargetColumns: (cardStatus: string) => string[];
  onCardDrop: (card: TCard, sourceColId: string, targetColId: string) => void;
  movingCardId: string | null;
}

export interface KanbanColumnProps<TCard extends KanbanBaseCard> {
  column: KanbanColumnConfig<TCard>;
  renderCard: (props: KanbanCardComponentProps<TCard>) => ReactNode;
  dropState: 'idle' | 'allowed' | 'blocked';
  nextColumnId?: string;
  getAllowedTargetColumns: (cardStatus: string) => string[];
  onDirectMove: (card: TCard, sourceColId: string, targetColId: string) => void;
  movingCardId: string | null;
  expandedCards: Record<string, boolean>;
  onToggleExpand: (cardId: string) => void;
  dragSourceTitle?: string;
}

export interface KanbanCardWrapperProps {
  id: string;
  children: ReactNode;
  isMoving: boolean;
  disabled?: boolean;
}
