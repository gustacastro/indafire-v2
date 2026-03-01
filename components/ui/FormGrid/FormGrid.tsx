import { FormGridProps } from '@/types/ui/form-grid.types';

const colsClassMap: Record<number, string> = {
  1: 'grid grid-cols-1',
  2: 'grid grid-cols-1 sm:grid-cols-2',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

const gapClassMap: Record<number, string> = {
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
};

export function FormGrid({ cols = 2, gap = 4, children, className = '' }: FormGridProps) {
  const classes = [colsClassMap[cols], gapClassMap[gap], className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
