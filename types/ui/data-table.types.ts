import { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  label: string;
  canHide?: boolean;
  defaultVisible?: boolean;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  visibleColumns: string[];
}

export interface ColumnToggleProps<T> {
  columns: ColumnDef<T>[];
  visibleColumns: string[];
  onChange: (cols: string[]) => void;
}
