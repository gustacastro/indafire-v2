export interface QuotePdfProduct {
  name: string;
  description: string;
  amount: number;
  unitaryValue: number;
  totalValue: number;
}

export interface QuotePdfJob {
  name: string;
  description: string;
  amount: number;
  unitaryValue: number;
  totalValue: number;
}

export interface QuotePdfPaymentMethod {
  name: string;
  provider: string;
  methodInfo: string;
  allowInstallments: boolean;
  installmentCount: number | null;
}

export interface QuotePdfData {
  quoteCode: number;
  clientName: string;
  creatorName: string;
  freight: number;
  discountPercentage: number;
  discountValue: number;
  totalItemsValue: number;
  totalQuoteValue: number;
  netValue: number;
  installments: number;
  paymentMethod: QuotePdfPaymentMethod | null;
  products: QuotePdfProduct[];
  jobs: QuotePdfJob[];
}
