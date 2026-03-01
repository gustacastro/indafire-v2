import { ReactNode } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchableSelectProps {
  label: string;
  required?: boolean;
  error?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  renderOption?: (option: SearchableSelectOption) => ReactNode;
  renderSelected?: (option: SearchableSelectOption) => ReactNode;
}
