import { ReactNode } from 'react';

export interface KanbanFilterUser {
  id: string;
  name: string;
}

export interface KanbanFilterBarProps {
  user: KanbanFilterUser | null;
  showAllActive: boolean;
  onToggleShowAll: () => void;
  userCardCount?: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  action?: ReactNode;
}
