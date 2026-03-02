import { ReactNode } from 'react';

export interface DetailFieldProps {
  icon?: ReactNode;
  label: string;
  value?: string;
  children?: ReactNode;
  className?: string;
}
