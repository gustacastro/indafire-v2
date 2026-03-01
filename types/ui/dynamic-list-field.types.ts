import { ReactNode } from 'react';

export interface DynamicListItem {
  value: string;
  department: string;
}

export interface DynamicListFieldProps {
  label: string;
  icon: ReactNode;
  items: DynamicListItem[];
  onChange: (items: DynamicListItem[]) => void;
  valuePlaceholder: string;
  departmentPlaceholder: string;
  valueFormatter?: (raw: string) => string;
  addLabel?: string;
}
