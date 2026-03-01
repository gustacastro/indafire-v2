import { ReactNode } from 'react';
import { SideModalButton } from './side-modal.types';

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
  closeOnSelect?: boolean;
  footerButtons?: SideModalButton[];
  noResultsContent?: ReactNode;
}
