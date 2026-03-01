import { api } from '@/lib/axios';

export interface TaxCategory {
  id: string;
  category_id: string;
  name: string;
  applies_to: string;
  allow_iss_deduction: boolean;
  iss_rate: number;
  csll_rate: number;
  ir_rate: number;
  inss_rate: number;
  pis_rate: number;
  cofins_rate: number;
  deleted: boolean;
  company_id: string;
}

export interface TaxesPagination {
  total_items: number;
  request_total_items: number;
}

export interface TaxesResponse {
  pagination: TaxesPagination;
  data: TaxCategory[];
}

export interface FetchTaxesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreateTaxPayload {
  name: string;
  applies_to: string;
  allow_iss_deduction: boolean;
  iss_rate: number;
  csll_rate: number;
  ir_rate: number;
  inss_rate: number;
  pis_rate: number;
  cofins_rate: number;
}

export type UpdateTaxPayload = CreateTaxPayload;

interface RawTaxCategory extends Omit<TaxCategory, 'id'> {
  category_id: string;
}

interface RawTaxesResponse {
  pagination: TaxesPagination;
  data: RawTaxCategory[];
}

interface RawTaxDetailResponse {
  tax_category: RawTaxCategory;
}

function mapTax(raw: RawTaxCategory): TaxCategory {
  return { ...raw, id: raw.category_id };
}

export async function fetchTaxes(params: FetchTaxesParams = {}): Promise<TaxesResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<RawTaxesResponse>(`/taxes/?${query.toString()}`);
  return { pagination: data.pagination, data: data.data.map(mapTax) };
}

export async function getTaxById(categoryId: string): Promise<TaxCategory> {
  const { data } = await api.get<RawTaxDetailResponse>(`/taxes/${categoryId}`);
  return mapTax(data.tax_category);
}

export async function createTax(payload: CreateTaxPayload): Promise<void> {
  await api.post('/taxes/create', payload);
}

export async function updateTax(categoryId: string, payload: UpdateTaxPayload): Promise<void> {
  await api.put(`/taxes/${categoryId}`, payload);
}

export async function deleteTax(categoryId: string): Promise<void> {
  await api.delete(`/taxes/${categoryId}`);
}
