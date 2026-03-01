import { ReactNode } from 'react';
import { ColumnDef } from './data-table.types';

export interface FilterBarProps<T> {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  totalItems: number;
  columns: ColumnDef<T>[];
  visibleColumns: string[];
  onColumnsChange: (cols: string[]) => void;
  perPage: number;
  onPerPageChange: (value: number) => void;
  perPageOptions?: number[];
  extraActions?: ReactNode;
}
