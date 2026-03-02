import { api } from '@/lib/axios';
import { getProductById, Product } from '@/app/(protected)/products/products.facade';
import { getJobById, Job } from '@/app/(protected)/jobs/jobs.facade';
import { getClientById, Client, getClientName, getClientDocument, getClientType, buildGoogleMapsUrl, formatAddressShort } from '@/app/(protected)/clients/clients.facade';
import { getPaymentMethodById, PaymentMethod, fetchPaymentMethods } from '@/app/(protected)/payment-methods/payment-methods.facade';
import { getUserById, User } from '@/app/(protected)/users/users.facade';
import { LabelMap, mapLabel } from '@/utils/label-map';
import { StatusBadgeVariant } from '@/types/ui/status-badge.types';
import {
  Divergency,
  EnrichedDivergency,
  CreateDivergencyPayload,
  ResolveDivergencyPayload,
  DivergenciesResponse,
} from '@/types/entities/quote/divergency.types';

export type { EnrichedDivergency };

export { getClientName, getClientDocument, getClientType, buildGoogleMapsUrl, formatAddressShort };
export type { Client, Product, Job, PaymentMethod };

export interface QuoteProduct {
  product_id: string;
  amount: number;
  unitary_value: number;
}

export interface QuoteService {
  service_id: string;
  amount: number;
  unitary_value: number;
}

export interface QuoteListItem {
  id: string;
  quote_id: string;
  quote_code: number;
  client_id: string;
  payment_method_id: string;
  creator_id: string;
  company_id: string;
  total_items_value: number;
  total_quote_value: number;
  freight: number;
  discount_percentage: number;
  discount_value: number;
  net_value: number;
  installments: number;
  expected_delivery_date: string;
  status: string;
  deleted: boolean;
  clientName?: string;
  paymentMethodName?: string;
  creatorName?: string;
}

export interface QuoteDetailProduct {
  product_id: string;
  amount: number;
  unitary_value: number;
}

export interface QuoteDetailJob {
  job_id: string;
  service_id: string | null;
  amount: number;
  unitary_value: number;
}

export interface QuoteRejection {
  reason: string;
  created_at: string;
  created_by: string;
}

export interface EnrichedRejection {
  reason: string;
  created_at: string;
  created_by_name: string;
}

export interface QuoteDetail {
  quote_id: string;
  quote_code: number;
  creator_id: string;
  expected_delivery_date: string;
  freight: number;
  installments: number;
  discount_percentage: number;
  discount_value: number;
  total_items_value: number;
  total_quote_value: number;
  net_value: number;
  client_id: string;
  payment_method_id: string;
  company_id: string;
  status: string;
  products: QuoteDetailProduct[];
  jobs: QuoteDetailJob[];
  rejections: QuoteRejection[];
}

export interface EnrichedQuoteProduct {
  product: Product;
  amount: number;
  unitary_value: number;
}

export interface EnrichedQuoteJob {
  job: Job;
  amount: number;
  unitary_value: number;
}

export interface EnrichedQuote {
  detail: QuoteDetail;
  client: Client;
  paymentMethod: PaymentMethod | null;
  products: EnrichedQuoteProduct[];
  jobs: EnrichedQuoteJob[];
  rejections: EnrichedRejection[];
  divergencies: EnrichedDivergency[];
}

export interface CreateQuotePayload {
  quote_code: string;
  client_id: string;
  company_id: string;
  expected_delivery_date: string;
  freight: number;
  total_items_value: number;
  total_quote_value: number;
  discount_percentage: number;
  discount_value: number;
  net_value: number;
  installments: number;
  payment_method_id: string;
  status: string;
  deleted: boolean;
  products: QuoteProduct[];
  services: QuoteService[];
}

export type UpdateQuotePayload = CreateQuotePayload;

export interface QuotesPagination {
  total_items: number;
  request_total_items: number;
}

export interface QuotesResponse {
  pagination: QuotesPagination;
  data: QuoteListItem[];
}

export interface FetchQuotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

interface RawQuoteListItem {
  quote_id: string;
  quote_code: number;
  client_id: string;
  payment_method_id: string;
  creator_id: string;
  company_id: string;
  total_items_value: number;
  total_quote_value: number;
  freight: number;
  discount_percentage: number;
  discount_value: number;
  net_value: number;
  installments: number;
  expected_delivery_date: string;
  status: string;
  deleted: boolean;
}

interface RawQuotesResponse {
  pagination: QuotesPagination;
  data: RawQuoteListItem[];
}

interface RawQuoteDetailResponse {
  quote: {
    quote_id: string;
    quote_code: number;
    creator_id: string;
    expected_delivery_date: string;
    freight: number;
    installments: number;
    discount_percentage: number;
    discount_value: number;
    total_items_value: number;
    total_quote_value: number;
    net_value: number;
    client_id: string;
    payment_method_id: string;
    company_id: string;
    status: string;
    products: QuoteDetailProduct[];
    jobs: QuoteDetailJob[];
    rejections: QuoteRejection[];
  };
}

