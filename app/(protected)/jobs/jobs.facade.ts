import { api } from '@/lib/axios';

export interface Job {
  id: string;
  job_id: string;
  service_name: string;
  service_code: string;
  technical_description: string;
  application_methods: string;
  application_method_amount: number;
  value: string;
  related_taxes: string;
  allocation_group: string;
  related_service_family: string;
  income_statement: string;
  financial_reports: string;
  add_with_products: boolean;
  requires_pickup: boolean;
  responsible_department: string;
  allow_recurring_contract: boolean;
  average_execution_time: number;
  status: boolean;
  tags_keywords: string;
  company_id: string;
}

export interface JobsPagination {
  total_items: number;
  request_total_items: number;
}

export interface JobsResponse {
  pagination: JobsPagination;
  data: Job[];
}

export interface FetchJobsParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface CreateJobPayload {
  service_name: string;
  service_code: string;
  technical_description: string;
  application_methods: string;
  application_method_amount: number;
  value: string;
  related_taxes: string;
  allocation_group: string;
  related_service_family: string;
  income_statement: string;
  financial_reports: string;
  add_with_products: boolean;
  requires_pickup: boolean;
  responsible_department: string;
  allow_recurring_contract: boolean;
  average_execution_time: number;
  status: boolean;
  tags_keywords: string;
}

export type UpdateJobPayload = CreateJobPayload;

interface RawJob {
  job_id: string;
  service_name: string;
  service_code: string;
  technical_description: string;
  application_methods: string;
  application_method_amount: number;
  value: string;
  related_taxes: string;
  allocation_group: string;
  related_service_family: string;
  income_statement: string;
  financial_reports: string;
  add_with_products: boolean;
  requires_pickup: boolean;
  responsible_department: string;
  allow_recurring_contract: boolean;
  average_execution_time: number;
  status: boolean;
  tags_keywords: string;
  company_id: string;
}

interface RawJobsResponse {
  pagination: JobsPagination;
  data: RawJob[];
}

interface RawJobDetailResponse {
  job: RawJob;
}

function normalizeJob(raw: RawJob): Job {
  return { ...raw, id: raw.job_id };
}

export async function fetchJobs(params: FetchJobsParams = {}): Promise<JobsResponse> {
  const { page = 1, perPage = 10, search = '' } = params;
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('per_page', String(perPage));
  if (search) query.set('search_term', search);
  const { data } = await api.get<RawJobsResponse>(`/jobs/?${query.toString()}`);
  return {
    pagination: data.pagination,
    data: data.data.map(normalizeJob),
  };
}

export async function getJobById(id: string): Promise<Job> {
  const { data } = await api.get<RawJobDetailResponse>(`/jobs/${id}`);
  return normalizeJob(data.job);
}

export async function createJob(payload: CreateJobPayload): Promise<void> {
  await api.post('/jobs/create', payload);
}

export async function updateJob(id: string, payload: UpdateJobPayload): Promise<void> {
  await api.put(`/jobs/${id}`, payload);
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/jobs/${id}`);
}
