import { ReactNode } from 'react';

export interface InfoTableColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  className?: string;
}

export interface InfoTableProps<T = Record<string, unknown>> {
  /** Optional section title shown above the table */
  title?: string;
  columns: InfoTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
}
