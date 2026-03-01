export interface TagInputProps {
  label: string;
  required?: boolean;
  error?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}
