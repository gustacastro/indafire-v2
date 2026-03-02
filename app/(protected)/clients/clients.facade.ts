import { api, proxyApi } from '@/lib/axios';

export interface ClientIdentityPJ {
  cnpj: string;
  company_name: string;
  company_fantasy_name: string;
  company_city_registration: string;
  company_state_registration: string;
  tax_regime: string;
  rate_differential: string;
  defaulter: boolean;
  supplier: boolean;
  prospection?: boolean;
}

export interface ClientIdentityPF {
  cpf: string;
  name: string;
  fantasy_name: string;
  defaulter: boolean;
  supplier: boolean;
  prospection?: boolean;
}

export type ClientIdentity = ClientIdentityPJ | ClientIdentityPF;

export interface ClientAddress {
  cep: string;
  state: string;
  city: string;
  district: string;
  street: string;
  street_number: string;
}

export interface AdditionalEmail {
  email: string;
  department: string;
}

export interface AdditionalPhone {
  number: string;
  department: string;
}

export interface ClientContactPerson {
  name: string;
  phone: string;
  department: string;
  isExtension: boolean;
}

export interface ClientContact {
  email: string;
  email_department?: string;
  additional_emails: AdditionalEmail[];
  phone_number: string;
  additional_phone_numbers: AdditionalPhone[];
  contact_persons: ClientContactPerson[];
  website?: string | null;
  website_information?: string;
  comercial_references?: string;
  instagram: string;
  facebook: string;
}

export interface Client {
  id: string;
  code?: string;
  identity: ClientIdentity;
  address: ClientAddress;
  contact: ClientContact;
}

export type ClientType = 'PJ' | 'PF';

export function isCompanyClient(identity: ClientIdentity): identity is ClientIdentityPJ {
  return 'cnpj' in identity;
}

export function isIndividualClient(identity: ClientIdentity): identity is ClientIdentityPF {
  return 'cpf' in identity;
}

export function getClientName(client: Client): string {
  if (isCompanyClient(client.identity)) {
    return client.identity.company_fantasy_name || client.identity.company_name;
  }
  return client.identity.fantasy_name || client.identity.name;
}

export function getClientDocument(client: Client): string {
  if (isCompanyClient(client.identity)) return client.identity.cnpj;
  return client.identity.cpf;
}

export function getClientType(client: Client): ClientType {
  return isCompanyClient(client.identity) ? 'PJ' : 'PF';
}

export function isClientActive(client: Client): boolean {
  return !client.identity.defaulter;
}

export function buildGoogleMapsUrl(address: ClientAddress): string {
  const parts = [
    address.street,
    address.street_number,
    address.district,
    address.city,
    address.state,
    address.cep,
  ].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

export function formatAddressShort(address: ClientAddress): string {
  const line1 = [address.street, address.street_number].filter(Boolean).join(', ');
  const line2 = [address.district, `${address.city}/${address.state}`].filter(Boolean).join(' — ');
  return [line1, line2].filter(Boolean).join('\n');
}

export interface ClientsPagination {
  total_items: number;
  request_total_items: number;
}

export interface ClientsResponse {
  pagination: ClientsPagination;
  data: Client[];
}

export interface FetchClientsParams {
  page?: number;
  perPage?: number;
  search?: string;
  supplier?: boolean;
}

export interface CreateCompanyPayload {
  identity: {
    cnpj: string;
    company_name: string;
    company_fantasy_name: string;
    company_city_registration: string;
    company_state_registration: string;
    tax_regime: string;
    rate_differential: string;
    defaulter: boolean;
    supplier: boolean;
    prospection: boolean;
  };
  address: ClientAddress;
  contact: {
    email: string;
    email_department: string;
    additional_emails: AdditionalEmail[];
    phone_number: string;
    additional_phone_numbers: AdditionalPhone[];
    website: string;
    comercial_references: string;
    instagram: string;
    facebook: string;
    contact_persons: ClientContactPerson[];
  };
  id: string;
}

export interface CreateIndividualPayload {
  identity: {
    cpf: string;
    name: string;
    fantasy_name: string;
    defaulter: boolean;
    supplier: boolean;
    prospection: boolean;
  };
  address: ClientAddress;
  contact: {
    email: string;
    email_department: string;
    additional_emails: AdditionalEmail[];
    phone_number: string;
    additional_phone_numbers: AdditionalPhone[];
    website_information: string;
    instagram: string;
    facebook: string;
    contact_persons: ClientContactPerson[];
  };
  id: string;
  code: string;
}

interface RawClientDetailResponse {
  data: Client;
}

export async function fetchClients(params: FetchClientsParams): Promise<ClientsResponse> {
  const { page = 1, perPage = 10, search = '', supplier } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);

  const { data } = await api.get<ClientsResponse>(`/clients/?${query.toString()}`);

  const filtered = supplier === undefined
    ? data.data
    : data.data.filter((c) => c.identity.supplier === supplier);

  return {
    pagination: { ...data.pagination, total_items: filtered.length },
    data: filtered,
  };
}

export async function getClientById(id: string): Promise<Client> {
  const { data } = await api.get<RawClientDetailResponse>(`/clients/${id}`);
  return data.data;
}

export interface CreateClientResponse {
  client?: {
    client_id?: string;
    name?: string;
    company_fantasy_name?: string;
    company_name?: string;
  };
  data?: {
    client?: {
      client_id?: string;
      name?: string;
      company_fantasy_name?: string;
      company_name?: string;
    };
  };
}

function extractClientFromResponse(res: CreateClientResponse): { client_id: string; name?: string; company_fantasy_name?: string; company_name?: string } | null {
  const client = res?.client ?? res?.data?.client;
  if (client?.client_id) return client as { client_id: string; name?: string; company_fantasy_name?: string; company_name?: string };
  return null;
}

export async function createCompanyClient(payload: CreateCompanyPayload): Promise<CreateClientResponse> {
  const { data } = await api.post('/clients/company', payload);
  return data;
}

export async function createIndividualClient(payload: CreateIndividualPayload): Promise<CreateClientResponse> {
  const { data } = await proxyApi.post('/clients/individual', payload);
  return data;
}

export { extractClientFromResponse };

export async function updateCompanyClient(id: string, payload: CreateCompanyPayload): Promise<void> {
  await api.put(`/clients/company/${id}`, payload);
}

export async function updateIndividualClient(id: string, payload: CreateIndividualPayload): Promise<void> {
  await proxyApi.put(`/clients/individual/${id}`, payload);
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}

export async function toggleClientStatus(id: string): Promise<void> {
  await api.put(`/clients/${id}/alter-status/`);
}
