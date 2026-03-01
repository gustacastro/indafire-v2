import { TaxCategory } from '@/app/(protected)/taxes/taxes.facade';

export type TaxCardVariant = 'full' | 'compact';

export interface TaxCardProps {
  tax: TaxCategory;
  variant: TaxCardVariant;
  onRemove?: () => void;
}
