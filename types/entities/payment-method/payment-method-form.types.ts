export type FormMode = 'create' | 'edit';

export interface PaymentMethodFormProps {
  mode: FormMode;
  paymentMethodId?: string;
}
