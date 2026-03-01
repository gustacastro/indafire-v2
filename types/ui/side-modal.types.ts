import { ReactNode } from 'react';
import { ButtonVariant } from './button.types';

export interface SideModalButton {
  label: string;
  variant: ButtonVariant;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerButtons?: SideModalButton[];
}