function normalizeQuoteListItem(raw: RawQuoteListItem): QuoteListItem {
  return { ...raw, id: raw.quote_id };
}

const QUOTE_STATUS_LABELS: LabelMap = {
  IN_ATTENDANCE: 'Em Atendimento',
  PENDING_APPROVAL: 'Pendente',
  SUBMITTED: 'Proposta Enviada',
  APPROVED: 'Aprovado',
  DECLINED: 'Recusado',
  REJECTED: 'Rejeitado',
  CANCELLED: 'Cancelado',
  WITH_DIVERGENCY: 'Divergente',
};

const QUOTE_STATUS_VARIANTS: Record<string, StatusBadgeVariant> = {
  IN_ATTENDANCE: 'muted',
  PENDING_APPROVAL: 'warning',
  SUBMITTED: 'primary',
  APPROVED: 'success',
  DECLINED: 'error',
  REJECTED: 'error',
  CANCELLED: 'muted',
  WITH_DIVERGENCY: 'warning',
};

export function getQuoteStatusLabel(status: string): string {
  return mapLabel(status, QUOTE_STATUS_LABELS);
}

export function getQuoteStatusVariant(status: string): StatusBadgeVariant {
  return QUOTE_STATUS_VARIANTS[status] ?? 'muted';
}

export async function fetchQuotes(params: FetchQuotesParams = {}): Promise<QuotesResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<RawQuotesResponse>(`/quotes/?${query.toString()}`);
  return {
    pagination: data.pagination,
    data: data.data.map(normalizeQuoteListItem),
  };
}

export async function fetchQuotesEnriched(params: FetchQuotesParams = {}): Promise<QuotesResponse> {
  const quotesRes = await fetchQuotes(params);

  const clientIds = [...new Set(quotesRes.data.map((q) => q.client_id).filter(Boolean))];
  const paymentIds = [...new Set(quotesRes.data.map((q) => q.payment_method_id).filter(Boolean))];
  const creatorIds = [...new Set(quotesRes.data.map((q) => q.creator_id).filter(Boolean))];

  const [clients, paymentMethods, creators] = await Promise.all([
    Promise.all(clientIds.map((id) => getClientById(id).catch(() => null))),
    Promise.all(paymentIds.map((id) => getPaymentMethodById(id).catch(() => null))),
    Promise.all(creatorIds.map((id) => getUserById(id).catch(() => null))),
  ]);

  const clientMap = new Map<string, Client>();
  clients.forEach((c) => { if (c) clientMap.set(c.id, c); });

  const pmMap = new Map<string, PaymentMethod>();
  paymentMethods.forEach((pm) => { if (pm) pmMap.set(pm.id, pm); });

  const creatorMap = new Map<string, User>();
  creators.forEach((u) => { if (u) creatorMap.set(u.id, u); });

  return {
    pagination: quotesRes.pagination,
    data: quotesRes.data.map((q) => ({
      ...q,
      clientName: clientMap.has(q.client_id) ? getClientName(clientMap.get(q.client_id)!) : '—',
      paymentMethodName: pmMap.get(q.payment_method_id)?.name ?? '—',
      creatorName: creatorMap.get(q.creator_id)?.name ?? '—',
    })),
  };
}

export async function getQuoteById(quoteId: string): Promise<QuoteDetail> {
  const { data } = await api.get<RawQuoteDetailResponse>(`/quotes/${quoteId}`);
  return data.quote;
}

export async function getQuoteEnriched(quoteId: string): Promise<EnrichedQuote> {
  const detail = await getQuoteById(quoteId);

  const rejectionCreatorIds = [...new Set(detail.rejections.map((r) => r.created_by))];

  const [client, paymentMethod, products, jobs, rejectionCreators, rawDivergencies] = await Promise.all([
    getClientById(detail.client_id),
    detail.payment_method_id
      ? getPaymentMethodById(detail.payment_method_id).catch(() => null)
      : Promise.resolve(null),
    Promise.all(
      detail.products.map(async (p) => {
        const product = await getProductById(p.product_id);
        return { product, amount: p.amount, unitary_value: p.unitary_value } as EnrichedQuoteProduct;
      }),
    ),
    Promise.all(
      detail.jobs.map(async (j) => {
        const job = await getJobById(j.job_id);
        return { job, amount: j.amount, unitary_value: j.unitary_value } as EnrichedQuoteJob;
      }),
    ),
    Promise.all(rejectionCreatorIds.map((id) => getUserById(id).catch(() => null))),
    fetchDivergencies(quoteId).catch(() => []),
  ]);

  const creatorMap = new Map<string, string>();
  rejectionCreators.forEach((u) => { if (u) creatorMap.set(u.id, u.name); });

  const rejections: EnrichedRejection[] = detail.rejections.map((r) => ({
    reason: r.reason,
    created_at: r.created_at,
    created_by_name: creatorMap.get(r.created_by) ?? 'Usuário desconhecido',
  }));

  const divergencies = await enrichDivergencies(rawDivergencies);

  return { detail, client, paymentMethod, products, jobs, rejections, divergencies };
}

