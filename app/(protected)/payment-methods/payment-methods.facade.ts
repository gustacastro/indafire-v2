import { api } from '@/lib/axios';

export interface PaymentMethod {
  payment_method_id: string;
  id: string;
  name: string;
  provider: string;
  method_info: string;
  minimum_amount: number;
  minimum_installment_amount: number | null;
  allow_installments: boolean;
  installment_count: number | null;
  installment_percentages: number[];
  installment_intervals: number[];
  active: boolean;
  company_id: string;
  deleted: boolean;
}

export interface CreatePaymentMethodPayload {
  name: string;
  provider: string;
  method_info: string;
  minimum_amount: number;
  minimum_installment_amount: number;
  allow_installments: boolean;
  installment_count: number;
  installment_percentages: number[];
  installment_intervals: number[];
  active: boolean;
}

export type UpdatePaymentMethodPayload = CreatePaymentMethodPayload;

export interface PaymentMethodsPagination {
  total_items: number;
  request_total_items: number;
}

export interface PaymentMethodsResponse {
  pagination: PaymentMethodsPagination;
  data: PaymentMethod[];
}

interface RawPaymentMethod {
  payment_method_id: string;
  name: string;
  provider: string;
  method_info: string;
  minimum_amount: number;
  minimum_installment_amount: number | null;
  allow_installments: boolean;
  installment_count: number | null;
  installment_percentages: number[];
  installment_intervals: number[];
  active: boolean;
  company_id: string;
  deleted: boolean;
}

interface RawPaymentMethodsResponse {
  pagination: PaymentMethodsPagination;
  data: RawPaymentMethod[];
}

interface RawPaymentMethodDetailResponse {
  payment_method: RawPaymentMethod;
}

function normalize(raw: RawPaymentMethod): PaymentMethod {
  return {
    ...raw,
    id: raw.payment_method_id,
    installment_percentages: raw.installment_percentages ?? [],
    installment_intervals: raw.installment_intervals ?? [],
  };
}

export interface FetchPaymentMethodsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function fetchPaymentMethods(
  params: FetchPaymentMethodsParams = {},
): Promise<PaymentMethodsResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<RawPaymentMethodsResponse>(
    `/payment-methods/?${query.toString()}`,
  );
  return { pagination: data.pagination, data: data.data.map(normalize) };
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  const { data } = await api.get<RawPaymentMethodDetailResponse>(
    `/payment-methods/${id}`,
  );
  return normalize(data.payment_method);
}

export async function createPaymentMethod(
  payload: CreatePaymentMethodPayload,
): Promise<void> {
  await api.post('/payment-methods/create', payload);
}

export async function updatePaymentMethod(
  id: string,
  payload: UpdatePaymentMethodPayload,
): Promise<void> {
  await api.put(`/payment-methods/${id}`, payload);
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/payment-methods/${id}`);
}
