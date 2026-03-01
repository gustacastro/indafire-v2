import { InputHTMLAttributes } from 'react';

export interface FormFieldInlineSwitch {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'required'> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  copy?: boolean;
  showCount?: boolean;
  inlineSwitch?: FormFieldInlineSwitch;
}
