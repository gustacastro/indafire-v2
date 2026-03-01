import { ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  hint?: ReactNode;
}
