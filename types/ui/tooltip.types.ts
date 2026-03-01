import { ReactNode } from 'react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  children: ReactNode;
  className?: string;
}
