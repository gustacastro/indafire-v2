import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';

export interface TaxDropdownProps {
  label?: string;
  required?: boolean;
  value: string[];
  onChange: (ids: string[]) => void;
  taxes: TaxCategory[];
  error?: string;
}
