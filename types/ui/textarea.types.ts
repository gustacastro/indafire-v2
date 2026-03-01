import { TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> {
  label: string;
  required?: boolean;
  error?: string;
}
