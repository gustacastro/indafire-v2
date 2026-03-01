export type FormMode = 'create' | 'edit';
export interface TaxFormProps {
  mode: FormMode;
  taxId?: string;
}
