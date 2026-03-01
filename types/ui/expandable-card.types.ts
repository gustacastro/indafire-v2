import { ReactNode } from 'react';

export interface ExpandableCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}
