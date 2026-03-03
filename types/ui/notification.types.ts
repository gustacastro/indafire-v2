import { ReactNode } from 'react';

export type NotificationVariant = 'info' | 'warning' | 'error' | 'success';

export interface NotificationProps {
  variant: NotificationVariant;
  message: string;
  title?: string;
  icon?: ReactNode;
  className?: string;
}
