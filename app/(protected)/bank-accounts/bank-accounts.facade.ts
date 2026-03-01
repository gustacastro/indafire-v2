import { api } from '@/lib/axios';

export interface BankAccount {
  id: string;
  account_id: string;
  alias: string;
  bank: string;
  bank_number: number;
  branch: string;
  account_number: string;
  pix_key_type: string;
  pix_key: string;
  company_id: string;
}

export interface BankAccountsPagination {
  total_items: number;
  request_total_items: number;
}

export interface BankAccountsResponse {
  pagination: BankAccountsPagination;
  data: BankAccount[];
}

export interface FetchBankAccountsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreateBankAccountPayload {
  alias: string;
  bank: string;
  bank_number: number;
  branch: string;
  account_number: string;
  pix_key_type: string;
  pix_key: string;
}

export type UpdateBankAccountPayload = CreateBankAccountPayload;

export interface BankInfo {
  code: string;
  ispb: string;
  name: string;
  shortName: string;
}

interface RawBankAccount {
  account_id: string;
  alias: string;
  bank: string;
  bank_number: number;
  branch: string;
  account_number: string;
  pix_key_type: string;
  pix_key: string;
  company_id: string;
}

interface RawBankAccountsResponse {
  pagination: BankAccountsPagination;
  data: RawBankAccount[];
}

function normalizeBankAccount(raw: RawBankAccount): BankAccount {
  return { ...raw, id: raw.account_id };
}

export async function fetchBankAccounts(
  params: FetchBankAccountsParams = {},
): Promise<BankAccountsResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<RawBankAccountsResponse>(
    `/bank-accounts/?${query.toString()}`,
  );
  return { pagination: data.pagination, data: data.data.map(normalizeBankAccount) };
}

export async function getBankAccountById(id: string): Promise<BankAccount> {
  const { data } = await api.get<{ bank_account: RawBankAccount }>(`/bank-accounts/${id}`);
  return normalizeBankAccount(data.bank_account);
}

export async function createBankAccount(
  payload: CreateBankAccountPayload,
): Promise<void> {
  await api.post('/bank-accounts/create', payload);
}

export async function updateBankAccount(
  id: string,
  payload: UpdateBankAccountPayload,
): Promise<void> {
  await api.put(`/bank-accounts/${id}`, payload);
}

export async function deleteBankAccount(id: string): Promise<void> {
  await api.delete(`/bank-accounts/${id}`);
}

export async function lookupBankByCode(code: string): Promise<BankInfo | null> {
  try {
    const res = await fetch(`/api/banks?code=${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
