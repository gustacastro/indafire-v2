export interface PillOption {
  value: string;
  label: string;
}

export interface PillSelectorProps {
  label?: string;
  required?: boolean;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}
