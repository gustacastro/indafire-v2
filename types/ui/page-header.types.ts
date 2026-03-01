import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon: ReactNode;
  action?: ReactNode;
}
