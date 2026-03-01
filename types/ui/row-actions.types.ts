import { ReactNode } from 'react';
import { MenuButtonVariant } from './menu-button.types';

export interface RowAction {
  label: string;
  icon?: ReactNode;
  variant?: MenuButtonVariant;
  onClick: () => void;
  separator?: boolean;
}

export interface RowActionsProps {
  actions: RowAction[];
}
