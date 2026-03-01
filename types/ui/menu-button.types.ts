import { ButtonHTMLAttributes, ReactNode } from 'react';

export type MenuButtonVariant = 'default' | 'destructive' | 'accent';

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MenuButtonVariant;
  icon?: ReactNode;
  label: string;
}
