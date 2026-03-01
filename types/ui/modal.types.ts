import { ReactNode } from 'react';

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children?: ReactNode;
  className?: string;
}

export interface ModalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  description?: string | ReactNode;
  icon?: ReactNode;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  children?: ReactNode;
  requireConfirmation?: boolean;
  requireConfirmationLabel?: string;
}
