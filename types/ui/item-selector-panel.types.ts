import { ReactNode } from 'react';

export interface ItemSelectorPanelProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  selectedIds: string[];
  onToggle: (item: T) => void;
  getId: (item: T) => string;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  mode?: 'single' | 'multi';
}
