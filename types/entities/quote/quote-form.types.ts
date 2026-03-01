export type QuoteFormMode = 'create' | 'edit';

export interface QuoteFormProps {
  mode: QuoteFormMode;
  quoteId?: string;
}
