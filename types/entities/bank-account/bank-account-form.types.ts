export type FormMode = 'create' | 'edit';

export interface BankAccountFormProps {
  mode: FormMode;
  bankAccountId?: string;
}