export async function createQuote(payload: CreateQuotePayload, initialStatus = 'PENDING_APPROVAL'): Promise<void> {
  await api.post(`/quotes/create/${initialStatus}`, payload);
}

export async function updateQuote(quoteId: string, payload: UpdateQuotePayload): Promise<void> {
  await api.put(`/quotes/${quoteId}`, payload);
}

export async function deleteQuote(quoteId: string): Promise<void> {
  await api.delete(`/quotes/${quoteId}`);
}

export async function updateQuoteStatus(
  quoteId: string,
  newStatus: string,
  body?: { reason: string }
): Promise<void> {
  await api.put(`/quotes/${quoteId}/${newStatus}`, body ?? {});
}

export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await fetchPaymentMethods({ page: 1, perPage: 9999 });
  return res.data.filter((pm) => pm.active && !pm.deleted);
}

export function calcTotalItemsValue(
  products: { unitary_value: number; amount: number }[],
  services: { unitary_value: number; amount: number }[],
): number {
  const prodTotal = products.reduce((sum, p) => sum + p.unitary_value * p.amount, 0);
  const servTotal = services.reduce((sum, s) => sum + s.unitary_value * s.amount, 0);
  return prodTotal + servTotal;
}

export function calcQuoteTotals(
  products: { unitary_value: number; amount: number }[],
  services: { unitary_value: number; amount: number }[],
  freight: number,
  discountPercentage: number,
) {
  const totalItemsValue = calcTotalItemsValue(products, services);
  const totalQuoteValue = totalItemsValue + freight;
  const discountValue = Math.round(totalItemsValue * discountPercentage / 10000);
  const netValue = totalQuoteValue - discountValue;
  return { totalItemsValue, totalQuoteValue, discountValue, netValue };
}

export const DIVERGENCY_TYPE_OPTIONS = [
  { value: 'Orçamento incorreto', label: 'Orçamento incorreto' },
  { value: 'Produto incorreta', label: 'Produto incorreta' },
  { value: 'Produto preço incorreto', label: 'Produto preço incorreto' },
  { value: 'Produto quantidade incorreta', label: 'Produto quantidade incorreta' },
  { value: 'Produto tipo incorreto', label: 'Produto tipo incorreto' },
  { value: 'Serviço incorreto', label: 'Serviço incorreto' },
  { value: 'Serviço preço incorreto', label: 'Serviço preço incorreto' },
  { value: 'Serviço quantidade incorreta', label: 'Serviço quantidade incorreta' },
  { value: 'Serviço tipo incorreto', label: 'Serviço tipo incorreto' },
  { value: 'Cliente endereço incorreto', label: 'Cliente endereço incorreto' },
  { value: 'Cliente dados incorretos', label: 'Cliente dados incorretos' },
];

export async function fetchDivergencies(quoteId: string): Promise<Divergency[]> {
  const { data } = await api.get<DivergenciesResponse>(`/quotes/${quoteId}/divergency`);
  return data.divergencies;
}

export async function createDivergency(quoteId: string, payload: CreateDivergencyPayload): Promise<void> {
  await api.post(`/quotes/${quoteId}/divergency`, payload);
}

export async function resolveDivergency(
  quoteId: string,
  divergencyId: string,
  payload: ResolveDivergencyPayload,
): Promise<void> {
  await api.post(`/quotes/${quoteId}/divergency/${divergencyId}/resolve`, payload);
}

export async function enrichDivergencies(divergencies: Divergency[]): Promise<EnrichedDivergency[]> {
  const creatorIds = [...new Set(divergencies.map((d) => d.created_by))];
  const resolverIds = [...new Set(divergencies.filter((d) => d.resolved_by).map((d) => d.resolved_by!))];
  const allUserIds = [...new Set([...creatorIds, ...resolverIds])];

  const users = await Promise.all(allUserIds.map((id) => getUserById(id).catch(() => null)));
  const userMap = new Map<string, string>();
  users.forEach((u) => { if (u) userMap.set(u.id, u.name); });

  return divergencies.map((d) => ({
    divergency_id: d.divergency_id,
    quote_id: d.quote_id,
    type: d.type,
    problem_description: d.problem_description,
    resolved: d.resolved,
    created_at: d.created_at,
    resolved_at: d.resolved_at,
    resolution_description: d.resolution_description,
    created_by_name: userMap.get(d.created_by) ?? 'Usuário desconhecido',
    resolved_by_name: d.resolved_by ? (userMap.get(d.resolved_by) ?? 'Usuário desconhecido') : null,
  }));
}
